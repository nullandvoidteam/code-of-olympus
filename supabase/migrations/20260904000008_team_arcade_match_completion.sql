-- Migration: Team Arcade Match Completion & Final Scoring
-- Description: Updates record_team_match_submission to check for match completion, calculate final team scores when all required results are available, and return completion status.

CREATE OR REPLACE FUNCTION public.record_team_match_submission(
  p_match_id UUID,
  p_exercise_id UUID,
  p_code TEXT,
  p_language TEXT,
  p_status TEXT,
  p_passed_count INT,
  p_total_count INT,
  p_execution_time_ms INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_match RECORD;
  v_team_id UUID;
  v_submission RECORD;
  v_existing_status TEXT;
  v_combat_pts INT := 0;
  v_result TEXT := 'wrong';
  v_team_a_participants INT := 0;
  v_team_a_pts INT := 0;
  v_team_a_avg NUMERIC(6,2) := 0;
  v_team_b_participants INT := 0;
  v_team_b_pts INT := 0;
  v_team_b_avg NUMERIC(6,2) := 0;
  v_total_questions INT := 0;
  v_caller_submissions_count INT := 0;
  v_player_completed BOOLEAN := false;
  v_incomplete_count INT := 0;
  v_match_completed BOOLEAN := false;
BEGIN
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Retrieve match
  SELECT * INTO v_match
  FROM public.arcade_team_matches
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found.');
  END IF;

  -- Identify caller's team in this match
  SELECT team_id INTO v_team_id
  FROM public.arcade_team_members
  WHERE user_id = v_caller_id AND (team_id = v_match.team_a_id OR team_id = v_match.team_b_id)
  LIMIT 1;

  IF v_team_id IS NULL AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a participant in this match.');
  END IF;

  IF v_team_id IS NULL AND public.is_admin() THEN
    v_team_id := v_match.team_a_id;
  END IF;

  -- Check match status & expiry
  IF v_match.status <> 'in_progress' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match is not currently in progress (' || v_match.status || ').');
  END IF;

  IF v_match.ended_at IS NOT NULL AND now() > v_match.ended_at THEN
    PERFORM public.conclude_team_match(p_match_id);
    RETURN jsonb_build_object('success', false, 'error', 'Match time has expired. Submissions are closed.');
  END IF;

  -- Prevent answering the same question multiple times
  SELECT status INTO v_existing_status
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND user_id = v_caller_id AND exercise_id = p_exercise_id;

  IF v_existing_status IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This question has already been answered and submitted.'
    );
  END IF;

  -- Combat Points & Result: 100 points per successful quest solve ('correct')
  IF LOWER(p_status) = 'passed' THEN
    v_combat_pts := 100;
    v_result := 'correct';
  ELSE
    v_combat_pts := 0;
    v_result := 'wrong';
  END IF;

  -- Insert persistent submission record
  INSERT INTO public.arcade_team_match_submissions (
    match_id,
    team_id,
    user_id,
    exercise_id,
    code,
    language,
    status,
    result,
    passed_count,
    total_count,
    execution_time_ms,
    combat_points,
    submitted_at,
    created_at,
    updated_at
  )
  VALUES (
    p_match_id,
    v_team_id,
    v_caller_id,
    p_exercise_id,
    p_code,
    p_language,
    LOWER(p_status),
    v_result,
    p_passed_count,
    p_total_count,
    p_execution_time_ms,
    v_combat_pts,
    now(),
    now(),
    now()
  )
  RETURNING * INTO v_submission;

  -- Compute live team averages
  -- Team A
  SELECT 
    COUNT(DISTINCT user_id),
    COALESCE(SUM(combat_points), 0)
  INTO v_team_a_participants, v_team_a_pts
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND team_id = v_match.team_a_id;

  IF v_team_a_participants > 0 THEN
    v_team_a_avg := ROUND(v_team_a_pts::numeric / v_team_a_participants, 2);
  ELSE
    v_team_a_avg := 0;
  END IF;

  -- Team B
  SELECT 
    COUNT(DISTINCT user_id),
    COALESCE(SUM(combat_points), 0)
  INTO v_team_b_participants, v_team_b_pts
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND team_id = v_match.team_b_id;

  IF v_team_b_participants > 0 THEN
    v_team_b_avg := ROUND(v_team_b_pts::numeric / v_team_b_participants, 2);
  ELSE
    v_team_b_avg := 0;
  END IF;

  -- Persist updated team averages to match record
  UPDATE public.arcade_team_matches
  SET 
    team_a_score = v_team_a_avg,
    team_b_score = v_team_b_avg,
    updated_at = now()
  WHERE id = p_match_id;

  -- Determine player completion
  v_total_questions := COALESCE(array_length(v_match.selected_exercise_ids, 1), v_match.question_count);

  SELECT COUNT(DISTINCT exercise_id) INTO v_caller_submissions_count
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND user_id = v_caller_id;

  IF v_caller_submissions_count >= v_total_questions THEN
    v_player_completed := true;
  END IF;

  -- If all participating users in the match have answered all questions, conclude match automatically
  SELECT COUNT(*) INTO v_incomplete_count
  FROM (
    SELECT user_id
    FROM public.arcade_team_match_submissions
    WHERE match_id = p_match_id
    GROUP BY user_id
    HAVING COUNT(DISTINCT exercise_id) < v_total_questions
  ) sub;

  IF v_incomplete_count = 0 AND v_team_a_participants > 0 AND v_team_b_participants > 0 THEN
    PERFORM public.conclude_team_match(p_match_id);
    v_match_completed := true;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'submission', row_to_json(v_submission),
    'result', v_result,
    'combat_points', v_combat_pts,
    'status', LOWER(p_status),
    'team_a_score', v_team_a_avg,
    'team_b_score', v_team_b_avg,
    'player_completed', v_player_completed,
    'match_completed', v_match_completed
  );
END;
$$;

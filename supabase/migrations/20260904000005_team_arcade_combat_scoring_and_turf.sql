-- Migration: Team Arcade Combat Scoring, Match Result & Turf Capture
-- Description: Combat points tracking, team average calculation, match conclusion with KILLER COMBAT / WE ARE SAFE / YOUR TURF CAPTURED, idempotent turf transfer, and team turf state.

-- 1. Add turf_count to arcade_teams
ALTER TABLE public.arcade_teams
  ADD COLUMN IF NOT EXISTS turf_count INTEGER NOT NULL DEFAULT 1 CHECK (turf_count >= 0);

-- 2. Add scoring and turf transfer tracking to arcade_team_matches
ALTER TABLE public.arcade_team_matches
  ADD COLUMN IF NOT EXISTS team_a_score NUMERIC(6,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_b_score NUMERIC(6,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS turf_transferred BOOLEAN DEFAULT false;

-- 3. Add combat_points to arcade_team_match_submissions
ALTER TABLE public.arcade_team_match_submissions
  ADD COLUMN IF NOT EXISTS combat_points INTEGER NOT NULL DEFAULT 0;

-- 4. Update record_team_match_submission to compute combat points & live team averages
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
  v_team_a_participants INT := 0;
  v_team_a_pts INT := 0;
  v_team_a_avg NUMERIC(6,2) := 0;
  v_team_b_participants INT := 0;
  v_team_b_pts INT := 0;
  v_team_b_avg NUMERIC(6,2) := 0;
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
    -- Match has expired, auto-conclude
    PERFORM public.conclude_team_match(p_match_id);
    RETURN jsonb_build_object('success', false, 'error', 'Match time has expired. Submissions are closed.');
  END IF;

  -- Combat Points: 100 points per successful quest solve
  IF LOWER(p_status) = 'passed' THEN
    v_combat_pts := 100;
  ELSE
    v_combat_pts := 0;
  END IF;

  -- Check existing status
  SELECT status INTO v_existing_status
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND user_id = v_caller_id AND exercise_id = p_exercise_id;

  -- If previously passed, keep passed status and 100 combat points
  IF v_existing_status = 'passed' AND LOWER(p_status) <> 'passed' THEN
    UPDATE public.arcade_team_match_submissions
    SET 
      code = p_code,
      updated_at = now()
    WHERE match_id = p_match_id AND user_id = v_caller_id AND exercise_id = p_exercise_id
    RETURNING * INTO v_submission;
  ELSE
    INSERT INTO public.arcade_team_match_submissions (
      match_id,
      team_id,
      user_id,
      exercise_id,
      code,
      language,
      status,
      passed_count,
      total_count,
      execution_time_ms,
      combat_points,
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
      p_passed_count,
      p_total_count,
      p_execution_time_ms,
      v_combat_pts,
      now()
    )
    ON CONFLICT (match_id, user_id, exercise_id)
    DO UPDATE SET
      code = EXCLUDED.code,
      language = EXCLUDED.language,
      status = EXCLUDED.status,
      passed_count = EXCLUDED.passed_count,
      total_count = EXCLUDED.total_count,
      execution_time_ms = EXCLUDED.execution_time_ms,
      combat_points = EXCLUDED.combat_points,
      updated_at = now()
    RETURNING * INTO v_submission;
  END IF;

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

  -- Update running averages in match record
  UPDATE public.arcade_team_matches
  SET 
    team_a_score = v_team_a_avg,
    team_b_score = v_team_b_avg,
    updated_at = now()
  WHERE id = p_match_id;

  RETURN jsonb_build_object(
    'success', true,
    'submission', row_to_json(v_submission),
    'team_a_score', v_team_a_avg,
    'team_b_score', v_team_b_avg
  );
END;
$$;

-- 5. RPC: Conclude Team Match, calculate final averages, assign result & transfer turf
CREATE OR REPLACE FUNCTION public.conclude_team_match(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_match RECORD;
  v_team_a_participants INT := 0;
  v_team_a_pts INT := 0;
  v_team_a_avg NUMERIC(6,2) := 0;
  v_team_b_participants INT := 0;
  v_team_b_pts INT := 0;
  v_team_b_avg NUMERIC(6,2) := 0;
  v_winner_id UUID := NULL;
  v_loser_id UUID := NULL;
  v_result_type TEXT := 'WE ARE SAFE';
  v_turf_transferred BOOLEAN := false;
  v_updated_match RECORD;
BEGIN
  -- Lock match row
  SELECT * INTO v_match
  FROM public.arcade_team_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found.');
  END IF;

  -- Idempotency protection: If match is already completed and turf transferred, do not re-process
  IF v_match.status = 'completed' AND v_match.turf_transferred IS TRUE THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'completed',
      'match', row_to_json(v_match),
      'already_concluded', true
    );
  END IF;

  -- Calculate Team A average Combat Points of its participating players
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

  -- Calculate Team B average Combat Points of its participating players
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

  -- Determine result:
  -- Higher average -> KILLER COMBAT
  -- Equal average -> WE ARE SAFE
  IF v_team_a_avg > v_team_b_avg THEN
    v_winner_id := v_match.team_a_id;
    v_loser_id := v_match.team_b_id;
    v_result_type := 'KILLER COMBAT';
  ELSIF v_team_b_avg > v_team_a_avg THEN
    v_winner_id := v_match.team_b_id;
    v_loser_id := v_match.team_a_id;
    v_result_type := 'KILLER COMBAT';
  ELSE
    v_winner_id := NULL;
    v_loser_id := NULL;
    v_result_type := 'WE ARE SAFE';
  END IF;

  -- Turf transfer: transfer 1 turf from loser to winner
  IF v_winner_id IS NOT NULL AND (v_match.turf_transferred IS NOT TRUE) THEN
    -- Decrement loser turf (cannot drop below 0)
    UPDATE public.arcade_teams
    SET turf_count = GREATEST(0, turf_count - 1), updated_at = now()
    WHERE id = v_loser_id;

    -- Increment winner turf
    UPDATE public.arcade_teams
    SET turf_count = turf_count + 1, updated_at = now()
    WHERE id = v_winner_id;

    v_turf_transferred := true;
  ELSE
    v_turf_transferred := COALESCE(v_match.turf_transferred, false);
  END IF;

  -- Persist match outcome
  UPDATE public.arcade_team_matches
  SET 
    status = 'completed',
    winner_team_id = v_winner_id,
    result_type = v_result_type,
    team_a_score = v_team_a_avg,
    team_b_score = v_team_b_avg,
    turf_transferred = v_turf_transferred,
    ended_at = COALESCE(ended_at, now()),
    updated_at = now()
  WHERE id = p_match_id
  RETURNING * INTO v_updated_match;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'completed',
    'result_type', v_result_type,
    'winner_team_id', v_winner_id,
    'team_a_score', v_team_a_avg,
    'team_b_score', v_team_b_avg,
    'turf_transferred', v_turf_transferred,
    'match', row_to_json(v_updated_match)
  );
END;
$$;

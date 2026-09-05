-- Migration: Update Arcade Battle Configuration & Strict Pool Validation
-- Description: Supports question count 1-20, verifies pool before match creation, ensures identical selected question IDs for both teams, and halts if pool is insufficient.

-- 1. Update question_count check constraints to 1-20
ALTER TABLE public.arcade_team_challenges 
  DROP CONSTRAINT IF EXISTS arcade_team_challenges_question_count_check;

ALTER TABLE public.arcade_team_challenges 
  ADD CONSTRAINT arcade_team_challenges_question_count_check 
  CHECK (question_count >= 1 AND question_count <= 20);

ALTER TABLE public.arcade_team_matches 
  DROP CONSTRAINT IF EXISTS arcade_team_matches_question_count_check;

ALTER TABLE public.arcade_team_matches 
  ADD CONSTRAINT arcade_team_matches_question_count_check 
  CHECK (question_count >= 1 AND question_count <= 20);

-- 2. Helper RPC: Check pool availability for immediate UI feedback
CREATE OR REPLACE FUNCTION public.check_arcade_pool_availability(
  p_language TEXT,
  p_difficulty TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_lang TEXT := LOWER(TRIM(COALESCE(p_language, 'javascript')));
  v_clean_diff TEXT := TRIM(COALESCE(p_difficulty, 'Medium'));
  v_count INT := 0;
BEGIN
  SELECT COUNT(*)::INT INTO v_count
  FROM public.challenges c
  WHERE c.is_published = true
    AND (
      LOWER(c.language) = LOWER(v_clean_lang)
      OR LOWER(v_clean_lang) IN ('all', 'any')
    )
    AND (
      LOWER(c.difficulty) = LOWER(v_clean_diff)
      OR (LOWER(v_clean_diff) = 'easy' AND LOWER(c.difficulty) IN ('easy', 'beginner'))
      OR (LOWER(v_clean_diff) = 'medium' AND LOWER(c.difficulty) IN ('medium', 'intermediate'))
      OR (LOWER(v_clean_diff) = 'hard' AND LOWER(c.difficulty) IN ('hard', 'advanced', 'expert'))
      OR LOWER(v_clean_diff) IN ('all', 'any')
    );

  RETURN jsonb_build_object(
    'success', true,
    'available_count', v_count,
    'language', v_clean_lang,
    'difficulty', v_clean_diff
  );
END;
$$;

-- 3. Update send_team_challenge with 1-20 range & pool verification
CREATE OR REPLACE FUNCTION public.send_team_challenge(
  p_challenger_team_id UUID,
  p_challenged_team_id UUID,
  p_language TEXT,
  p_difficulty TEXT,
  p_question_count INT DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_clean_lang TEXT := LOWER(TRIM(COALESCE(p_language, 'javascript')));
  v_clean_diff TEXT := TRIM(COALESCE(p_difficulty, 'Medium'));
  v_count INT := COALESCE(p_question_count, 3);
  v_pool_count INT := 0;
  v_new_challenge RECORD;
BEGIN
  -- Validate caller authentication
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Validate caller membership in challenger team
  IF NOT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE team_id = p_challenger_team_id AND user_id = v_caller_id
  ) AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must be a member of the challenging squad.');
  END IF;

  -- Prevent challenging own team
  IF p_challenger_team_id = p_challenged_team_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot challenge your own squad.');
  END IF;

  -- Validate question count (1 to 20)
  IF v_count < 1 OR v_count > 20 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Question count must be between 1 and 20.');
  END IF;

  -- Validate both teams exist and are active
  IF NOT EXISTS (SELECT 1 FROM public.arcade_teams WHERE id = p_challenger_team_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenger squad is not active.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.arcade_teams WHERE id = p_challenged_team_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenged squad is not active.');
  END IF;

  -- Verify enough published questions exist for selected Language + Difficulty
  SELECT COUNT(*)::INT INTO v_pool_count
  FROM public.challenges c
  WHERE c.is_published = true
    AND (
      LOWER(c.language) = LOWER(v_clean_lang)
      OR LOWER(v_clean_lang) IN ('all', 'any')
    )
    AND (
      LOWER(c.difficulty) = LOWER(v_clean_diff)
      OR (LOWER(v_clean_diff) = 'easy' AND LOWER(c.difficulty) IN ('easy', 'beginner'))
      OR (LOWER(v_clean_diff) = 'medium' AND LOWER(c.difficulty) IN ('medium', 'intermediate'))
      OR (LOWER(v_clean_diff) = 'hard' AND LOWER(c.difficulty) IN ('hard', 'advanced', 'expert'))
      OR LOWER(v_clean_diff) IN ('all', 'any')
    );

  IF v_pool_count < v_count THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient questions in the ' || v_clean_diff || ' ' || v_clean_lang || ' pool (' || v_pool_count || ' available, ' || v_count || ' requested).'
    );
  END IF;

  -- Prevent duplicate active pending challenge between the same teams (in either direction)
  IF EXISTS (
    SELECT 1 FROM public.arcade_team_challenges
    WHERE ((challenger_team_id = p_challenger_team_id AND challenged_team_id = p_challenged_team_id)
       OR  (challenger_team_id = p_challenged_team_id AND challenged_team_id = p_challenger_team_id))
      AND status = 'pending'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A pending challenge already exists between these squads.');
  END IF;

  -- Insert challenge
  INSERT INTO public.arcade_team_challenges (
    challenger_team_id,
    challenged_team_id,
    language,
    difficulty,
    question_count,
    status
  )
  VALUES (
    p_challenger_team_id,
    p_challenged_team_id,
    v_clean_lang,
    v_clean_diff,
    v_count,
    'pending'
  )
  RETURNING * INTO v_new_challenge;

  RETURN jsonb_build_object(
    'success', true,
    'challenge', row_to_json(v_new_challenge)
  );
END;
$$;

-- 4. Update respond_to_team_challenge with strict pool verification and atomic identical question selection
CREATE OR REPLACE FUNCTION public.respond_to_team_challenge(
  p_challenge_id UUID,
  p_response TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_challenge RECORD;
  v_action TEXT := LOWER(TRIM(p_response));
  v_selected_exercise_ids JSONB := '[]'::jsonb;
  v_match_id UUID;
  v_match RECORD;
  v_pool_count INT := 0;
BEGIN
  -- Validate caller authentication
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Validate response action
  IF v_action NOT IN ('accepted', 'declined') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid response action.');
  END IF;

  -- Lock and retrieve challenge
  SELECT * INTO v_challenge
  FROM public.arcade_team_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found.');
  END IF;

  IF v_challenge.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge is no longer pending (' || v_challenge.status || ').');
  END IF;

  -- Verify caller belongs to challenged team (or is admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE team_id = v_challenge.challenged_team_id AND user_id = v_caller_id
  ) AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only members of the challenged squad can respond.');
  END IF;

  -- If declined
  IF v_action = 'declined' THEN
    UPDATE public.arcade_team_challenges
    SET status = 'declined', updated_at = now()
    WHERE id = p_challenge_id;

    RETURN jsonb_build_object('success', true, 'status', 'declined');
  END IF;

  -- If accepted: randomly select requested number of unique published questions
  SELECT COALESCE(jsonb_agg(sub.id), '[]'::jsonb)
  INTO v_selected_exercise_ids
  FROM (
    SELECT c.id
    FROM public.challenges c
    WHERE c.is_published = true
      AND (
        LOWER(c.language) = LOWER(v_challenge.language)
        OR LOWER(v_challenge.language) IN ('all', 'any')
      )
      AND (
        LOWER(c.difficulty) = LOWER(v_challenge.difficulty)
        OR (LOWER(v_challenge.difficulty) = 'easy' AND LOWER(c.difficulty) IN ('easy', 'beginner'))
        OR (LOWER(v_challenge.difficulty) = 'medium' AND LOWER(c.difficulty) IN ('medium', 'intermediate'))
        OR (LOWER(v_challenge.difficulty) = 'hard' AND LOWER(c.difficulty) IN ('hard', 'advanced', 'expert'))
        OR LOWER(v_challenge.difficulty) IN ('all', 'any')
      )
    ORDER BY random()
    LIMIT v_challenge.question_count
  ) sub;

  -- Verify the pool was sufficient; if not, prevent match creation and return clear error
  IF jsonb_array_length(v_selected_exercise_ids) < v_challenge.question_count THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot start match: Insufficient published questions in ' || v_challenge.difficulty || ' ' || v_challenge.language || ' pool (' || jsonb_array_length(v_selected_exercise_ids) || ' found, ' || v_challenge.question_count || ' required).'
    );
  END IF;

  -- Mark challenge as accepted
  UPDATE public.arcade_team_challenges
  SET status = 'accepted', updated_at = now()
  WHERE id = p_challenge_id;

  -- Create single match record in arcade_team_matches with the exact selected question IDs
  INSERT INTO public.arcade_team_matches (
    team_a_id,
    team_b_id,
    language,
    difficulty,
    question_count,
    selected_exercise_ids,
    status
  )
  VALUES (
    v_challenge.challenger_team_id,
    v_challenge.challenged_team_id,
    v_challenge.language,
    v_challenge.difficulty,
    v_challenge.question_count,
    v_selected_exercise_ids,
    'lobby'
  )
  RETURNING * INTO v_match;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'accepted',
    'match_id', v_match.id,
    'match', row_to_json(v_match)
  );
END;
$$;

-- Migration: Create Team Arcade Match Submissions & Gameplay RPCs
-- Description: Minimal tracking for individual player submissions per question in team matches, match start with timer, and strict expiry enforcement.

-- 1. Create arcade_team_match_submissions table
CREATE TABLE IF NOT EXISTS public.arcade_team_match_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.arcade_team_matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'execution_error', 'timeout')),
  passed_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  execution_time_ms INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_arcade_team_match_user_exercise UNIQUE (match_id, user_id, exercise_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_arcade_match_submissions_match ON public.arcade_team_match_submissions (match_id);
CREATE INDEX IF NOT EXISTS idx_arcade_match_submissions_user ON public.arcade_team_match_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_arcade_match_submissions_team ON public.arcade_team_match_submissions (team_id);

-- 2. Enable RLS
ALTER TABLE public.arcade_team_match_submissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Match participants view match submissions" ON public.arcade_team_match_submissions;
CREATE POLICY "Match participants view match submissions"
ON public.arcade_team_match_submissions
FOR SELECT
TO authenticated
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.arcade_team_members m
    JOIN public.arcade_team_matches tm ON tm.id = match_id
    WHERE m.user_id = auth.uid()
      AND (m.team_id = tm.team_a_id OR m.team_id = tm.team_b_id)
  )
);

DROP POLICY IF EXISTS "Users insert own match submission" ON public.arcade_team_match_submissions;
CREATE POLICY "Users insert own match submission"
ON public.arcade_team_match_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.arcade_team_members m
      JOIN public.arcade_team_matches tm ON tm.id = match_id
      WHERE m.user_id = auth.uid()
        AND (m.team_id = tm.team_a_id OR m.team_id = tm.team_b_id)
        AND m.team_id = arcade_team_match_submissions.team_id
        AND tm.status = 'in_progress'
        AND (tm.ended_at IS NULL OR tm.ended_at > now())
    )
  )
);

DROP POLICY IF EXISTS "Users update own match submission" ON public.arcade_team_match_submissions;
CREATE POLICY "Users update own match submission"
ON public.arcade_team_match_submissions
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.arcade_team_members m
      JOIN public.arcade_team_matches tm ON tm.id = match_id
      WHERE m.user_id = auth.uid()
        AND (m.team_id = tm.team_a_id OR m.team_id = tm.team_b_id)
        AND m.team_id = arcade_team_match_submissions.team_id
        AND tm.status = 'in_progress'
        AND (tm.ended_at IS NULL OR tm.ended_at > now())
    )
  )
)
WITH CHECK (
  user_id = auth.uid()
);

-- 4. RPC: Start Team Match (Lobby -> in_progress)
CREATE OR REPLACE FUNCTION public.start_team_match(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_match RECORD;
  v_duration_mins INT;
BEGIN
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  SELECT * INTO v_match
  FROM public.arcade_team_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found.');
  END IF;

  -- Validate caller belongs to team_a or team_b
  IF NOT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE user_id = v_caller_id AND (team_id = v_match.team_a_id OR team_id = v_match.team_b_id)
  ) AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a participant in this match.');
  END IF;

  -- If already in_progress, return match
  IF v_match.status = 'in_progress' THEN
    RETURN jsonb_build_object('success', true, 'status', 'in_progress', 'match', row_to_json(v_match));
  END IF;

  IF v_match.status IN ('completed', 'abandoned') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match has already concluded.');
  END IF;

  -- Calculate duration: 5 minutes per question, min 10m, max 60m
  v_duration_mins := GREATEST(10, LEAST(60, COALESCE(v_match.question_count, 3) * 5));

  UPDATE public.arcade_team_matches
  SET 
    status = 'in_progress',
    started_at = COALESCE(started_at, now()),
    ended_at = now() + (v_duration_mins * interval '1 minute'),
    updated_at = now()
  WHERE id = p_match_id
  RETURNING * INTO v_match;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'in_progress',
    'match', row_to_json(v_match)
  );
END;
$$;

-- 5. RPC: Record Team Match Submission
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
BEGIN
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Lock match record
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

  -- Check match state and timer
  IF v_match.status <> 'in_progress' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match is not currently in progress (' || v_match.status || ').');
  END IF;

  IF v_match.ended_at IS NOT NULL AND now() > v_match.ended_at THEN
    -- Automatically conclude if timer has expired
    UPDATE public.arcade_team_matches
    SET status = 'completed', updated_at = now()
    WHERE id = p_match_id;

    RETURN jsonb_build_object('success', false, 'error', 'Match time has expired. Submissions are closed.');
  END IF;

  -- Check existing submission status
  SELECT status INTO v_existing_status
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND user_id = v_caller_id AND exercise_id = p_exercise_id;

  -- If previously passed, keep status as passed
  IF v_existing_status = 'passed' AND p_status <> 'passed' THEN
    -- Update code without downgrading passed status
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
      updated_at
    )
    VALUES (
      p_match_id,
      v_team_id,
      v_caller_id,
      p_exercise_id,
      p_code,
      p_language,
      p_status,
      p_passed_count,
      p_total_count,
      p_execution_time_ms,
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
      updated_at = now()
    RETURNING * INTO v_submission;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'submission', row_to_json(v_submission)
  );
END;
$$;

-- 6. Add to Realtime publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_team_match_submissions;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

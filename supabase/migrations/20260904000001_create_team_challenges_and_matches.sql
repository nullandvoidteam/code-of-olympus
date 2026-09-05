-- Migration: Create Team vs Team Challenges & Matches Foundation
-- Description: Foundation for team-vs-team challenges, atomic match creation with question sampling, and RLS policies

-- 1. Create arcade_team_challenges table
CREATE TABLE IF NOT EXISTS public.arcade_team_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  challenged_team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  language TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 3 CHECK (question_count >= 1 AND question_count <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_team_challenges_different_teams CHECK (challenger_team_id <> challenged_team_id)
);

-- Indexes for challenge queries
CREATE INDEX IF NOT EXISTS idx_arcade_team_challenges_challenger ON public.arcade_team_challenges (challenger_team_id);
CREATE INDEX IF NOT EXISTS idx_arcade_team_challenges_challenged ON public.arcade_team_challenges (challenged_team_id);
CREATE INDEX IF NOT EXISTS idx_arcade_team_challenges_status ON public.arcade_team_challenges (status);

-- Partial unique index to prevent duplicate pending challenges in the same direction
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_team_challenge 
ON public.arcade_team_challenges (challenger_team_id, challenged_team_id) 
WHERE status = 'pending';

-- 2. Create arcade_team_matches table
CREATE TABLE IF NOT EXISTS public.arcade_team_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  team_b_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 3 CHECK (question_count >= 1 AND question_count <= 10),
  selected_exercise_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_progress', 'completed', 'abandoned')),
  winner_team_id UUID REFERENCES public.arcade_teams(id) ON DELETE SET NULL,
  result_type TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_team_matches_different_teams CHECK (team_a_id <> team_b_id)
);

-- Indexes for match queries
CREATE INDEX IF NOT EXISTS idx_arcade_team_matches_team_a ON public.arcade_team_matches (team_a_id);
CREATE INDEX IF NOT EXISTS idx_arcade_team_matches_team_b ON public.arcade_team_matches (team_b_id);
CREATE INDEX IF NOT EXISTS idx_arcade_team_matches_status ON public.arcade_team_matches (status);

-- 3. Enable RLS
ALTER TABLE public.arcade_team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcade_team_matches ENABLE ROW LEVEL SECURITY;

-- 4. RLS for arcade_team_challenges
DROP POLICY IF EXISTS "Team members view own challenges" ON public.arcade_team_challenges;
CREATE POLICY "Team members view own challenges"
ON public.arcade_team_challenges
FOR SELECT
TO authenticated
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.arcade_team_members m
    WHERE m.user_id = auth.uid()
      AND (m.team_id = arcade_team_challenges.challenger_team_id OR m.team_id = arcade_team_challenges.challenged_team_id)
  )
);

DROP POLICY IF EXISTS "Team members insert challenge" ON public.arcade_team_challenges;
CREATE POLICY "Team members insert challenge"
ON public.arcade_team_challenges
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.arcade_team_members m
    WHERE m.user_id = auth.uid()
      AND m.team_id = challenger_team_id
  )
);

DROP POLICY IF EXISTS "Team members update challenge" ON public.arcade_team_challenges;
CREATE POLICY "Team members update challenge"
ON public.arcade_team_challenges
FOR UPDATE
TO authenticated
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.arcade_team_members m
    WHERE m.user_id = auth.uid()
      AND (m.team_id = arcade_team_challenges.challenged_team_id OR m.team_id = arcade_team_challenges.challenger_team_id)
  )
)
WITH CHECK (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.arcade_team_members m
    WHERE m.user_id = auth.uid()
      AND (m.team_id = arcade_team_challenges.challenged_team_id OR m.team_id = arcade_team_challenges.challenger_team_id)
  )
);

-- 5. RLS for arcade_team_matches
DROP POLICY IF EXISTS "Participating team members view matches" ON public.arcade_team_matches;
CREATE POLICY "Participating team members view matches"
ON public.arcade_team_matches
FOR SELECT
TO authenticated
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.arcade_team_members m
    WHERE m.user_id = auth.uid()
      AND (m.team_id = arcade_team_matches.team_a_id OR m.team_id = arcade_team_matches.team_b_id)
  )
);

DROP POLICY IF EXISTS "Participating team members update matches" ON public.arcade_team_matches;
CREATE POLICY "Participating team members update matches"
ON public.arcade_team_matches
FOR UPDATE
TO authenticated
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.arcade_team_members m
    WHERE m.user_id = auth.uid()
      AND (m.team_id = arcade_team_matches.team_a_id OR m.team_id = arcade_team_matches.team_b_id)
  )
);

-- 6. RPC: Search eligible active teams for challenges
CREATE OR REPLACE FUNCTION public.search_eligible_arcade_teams(
  p_user_id UUID,
  p_query TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  code VARCHAR(6),
  member_count INT,
  captain_id UUID,
  captain_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_team_id UUID;
  v_clean_query TEXT := trim(COALESCE(p_query, ''));
BEGIN
  -- Get the current user's team ID to exclude it
  SELECT team_id INTO v_user_team_id
  FROM public.arcade_team_members
  WHERE user_id = p_user_id
  LIMIT 1;

  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.code,
    t.member_count,
    t.captain_id,
    COALESCE(p.username, p.full_name, 'Captain')::TEXT AS captain_name,
    t.created_at
  FROM public.arcade_teams t
  LEFT JOIN public.profiles p ON p.id = t.captain_id
  WHERE t.status = 'active'
    AND t.member_count >= 1
    AND t.member_count <= 4
    AND (v_user_team_id IS NULL OR t.id <> v_user_team_id)
    AND (
      v_clean_query = ''
      OR t.name ILIKE '%' || v_clean_query || '%'
      OR t.code ILIKE v_clean_query || '%'
    )
  ORDER BY t.created_at DESC
  LIMIT 25;
END;
$$;

-- 7. RPC: Send team challenge
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
  v_new_challenge_id UUID;
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

  -- Validate question count
  IF v_count < 1 OR v_count > 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Question count must be between 1 and 10.');
  END IF;

  -- Validate both teams exist and are active
  IF NOT EXISTS (SELECT 1 FROM public.arcade_teams WHERE id = p_challenger_team_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenger squad is not active.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.arcade_teams WHERE id = p_challenged_team_id AND status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenged squad is not active.');
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

-- 8. RPC: Respond to team challenge (Accept / Decline) & create match on accept
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

  -- If accepted: sample questions and create match
  -- 1. Try to find published challenges matching language and difficulty
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
        OR LOWER(v_challenge.difficulty) IN ('all', 'any')
      )
    ORDER BY random()
    LIMIT v_challenge.question_count
  ) sub;

  -- Fallback: if not enough matching exercises, select any published questions to satisfy question_count
  IF jsonb_array_length(v_selected_exercise_ids) < v_challenge.question_count THEN
    SELECT COALESCE(jsonb_agg(sub_fallback.id), '[]'::jsonb)
    INTO v_selected_exercise_ids
    FROM (
      SELECT c.id
      FROM public.challenges c
      WHERE c.is_published = true
      ORDER BY random()
      LIMIT v_challenge.question_count
    ) sub_fallback;
  END IF;

  -- 2. Mark challenge as accepted
  UPDATE public.arcade_team_challenges
  SET status = 'accepted', updated_at = now()
  WHERE id = p_challenge_id;

  -- 3. Create match in arcade_team_matches
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

-- 9. Enable Realtime Replication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_team_challenges;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_team_matches;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Migration: Admin Content Management
-- Description: Adds tables for Content Versioning, XP Level Config, Centralized Hints, and Content Status.

-- 1. Content Versions Table
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL CHECK (target_type IN ('challenge', 'lesson', 'project')),
    target_id UUID NOT NULL,
    version INT NOT NULL,
    payload JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. XP / Level Configuration Table
CREATE TABLE IF NOT EXISTS public.xp_level_config (
    level INT PRIMARY KEY,
    required_xp INT NOT NULL,
    reward_multiplier FLOAT DEFAULT 1.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed XP levels 1-100 (Level = XP / 200) for backwards compatibility
DO $$ 
DECLARE
    i INT;
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO public.xp_level_config (level, required_xp)
        VALUES (i, (i - 1) * 200)
        ON CONFLICT (level) DO NOTHING;
    END LOOP;
END $$;

-- 3. Update Award XP Function to use xp_level_config
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source_type TEXT,
  p_source_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted_id UUID;
  v_current_profile RECORD;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_streak INTEGER;
  v_new_daily_xp INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Attempt idempotent insert into xp_transactions
  INSERT INTO public.xp_transactions (user_id, amount, source_type, source_id)
  VALUES (p_user_id, p_amount, p_source_type, p_source_id)
  ON CONFLICT (user_id, source_type, source_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  -- If already awarded previously, return without changes
  IF v_inserted_id IS NULL THEN
    SELECT xp, level, streak, daily_goal_xp, daily_xp_earned INTO v_current_profile
    FROM public.profiles WHERE id = p_user_id;

    RETURN jsonb_build_object(
      'awarded', false,
      'xp', v_current_profile.xp,
      'level', v_current_profile.level,
      'streak', v_current_profile.streak
    );
  END IF;

  -- Fetch current profile
  SELECT * INTO v_current_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  -- Calculate new XP
  v_new_xp := COALESCE(v_current_profile.xp, 0) + p_amount;
  
  -- Calculate new Level dynamically from xp_level_config
  SELECT level INTO v_new_level 
  FROM public.xp_level_config 
  WHERE required_xp <= v_new_xp 
  ORDER BY required_xp DESC 
  LIMIT 1;

  IF v_new_level IS NULL THEN
    v_new_level := 1;
  END IF;

  -- Calculate Streak
  IF v_current_profile.last_active_date = v_today THEN
    v_new_streak := COALESCE(v_current_profile.streak, 1);
    v_new_daily_xp := COALESCE(v_current_profile.daily_xp_earned, 0) + p_amount;
  ELSIF v_current_profile.last_active_date = v_today - 1 THEN
    v_new_streak := COALESCE(v_current_profile.streak, 0) + 1;
    v_new_daily_xp := p_amount;
  ELSE
    v_new_streak := 1;
    v_new_daily_xp := p_amount;
  END IF;

  -- Update profile record
  UPDATE public.profiles
  SET
    xp = v_new_xp,
    level = v_new_level,
    streak = v_new_streak,
    daily_xp_earned = v_new_daily_xp,
    last_active_date = v_today,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'awarded', true,
    'xp', v_new_xp,
    'level', v_new_level,
    'streak', v_new_streak,
    'daily_xp_earned', v_new_daily_xp
  );
END;
$$;


-- 4. Centralized Hint Management Table
CREATE TABLE IF NOT EXISTS public.challenge_hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    hint_text TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Content Status Columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'content_status') THEN
    ALTER TABLE public.challenges ADD COLUMN content_status VARCHAR(50) DEFAULT 'published';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content_status') THEN
    ALTER TABLE public.lessons ADD COLUMN content_status VARCHAR(50) DEFAULT 'published';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'content_status') THEN
    ALTER TABLE public.projects ADD COLUMN content_status VARCHAR(50) DEFAULT 'published';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_level_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_hints ENABLE ROW LEVEL SECURITY;

-- Policies for Admins to manage versions
CREATE POLICY "Admins manage content versions" ON public.content_versions
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for XP Level Config
CREATE POLICY "Public read xp config" ON public.xp_level_config
    FOR SELECT USING (true);
CREATE POLICY "Admins manage xp config" ON public.xp_level_config
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for Hints
CREATE POLICY "Public read hints" ON public.challenge_hints
    FOR SELECT USING (true);
CREATE POLICY "Admins manage hints" ON public.challenge_hints
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

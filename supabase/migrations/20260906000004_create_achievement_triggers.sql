-- Create Achievement Triggers Table for dynamic rules engine
CREATE TABLE IF NOT EXISTS public.achievement_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  trigger_type TEXT NOT NULL, -- e.g., 'ACTION_COUNT', 'LEVEL_REACHED', 'XP_EARNED'
  condition_key TEXT NOT NULL, -- e.g., 'BATTLE_WON', 'COURSE_COMPLETED'
  condition_value JSONB, -- e.g., {"target": 5}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievement_triggers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read achievement triggers" ON public.achievement_triggers 
FOR SELECT USING (true);

CREATE POLICY "Admin manage achievement triggers" ON public.achievement_triggers 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed initial triggers for existing achievements (from migration 5)
-- 'novice-coder': Reach Level 2
INSERT INTO public.achievement_triggers (achievement_id, trigger_type, condition_key, condition_value)
SELECT id, 'LEVEL_REACHED', 'ANY', '{"target": 2}'::jsonb
FROM public.achievements WHERE slug = 'novice-coder'
ON CONFLICT DO NOTHING;

-- 'daily-dedication': Complete daily learning goal
INSERT INTO public.achievement_triggers (achievement_id, trigger_type, condition_key, condition_value)
SELECT id, 'ACTION_COUNT', 'DAILY_GOAL', '{"target": 1}'::jsonb
FROM public.achievements WHERE slug = 'daily-dedication'
ON CONFLICT DO NOTHING;

-- 'trailblazer': Complete 3 learning lessons
INSERT INTO public.achievement_triggers (achievement_id, trigger_type, condition_key, condition_value)
SELECT id, 'ACTION_COUNT', 'LESSON_COMPLETED', '{"target": 3}'::jsonb
FROM public.achievements WHERE slug = 'trailblazer'
ON CONFLICT DO NOTHING;

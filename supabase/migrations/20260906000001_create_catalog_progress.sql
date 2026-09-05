CREATE TABLE IF NOT EXISTS public.user_catalog_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_slug TEXT NOT NULL,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'start',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_slug)
);

ALTER TABLE public.user_catalog_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own catalog progress" ON public.user_catalog_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

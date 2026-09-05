-- Migration: Create Project Build Features
-- Description: Adds tables for Build History, Build Likes, and Build Comments for project showcases

-- 1. Build History Table
CREATE TABLE IF NOT EXISTS public.project_build_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    showcase_id UUID NOT NULL REFERENCES public.project_showcases(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    title TEXT,
    description TEXT,
    preview_url TEXT,
    live_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Build Likes Table
CREATE TABLE IF NOT EXISTS public.project_build_likes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    showcase_id UUID NOT NULL REFERENCES public.project_showcases(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, showcase_id)
);

-- 3. Build Comments Table
CREATE TABLE IF NOT EXISTS public.project_build_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    showcase_id UUID NOT NULL REFERENCES public.project_showcases(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_build_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_build_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_build_comments ENABLE ROW LEVEL SECURITY;

-- Project Build History Policies
CREATE POLICY "Public can view build history" 
    ON public.project_build_history FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.project_showcases 
            WHERE id = project_build_history.showcase_id AND (is_published = true OR auth.uid() = user_id)
        )
    );

CREATE POLICY "Authors can insert build history" 
    ON public.project_build_history FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_showcases 
            WHERE id = project_build_history.showcase_id AND auth.uid() = user_id
        )
    );

-- Project Build Likes Policies
CREATE POLICY "Public can view build likes" 
    ON public.project_build_likes FOR SELECT USING (true);

CREATE POLICY "Users can like builds" 
    ON public.project_build_likes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike builds" 
    ON public.project_build_likes FOR DELETE 
    USING (auth.uid() = user_id);

-- Project Build Comments Policies
CREATE POLICY "Public can view build comments" 
    ON public.project_build_comments FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" 
    ON public.project_build_comments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
    ON public.project_build_comments FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
    ON public.project_build_comments FOR DELETE 
    USING (auth.uid() = user_id);

-- Migration: Create saved_challenges table
-- Description: Allow users to bookmark/save challenges

CREATE TABLE IF NOT EXISTS public.saved_challenges (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.saved_challenges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own saved challenges"
    ON public.saved_challenges
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save challenges"
    ON public.saved_challenges
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave challenges"
    ON public.saved_challenges
    FOR DELETE
    USING (auth.uid() = user_id);

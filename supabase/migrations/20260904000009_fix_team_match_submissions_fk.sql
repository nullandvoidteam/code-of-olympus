-- Migration: Add foreign key relationship from arcade_team_match_submissions to profiles
-- Description: Enables PostgREST to join profiles directly on arcade_team_match_submissions.user_id

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'arcade_team_match_submissions_user_id_profiles_fkey'
      AND table_name = 'arcade_team_match_submissions'
  ) THEN
    ALTER TABLE public.arcade_team_match_submissions
      ADD CONSTRAINT arcade_team_match_submissions_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

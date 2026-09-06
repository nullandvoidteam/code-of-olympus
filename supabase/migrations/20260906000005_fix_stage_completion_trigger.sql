CREATE OR REPLACE FUNCTION public.enforce_user_stage_progress_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent clients from directly marking a stage as 'completed'
  IF (auth.uid() IS NOT NULL OR auth.role() = 'authenticated') AND NOT public.is_admin() THEN
    -- Allow SECURITY DEFINER functions (running as postgres) to bypass this check
    IF CURRENT_USER NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
      IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
        RAISE EXCEPTION 'Unauthorized: Stage completion must be validated through complete_project_stage.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

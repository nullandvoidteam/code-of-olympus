-- Migration: Finalize Team Arcade Hardening & Integration
-- Description: Enforce strict participant authorization on conclude_team_match, prevent premature lobby conclusion, ensure status validation, and index optimization.

-- 1. Index optimizations for active and recent match queries
CREATE INDEX IF NOT EXISTS idx_arcade_team_matches_created_desc ON public.arcade_team_matches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_arcade_team_matches_teams_status ON public.arcade_team_matches (team_a_id, team_b_id, status);

-- 2. Harden conclude_team_match RPC
CREATE OR REPLACE FUNCTION public.conclude_team_match(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_match RECORD;
  v_team_a_participants INT := 0;
  v_team_a_pts INT := 0;
  v_team_a_avg NUMERIC(6,2) := 0;
  v_team_b_participants INT := 0;
  v_team_b_pts INT := 0;
  v_team_b_avg NUMERIC(6,2) := 0;
  v_winner_id UUID := NULL;
  v_loser_id UUID := NULL;
  v_result_type TEXT := 'WE ARE SAFE';
  v_turf_transferred BOOLEAN := false;
  v_updated_match RECORD;
BEGIN
  -- Lock match row
  SELECT * INTO v_match
  FROM public.arcade_team_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found.');
  END IF;

  -- Validate caller: if authenticated, must belong to team_a or team_b or be admin
  IF v_caller_id IS NOT NULL AND NOT public.is_admin() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.arcade_team_members
      WHERE user_id = v_caller_id AND (team_id = v_match.team_a_id OR team_id = v_match.team_b_id)
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'You are not a participant in this match.');
    END IF;
  END IF;

  -- Prevent concluding a match that hasn't started
  IF v_match.status = 'lobby' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot conclude a match that is still in lobby.');
  END IF;

  -- Idempotency protection: If match is already completed and turf transferred, return early
  IF v_match.status = 'completed' AND v_match.turf_transferred IS TRUE THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'completed',
      'result_type', v_match.result_type,
      'winner_team_id', v_match.winner_team_id,
      'team_a_score', v_match.team_a_score,
      'team_b_score', v_match.team_b_score,
      'turf_transferred', v_match.turf_transferred,
      'match', row_to_json(v_match),
      'already_concluded', true
    );
  END IF;

  -- Calculate Team A average Combat Points of its participating players
  SELECT 
    COUNT(DISTINCT user_id),
    COALESCE(SUM(combat_points), 0)
  INTO v_team_a_participants, v_team_a_pts
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND team_id = v_match.team_a_id;

  IF v_team_a_participants > 0 THEN
    v_team_a_avg := ROUND(v_team_a_pts::numeric / v_team_a_participants, 2);
  ELSE
    v_team_a_avg := 0;
  END IF;

  -- Calculate Team B average Combat Points of its participating players
  SELECT 
    COUNT(DISTINCT user_id),
    COALESCE(SUM(combat_points), 0)
  INTO v_team_b_participants, v_team_b_pts
  FROM public.arcade_team_match_submissions
  WHERE match_id = p_match_id AND team_id = v_match.team_b_id;

  IF v_team_b_participants > 0 THEN
    v_team_b_avg := ROUND(v_team_b_pts::numeric / v_team_b_participants, 2);
  ELSE
    v_team_b_avg := 0;
  END IF;

  -- Determine result:
  -- Higher average -> KILLER COMBAT
  -- Equal average -> WE ARE SAFE
  IF v_team_a_avg > v_team_b_avg THEN
    v_winner_id := v_match.team_a_id;
    v_loser_id := v_match.team_b_id;
    v_result_type := 'KILLER COMBAT';
  ELSIF v_team_b_avg > v_team_a_avg THEN
    v_winner_id := v_match.team_b_id;
    v_loser_id := v_match.team_a_id;
    v_result_type := 'KILLER COMBAT';
  ELSE
    v_winner_id := NULL;
    v_loser_id := NULL;
    v_result_type := 'WE ARE SAFE';
  END IF;

  -- Turf transfer: transfer 1 turf from loser to winner
  IF v_winner_id IS NOT NULL AND (v_match.turf_transferred IS NOT TRUE) THEN
    -- Decrement loser turf (minimum 0)
    UPDATE public.arcade_teams
    SET turf_count = GREATEST(0, turf_count - 1), updated_at = now()
    WHERE id = v_loser_id;

    -- Increment winner turf
    UPDATE public.arcade_teams
    SET turf_count = turf_count + 1, updated_at = now()
    WHERE id = v_winner_id;

    v_turf_transferred := true;
  ELSE
    v_turf_transferred := COALESCE(v_match.turf_transferred, false);
  END IF;

  -- Persist match outcome
  UPDATE public.arcade_team_matches
  SET 
    status = 'completed',
    winner_team_id = v_winner_id,
    result_type = v_result_type,
    team_a_score = v_team_a_avg,
    team_b_score = v_team_b_avg,
    turf_transferred = v_turf_transferred,
    ended_at = COALESCE(ended_at, now()),
    updated_at = now()
  WHERE id = p_match_id
  RETURNING * INTO v_updated_match;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'completed',
    'result_type', v_result_type,
    'winner_team_id', v_winner_id,
    'team_a_score', v_team_a_avg,
    'team_b_score', v_team_b_avg,
    'turf_transferred', v_turf_transferred,
    'match', row_to_json(v_updated_match)
  );
END;
$$;

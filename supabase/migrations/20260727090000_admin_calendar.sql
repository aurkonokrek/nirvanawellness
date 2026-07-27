-- Nirvana admin · Calendar (Phase 3)
--
-- Admin-side scheduling only (locked scope, 2026-07-26): clients keep requesting a date via the
-- public form, staff assign the actual appointment slot here. No public self-serve booking.
--
-- Additive: two nullable columns on the two schedulable submission types (contact_messages have
-- no appointment concept, so they're excluded) plus two RPCs. Nothing existing changes shape.
--
-- Idempotent.

ALTER TABLE public.session_requests    ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.session_requests    ADD COLUMN IF NOT EXISTS assigned_expert text;
ALTER TABLE public.corporate_inquiries ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.corporate_inquiries ADD COLUMN IF NOT EXISTS assigned_expert text;

CREATE INDEX IF NOT EXISTS session_requests_scheduled_idx
  ON public.session_requests (scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS corporate_inquiries_scheduled_idx
  ON public.corporate_inquiries (scheduled_at) WHERE scheduled_at IS NOT NULL;

-- ------------------------------------------------------------------
-- Unified calendar read. Only rows with a slot actually assigned —
-- unscheduled submissions stay in the Inbox until staff place them here.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_calendar(p_from date, p_to date)
RETURNS TABLE(
  id               uuid,
  type             text,
  name             text,
  status           text,
  scheduled_at     timestamptz,
  assigned_expert text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, 'session_request'::text, name, status, scheduled_at, assigned_expert
  FROM public.session_requests
  WHERE public.has_role(auth.uid(), 'admin')
    AND scheduled_at IS NOT NULL
    AND (scheduled_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
  UNION ALL
  SELECT id, 'corporate_inquiry'::text, name, status, scheduled_at, assigned_expert
  FROM public.corporate_inquiries
  WHERE public.has_role(auth.uid(), 'admin')
    AND scheduled_at IS NOT NULL
    AND (scheduled_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
  ORDER BY 5;
$$;

-- ------------------------------------------------------------------
-- Assign, move, or clear (p_scheduled_at = NULL) a slot. session_request /
-- corporate_inquiry only — contact_messages have no appointment concept.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_schedule(
  p_type             text,
  p_id               uuid,
  p_scheduled_at     timestamptz,
  p_assigned_expert text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_hit int;
BEGIN
  PERFORM public.assert_admin();

  IF p_type NOT IN ('session_request', 'corporate_inquiry') THEN
    RAISE EXCEPTION 'Only session requests and corporate inquiries can be scheduled, got: %', p_type
      USING ERRCODE = '22023';
  END IF;

  IF p_type = 'session_request' THEN
    UPDATE public.session_requests
       SET scheduled_at = p_scheduled_at, assigned_expert = p_assigned_expert
     WHERE id = p_id;
  ELSE
    UPDATE public.corporate_inquiries
       SET scheduled_at = p_scheduled_at, assigned_expert = p_assigned_expert
     WHERE id = p_id;
  END IF;

  GET DIAGNOSTICS v_hit = ROW_COUNT;
  IF v_hit = 0 THEN
    RAISE EXCEPTION 'No % found with id %', p_type, p_id USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_calendar(date, date) FROM public, anon;
REVOKE ALL ON FUNCTION public.set_schedule(text, uuid, timestamptz, text) FROM public, anon;

GRANT EXECUTE ON FUNCTION public.admin_calendar(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_schedule(text, uuid, timestamptz, text) TO authenticated;

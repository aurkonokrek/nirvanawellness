-- Nirvana admin · correctness pass
--
-- Fixes three classes of bug in the original admin RPCs:
--
--   1. They returned jsonb_build_object('status','forbidden'|'not_found') instead of
--      raising. supabase-js only populates `error` on a raised exception, so a denied
--      or missed update arrived at the client as a success. Every function below
--      raises.
--   2. There was no way to act on a session_request or corporate_inquiry other than
--      confirm/reschedule, so the UI routed "Close" through
--      update_contact_message_status, which only ever touches contact_messages —
--      closing a session updated zero rows and reported success.
--      set_submission_status handles all three tables.
--   3. confirm_session_request(p_notes) wrote into session_requests.notes, which is
--      the *client's* message from the booking form. Admin notes now live in their
--      own column.
--
-- Idempotent.

-- ------------------------------------------------------------------
-- Admin notes, separate from the client's own message
-- ------------------------------------------------------------------
ALTER TABLE public.session_requests     ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.corporate_inquiries  ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.contact_messages     ADD COLUMN IF NOT EXISTS admin_notes text;

-- ------------------------------------------------------------------
-- Shared guards
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assert_admin()
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised: admin role required.'
      USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assert_submission_type(p_type text)
RETURNS void LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF p_type NOT IN ('session_request', 'corporate_inquiry', 'contact_message') THEN
    RAISE EXCEPTION 'Unknown submission type: %', p_type USING ERRCODE = '22023';
  END IF;
END;
$$;

-- ------------------------------------------------------------------
-- Status changes, any table, any starting status
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_submission_status(
  p_type   text,
  p_id     uuid,
  p_status text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_hit int;
BEGIN
  PERFORM public.assert_admin();
  PERFORM public.assert_submission_type(p_type);

  IF p_status NOT IN ('new', 'contacted', 'confirmed', 'rescheduled', 'cancelled', 'closed') THEN
    RAISE EXCEPTION 'Unknown status: %', p_status USING ERRCODE = '22023';
  END IF;

  IF p_type = 'session_request' THEN
    UPDATE public.session_requests SET status = p_status WHERE id = p_id;
  ELSIF p_type = 'corporate_inquiry' THEN
    UPDATE public.corporate_inquiries SET status = p_status WHERE id = p_id;
  ELSE
    UPDATE public.contact_messages SET status = p_status WHERE id = p_id;
  END IF;

  GET DIAGNOSTICS v_hit = ROW_COUNT;
  IF v_hit = 0 THEN
    RAISE EXCEPTION 'No % found with id %', p_type, p_id USING ERRCODE = 'P0002';
  END IF;

  -- Only states the client should hear about get queued.
  IF p_status IN ('confirmed', 'cancelled') THEN
    INSERT INTO public.notification_outbox (source_type, source_id, event, payload)
    VALUES (p_type, p_id, p_status, '{}'::jsonb);
  END IF;
END;
$$;

-- ------------------------------------------------------------------
-- Rescheduling, any table
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reschedule_submission(
  p_type     text,
  p_id       uuid,
  p_new_date date
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_hit int;
BEGIN
  PERFORM public.assert_admin();
  PERFORM public.assert_submission_type(p_type);

  IF p_new_date IS NULL THEN
    RAISE EXCEPTION 'A new date is required.' USING ERRCODE = '22023';
  END IF;

  IF p_type = 'session_request' THEN
    UPDATE public.session_requests
       SET status = 'rescheduled', preferred_date = p_new_date
     WHERE id = p_id;
  ELSIF p_type = 'corporate_inquiry' THEN
    UPDATE public.corporate_inquiries
       SET status = 'rescheduled', preferred_date = p_new_date
     WHERE id = p_id;
  ELSE
    UPDATE public.contact_messages
       SET status = 'rescheduled', preferred_date = p_new_date
     WHERE id = p_id;
  END IF;

  GET DIAGNOSTICS v_hit = ROW_COUNT;
  IF v_hit = 0 THEN
    RAISE EXCEPTION 'No % found with id %', p_type, p_id USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.notification_outbox (source_type, source_id, event, payload)
  VALUES (p_type, p_id, 'rescheduled', jsonb_build_object('new_date', p_new_date));
END;
$$;

-- ------------------------------------------------------------------
-- Internal notes, any table. Never touches the client's own message.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_submission_notes(
  p_type  text,
  p_id    uuid,
  p_notes text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_hit int;
BEGIN
  PERFORM public.assert_admin();
  PERFORM public.assert_submission_type(p_type);

  IF p_type = 'session_request' THEN
    UPDATE public.session_requests SET admin_notes = p_notes WHERE id = p_id;
  ELSIF p_type = 'corporate_inquiry' THEN
    UPDATE public.corporate_inquiries SET admin_notes = p_notes WHERE id = p_id;
  ELSE
    UPDATE public.contact_messages SET admin_notes = p_notes WHERE id = p_id;
  END IF;

  GET DIAGNOSTICS v_hit = ROW_COUNT;
  IF v_hit = 0 THEN
    RAISE EXCEPTION 'No % found with id %', p_type, p_id USING ERRCODE = 'P0002';
  END IF;
END;
$$;

-- ------------------------------------------------------------------
-- Health check for the analytics pipeline.
--
-- /api/collect returns 204 and logs nothing when SUPABASE_SERVICE_ROLE_KEY or
-- ANALYTICS_SALT are missing on the host, so a misconfigured deploy is
-- indistinguishable from "nobody visited the site". The admin calls this to tell
-- the two apart instead of drawing an empty chart.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_health()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total bigint;
  v_last  timestamptz;
BEGIN
  PERFORM public.assert_admin();
  SELECT count(*), max(occurred_at) INTO v_total, v_last FROM public.analytics_events;
  RETURN jsonb_build_object(
    'total_events', v_total,
    'last_event_at', v_last,
    'ever_collected', v_total > 0
  );
END;
$$;

-- ------------------------------------------------------------------
-- analytics_sources referrer-host regex was double-escaped ('\\.' instead of
-- '\.'), so ~* never matched a real hostname and every referrer fell into
-- 'referral' — this was already diagnosed in FIX-live-schema-and-admin.sql
-- but that fix was never applied to the live DB. Single-escape it.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_sources(p_from date, p_to date)
RETURNS TABLE(source text, referrer_host text, pageviews bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE
      WHEN e.referrer_host IS NULL OR e.referrer_host = '' THEN 'direct'
      WHEN e.referrer_host ~* '(^|\.)(google|bing|yahoo|duckduckgo)\.' THEN 'search'
      WHEN e.referrer_host ~* '(^|\.)(facebook|instagram|twitter|linkedin|youtube|whatsapp|tiktok)\.' THEN 'social'
      ELSE 'referral'
    END AS source,
    e.referrer_host,
    count(*)::bigint AS pageviews
  FROM public.analytics_events e
  WHERE public.has_role(auth.uid(), 'admin')
    AND e.event_type = 'pageview'
    AND (e.occurred_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
  GROUP BY 1, 2 ORDER BY pageviews DESC;
$$;

-- ------------------------------------------------------------------
-- Grants
-- ------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.set_submission_status(text, uuid, text)  FROM public, anon;
REVOKE ALL ON FUNCTION public.reschedule_submission(text, uuid, date)  FROM public, anon;
REVOKE ALL ON FUNCTION public.set_submission_notes(text, uuid, text)   FROM public, anon;
REVOKE ALL ON FUNCTION public.analytics_health()                       FROM public, anon;

GRANT EXECUTE ON FUNCTION public.set_submission_status(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_submission(text, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_submission_notes(text, uuid, text)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_health()                      TO authenticated;

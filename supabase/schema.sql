-- ============================================================
-- Nirvana Wellness — Full Schema
-- Run this in the Supabase SQL Editor (fresh project).
-- Idempotent: safe to re-run.
-- ============================================================

-- 0001: Extensions + enum
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin');
  END IF;
END $$;

-- 0002: Config store + version stamp
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.site_settings (key, value) VALUES
  ('timezone', 'Asia/Dhaka'),
  ('notify_staff_phone', '')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.kit_meta (
  id               boolean PRIMARY KEY DEFAULT true CHECK (id),
  contract_version integer NOT NULL,
  updated_at       timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.kit_meta (id, contract_version) VALUES (true, 1)
ON CONFLICT (id) DO UPDATE
  SET contract_version = excluded.contract_version, updated_at = now();

-- 0003: Profiles + roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  display_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 0004: Core domain tables
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN new.updated_at = now(); RETURN new; END $$;

CREATE OR REPLACE FUNCTION public.kit_timezone()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT value FROM public.site_settings WHERE key = 'timezone'), 'UTC');
$$;

-- Session requests (Nirvana-specific intake)
CREATE TABLE IF NOT EXISTS public.session_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  email            text NOT NULL,
  phone            text,
  session_type     text NOT NULL DEFAULT 'individual',
  preferred_format text NOT NULL DEFAULT 'either',
  timezone         text,
  preferred_date   date,
  expert_slug      text,
  expert_name      text,
  notes            text,
  status           text NOT NULL DEFAULT 'new',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_session_requests_updated ON public.session_requests;
CREATE TRIGGER trg_session_requests_updated BEFORE UPDATE ON public.session_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Corporate inquiries
CREATE TABLE IF NOT EXISTS public.corporate_inquiries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  role             text,
  organisation     text NOT NULL,
  work_email       text NOT NULL,
  team_size        text,
  program_interest text,
  context          text,
  preferred_date   date,
  status           text NOT NULL DEFAULT 'new',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_corporate_inquiries_updated ON public.corporate_inquiries;
CREATE TRIGGER trg_corporate_inquiries_updated BEFORE UPDATE ON public.corporate_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- General contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  email          text NOT NULL,
  message        text NOT NULL,
  preferred_date date,
  status         text NOT NULL DEFAULT 'new',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_contact_messages_updated ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Notification outbox
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL, -- 'session_request' | 'corporate_inquiry' | 'contact_message'
  source_id   uuid NOT NULL,
  event       text NOT NULL, -- 'new' | 'confirmed' | 'rescheduled' | 'cancelled'
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  status      text NOT NULL DEFAULT 'queued', -- queued | sent | failed
  created_at  timestamptz NOT NULL DEFAULT now(),
  sent_at     timestamptz
);

-- Analytics events (server-insert only via service role)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  event_type    text NOT NULL DEFAULT 'pageview',
  path          text NOT NULL,
  referrer_host text,
  visitor_hash  text NOT NULL,
  country       text,
  device        text
);
CREATE INDEX IF NOT EXISTS analytics_events_occurred_idx
  ON public.analytics_events (occurred_at);

-- ============================================================
-- 0005: Admin-only RPCs for submissions management
-- ============================================================

-- Confirm a session request (admin only)
CREATE OR REPLACE FUNCTION public.confirm_session_request(p_id uuid, p_notes text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('status', 'forbidden');
  END IF;
  UPDATE public.session_requests
  SET status = 'confirmed', notes = COALESCE(p_notes, notes)
  WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'not_found'); END IF;
  INSERT INTO public.notification_outbox (source_type, source_id, event, payload)
  VALUES ('session_request', p_id, 'confirmed', jsonb_build_object('notes', p_notes));
  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- Reschedule a session request (admin only)
CREATE OR REPLACE FUNCTION public.reschedule_session_request(p_id uuid, p_new_date date)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('status', 'forbidden');
  END IF;
  UPDATE public.session_requests
  SET status = 'rescheduled', preferred_date = p_new_date
  WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'not_found'); END IF;
  INSERT INTO public.notification_outbox (source_type, source_id, event, payload)
  VALUES ('session_request', p_id, 'rescheduled', jsonb_build_object('new_date', p_new_date));
  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- Confirm a corporate inquiry (admin only)
CREATE OR REPLACE FUNCTION public.confirm_corporate_inquiry(p_id uuid, p_notes text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('status', 'forbidden');
  END IF;
  UPDATE public.corporate_inquiries
  SET status = 'confirmed'
  WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'not_found'); END IF;
  INSERT INTO public.notification_outbox (source_type, source_id, event, payload)
  VALUES ('corporate_inquiry', p_id, 'confirmed', jsonb_build_object('notes', p_notes));
  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- Reschedule a corporate inquiry
CREATE OR REPLACE FUNCTION public.reschedule_corporate_inquiry(p_id uuid, p_new_date date)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('status', 'forbidden');
  END IF;
  UPDATE public.corporate_inquiries
  SET status = 'rescheduled', preferred_date = p_new_date
  WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'not_found'); END IF;
  INSERT INTO public.notification_outbox (source_type, source_id, event, payload)
  VALUES ('corporate_inquiry', p_id, 'rescheduled', jsonb_build_object('new_date', p_new_date));
  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- Close/contact a general message
CREATE OR REPLACE FUNCTION public.update_contact_message_status(p_id uuid, p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('status', 'forbidden');
  END IF;
  UPDATE public.contact_messages SET status = p_status WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'not_found'); END IF;
  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- ============================================================
-- 0006: Analytics RPCs
-- ============================================================

CREATE OR REPLACE FUNCTION public.analytics_traffic(p_from date, p_to date)
RETURNS TABLE(day date, pageviews bigint, unique_visitors bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (e.occurred_at AT TIME ZONE public.kit_timezone())::date AS day,
    count(*)::bigint AS pageviews,
    count(DISTINCT e.visitor_hash)::bigint AS unique_visitors
  FROM public.analytics_events e
  WHERE public.has_role(auth.uid(), 'admin')
    AND e.event_type = 'pageview'
    AND (e.occurred_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_pages(p_from date, p_to date, p_limit int DEFAULT 20)
RETURNS TABLE(path text, pageviews bigint, unique_visitors bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    e.path,
    count(*)::bigint AS pageviews,
    count(DISTINCT e.visitor_hash)::bigint AS unique_visitors
  FROM public.analytics_events e
  WHERE public.has_role(auth.uid(), 'admin')
    AND e.event_type = 'pageview'
    AND (e.occurred_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
  GROUP BY e.path
  ORDER BY pageviews DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));
$$;

CREATE OR REPLACE FUNCTION public.analytics_sources(p_from date, p_to date)
RETURNS TABLE(source text, referrer_host text, pageviews bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE
      WHEN e.referrer_host IS NULL OR e.referrer_host = '' THEN 'direct'
      WHEN e.referrer_host ~* '(^|\\.)(google|bing|yahoo|duckduckgo)\.' THEN 'search'
      WHEN e.referrer_host ~* '(^|\\.)(facebook|instagram|twitter|linkedin|youtube|whatsapp|tiktok)\.' THEN 'social'
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

CREATE OR REPLACE FUNCTION public.analytics_conversions(p_from date, p_to date)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN NOT public.has_role(auth.uid(), 'admin') THEN '{}'::jsonb ELSE
    jsonb_build_object(
      'session_requests', (
        SELECT jsonb_object_agg(status, n) FROM (
          SELECT status, count(*)::int AS n FROM public.session_requests
          WHERE (created_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
          GROUP BY status
        ) s
      ),
      'corporate_inquiries', (
        SELECT jsonb_object_agg(status, n) FROM (
          SELECT status, count(*)::int AS n FROM public.corporate_inquiries
          WHERE (created_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
          GROUP BY status
        ) s
      ),
      'contact_messages', (SELECT count(*)::int FROM public.contact_messages
        WHERE (created_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to),
      'book_page_views', (
        SELECT count(*)::int FROM public.analytics_events
        WHERE event_type = 'pageview' AND path = '/book'
          AND (occurred_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to
      )
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION
  public.analytics_traffic(date, date),
  public.analytics_top_pages(date, date, int),
  public.analytics_sources(date, date),
  public.analytics_conversions(date, date)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.confirm_session_request(uuid, text),
  public.reschedule_session_request(uuid, date),
  public.confirm_corporate_inquiry(uuid, text),
  public.reschedule_corporate_inquiry(uuid, date),
  public.update_contact_message_status(uuid, text)
TO authenticated;

-- ============================================================
-- 0007: Row-Level Security
-- ============================================================

-- kit_meta: world-readable
ALTER TABLE public.kit_meta ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.kit_meta TO anon, authenticated;
DROP POLICY IF EXISTS kit_meta_read ON public.kit_meta;
CREATE POLICY kit_meta_read ON public.kit_meta FOR SELECT USING (true);

-- site_settings: admin only
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
DROP POLICY IF EXISTS site_settings_admin ON public.site_settings;
CREATE POLICY site_settings_admin ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profiles: self + admin
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
DROP POLICY IF EXISTS profiles_self_or_admin_read ON public.profiles;
CREATE POLICY profiles_self_or_admin_read ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- user_roles: self read, admin manage
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_roles_admin_manage ON public.user_roles;
CREATE POLICY user_roles_admin_manage ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- session_requests: anon INSERT, admin full access
ALTER TABLE public.session_requests ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.session_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.session_requests TO authenticated;
GRANT ALL ON public.session_requests TO service_role;
DROP POLICY IF EXISTS session_requests_anon_insert ON public.session_requests;
CREATE POLICY session_requests_anon_insert ON public.session_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(name) BETWEEN 1 AND 100 AND status = 'new');
DROP POLICY IF EXISTS session_requests_admin ON public.session_requests;
CREATE POLICY session_requests_admin ON public.session_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- corporate_inquiries: anon INSERT, admin full access
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.corporate_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.corporate_inquiries TO authenticated;
GRANT ALL ON public.corporate_inquiries TO service_role;
DROP POLICY IF EXISTS corporate_inquiries_anon_insert ON public.corporate_inquiries;
CREATE POLICY corporate_inquiries_anon_insert ON public.corporate_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(name) BETWEEN 1 AND 100 AND status = 'new');
DROP POLICY IF EXISTS corporate_inquiries_admin ON public.corporate_inquiries;
CREATE POLICY corporate_inquiries_admin ON public.corporate_inquiries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- contact_messages: anon INSERT, admin full access
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
DROP POLICY IF EXISTS contact_messages_anon_insert ON public.contact_messages;
CREATE POLICY contact_messages_anon_insert ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(name) BETWEEN 1 AND 100 AND status = 'new');
DROP POLICY IF EXISTS contact_messages_admin ON public.contact_messages;
CREATE POLICY contact_messages_admin ON public.contact_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- notification_outbox: admin read, service_role drains
REVOKE ALL ON public.notification_outbox FROM anon;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.notification_outbox TO authenticated;
GRANT ALL ON public.notification_outbox TO service_role;
DROP POLICY IF EXISTS outbox_admin_read ON public.notification_outbox;
CREATE POLICY outbox_admin_read ON public.notification_outbox
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- analytics_events: DENY-ALL to anon/authenticated; service_role inserts
REVOKE ALL ON public.analytics_events FROM anon, authenticated;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.analytics_events TO service_role;

-- ============================================================
-- 0008: Admin correctness pass (see migrations/20260726120000_admin_correctness.sql)
-- ============================================================

ALTER TABLE public.session_requests     ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.corporate_inquiries  ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.contact_messages     ADD COLUMN IF NOT EXISTS admin_notes text;

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

-- Status changes, any table, any starting status. Raises instead of returning
-- a jsonb {"status":"forbidden"|"not_found"} — the old shape let a denied or
-- missed update reach the client as a silent success.
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

  IF p_status IN ('confirmed', 'cancelled') THEN
    INSERT INTO public.notification_outbox (source_type, source_id, event, payload)
    VALUES (p_type, p_id, p_status, '{}'::jsonb);
  END IF;
END;
$$;

-- Rescheduling, any table.
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

-- Internal admin notes, any table. Never touches the client's own message field.
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

-- Analytics pipeline health check. /api/collect returns 204 and logs nothing
-- when SUPABASE_SERVICE_ROLE_KEY or ANALYTICS_SALT are missing on the host, so
-- a misconfigured deploy is indistinguishable from "nobody visited the site".
-- The admin panel calls this to tell the two apart instead of drawing an
-- empty chart.
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

-- analytics_sources referrer-host regex was double-escaped ('\\.' instead of
-- '\.'), so ~* never matched a real hostname and every referrer fell into
-- 'referral'. Single-escape it.
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

REVOKE ALL ON FUNCTION public.set_submission_status(text, uuid, text)  FROM public, anon;
REVOKE ALL ON FUNCTION public.reschedule_submission(text, uuid, date)  FROM public, anon;
REVOKE ALL ON FUNCTION public.set_submission_notes(text, uuid, text)   FROM public, anon;
REVOKE ALL ON FUNCTION public.analytics_health()                       FROM public, anon;

GRANT EXECUTE ON FUNCTION public.set_submission_status(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_submission(text, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_submission_notes(text, uuid, text)  TO authenticated;

-- ============================================================
-- 0009: Calendar (see migrations/20260727090000_admin_calendar.sql)
--
-- Admin-side scheduling only: clients keep requesting a date via the public
-- form, staff assign the actual appointment slot here. contact_messages have
-- no appointment concept and are excluded.
-- ============================================================

ALTER TABLE public.session_requests    ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.session_requests    ADD COLUMN IF NOT EXISTS assigned_expert text;
ALTER TABLE public.corporate_inquiries ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.corporate_inquiries ADD COLUMN IF NOT EXISTS assigned_expert text;

CREATE INDEX IF NOT EXISTS session_requests_scheduled_idx
  ON public.session_requests (scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS corporate_inquiries_scheduled_idx
  ON public.corporate_inquiries (scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Unified calendar read. Only rows with a slot actually assigned —
-- unscheduled submissions stay in the Inbox until staff place them here.
CREATE OR REPLACE FUNCTION public.admin_calendar(p_from date, p_to date)
RETURNS TABLE(
  id               uuid,
  type             text,
  name             text,
  status           text,
  scheduled_at     timestamptz,
  assigned_expert  text
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

-- Assign, move, or clear (p_scheduled_at = NULL) a slot. session_request /
-- corporate_inquiry only.
CREATE OR REPLACE FUNCTION public.set_schedule(
  p_type                 text,
  p_id                   uuid,
  p_scheduled_at         timestamptz,
  p_assigned_expert      text DEFAULT NULL
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

-- ============================================================
-- 0010: Contacts / CRM (see migrations/20260727130000_admin_contacts.sql)
--
-- Dedup key is EMAIL ONLY, not phone — session_requests supports "couples"
-- bookings, so two different people can share a phone number; matching on
-- phone would wrongly merge their submission histories.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contacts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text,
  email      text,
  phone      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_contacts_updated ON public.contacts;
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_uniq
  ON public.contacts (lower(email)) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.contact_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  note       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_notes_contact_idx ON public.contact_notes (contact_id);

ALTER TABLE public.session_requests    ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts(id);
ALTER TABLE public.corporate_inquiries ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts(id);
ALTER TABLE public.contact_messages    ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts(id);

CREATE INDEX IF NOT EXISTS session_requests_contact_idx    ON public.session_requests (contact_id);
CREATE INDEX IF NOT EXISTS corporate_inquiries_contact_idx ON public.corporate_inquiries (contact_id);
CREATE INDEX IF NOT EXISTS contact_messages_contact_idx    ON public.contact_messages (contact_id);

-- Find-or-create a contact by email (race-safe via ON CONFLICT — this runs
-- from a BEFORE INSERT trigger on tables the public can insert into
-- anonymously).
CREATE OR REPLACE FUNCTION public.upsert_contact(p_name text, p_email text, p_phone text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text := nullif(lower(trim(p_email)), '');
  v_phone text := nullif(trim(p_phone), '');
  v_id uuid;
BEGIN
  INSERT INTO public.contacts (name, email, phone)
  VALUES (p_name, v_email, v_phone)
  ON CONFLICT (lower(email)) WHERE email IS NOT NULL
    DO UPDATE SET
      phone      = COALESCE(public.contacts.phone, EXCLUDED.phone),
      name       = CASE WHEN public.contacts.name IS NULL OR public.contacts.name = ''
                         THEN EXCLUDED.name ELSE public.contacts.name END,
      updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_contact_session_requests()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.contact_id := public.upsert_contact(NEW.name, NEW.email, NEW.phone);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_session_requests_contact ON public.session_requests;
CREATE TRIGGER trg_session_requests_contact BEFORE INSERT ON public.session_requests
  FOR EACH ROW EXECUTE FUNCTION public.sync_contact_session_requests();

CREATE OR REPLACE FUNCTION public.sync_contact_corporate_inquiries()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.contact_id := public.upsert_contact(NEW.name, NEW.work_email, NULL);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_corporate_inquiries_contact ON public.corporate_inquiries;
CREATE TRIGGER trg_corporate_inquiries_contact BEFORE INSERT ON public.corporate_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.sync_contact_corporate_inquiries();

CREATE OR REPLACE FUNCTION public.sync_contact_contact_messages()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.contact_id := public.upsert_contact(NEW.name, NEW.email, NULL);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_contact_messages_contact ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_contact BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.sync_contact_contact_messages();

-- Backfill any pre-existing rows.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id, name, email, phone FROM public.session_requests WHERE contact_id IS NULL LOOP
    UPDATE public.session_requests SET contact_id = public.upsert_contact(r.name, r.email, r.phone) WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id, name, work_email FROM public.corporate_inquiries WHERE contact_id IS NULL LOOP
    UPDATE public.corporate_inquiries SET contact_id = public.upsert_contact(r.name, r.work_email, NULL) WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id, name, email FROM public.contact_messages WHERE contact_id IS NULL LOOP
    UPDATE public.contact_messages SET contact_id = public.upsert_contact(r.name, r.email, NULL) WHERE id = r.id;
  END LOOP;
END $$;

-- contacts/contact_notes carry aggregated PII across a person's whole
-- history, so — unlike the submission tables — there is no public grant on
-- them at all; everything goes through admin-only RPCs.
CREATE OR REPLACE FUNCTION public.admin_contacts()
RETURNS TABLE(
  id                uuid,
  name              text,
  email             text,
  phone             text,
  submission_count  bigint,
  last_submission_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    c.id, c.name, c.email, c.phone,
    count(s.created_at)::bigint,
    max(s.created_at)
  FROM public.contacts c
  LEFT JOIN (
    SELECT contact_id, created_at FROM public.session_requests
    UNION ALL
    SELECT contact_id, created_at FROM public.corporate_inquiries
    UNION ALL
    SELECT contact_id, created_at FROM public.contact_messages
  ) s ON s.contact_id = c.id
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY c.id, c.name, c.email, c.phone
  ORDER BY max(s.created_at) DESC NULLS LAST;
$$;

CREATE OR REPLACE FUNCTION public.list_contact_notes(p_contact_id uuid)
RETURNS TABLE(id uuid, note text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT n.id, n.note, n.created_at
  FROM public.contact_notes n
  WHERE public.has_role(auth.uid(), 'admin') AND n.contact_id = p_contact_id
  ORDER BY n.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.add_contact_note(p_contact_id uuid, p_note text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  PERFORM public.assert_admin();
  IF trim(coalesce(p_note, '')) = '' THEN
    RAISE EXCEPTION 'Note cannot be empty.' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.contact_notes (contact_id, note) VALUES (p_contact_id, p_note) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON public.contacts FROM anon, authenticated;
REVOKE ALL ON public.contact_notes FROM anon, authenticated;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.contacts TO service_role;
GRANT ALL ON public.contact_notes TO service_role;

REVOKE ALL ON FUNCTION public.admin_contacts() FROM public, anon;
REVOKE ALL ON FUNCTION public.list_contact_notes(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.add_contact_note(uuid, text) FROM public, anon;

GRANT EXECUTE ON FUNCTION public.admin_contacts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_contact_notes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_contact_note(uuid, text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.analytics_health() TO authenticated;

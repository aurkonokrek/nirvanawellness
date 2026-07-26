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
      'corporate_inquiries', (SELECT count(*)::int FROM public.corporate_inquiries
        WHERE (created_at AT TIME ZONE public.kit_timezone())::date BETWEEN p_from AND p_to),
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

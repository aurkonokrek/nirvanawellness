-- ================================================================
-- NIRVANA WELLNESS — DATABASE FIX
--
-- Run this whole file, top to bottom, in the Supabase SQL Editor.
-- Idempotent — safe to run more than once, and safe to run against
-- either an empty project or one that already has the intake tables.
--
-- ----------------------------------------------------------------
-- TARGET PROJECT: etixzwoqvuolnofnfshm
--
-- The old Lovable Cloud backend (ozphaeggtpqgieuscpwh) has been
-- retired. .env, supabase/config.toml and the Supabase client now
-- all point at etixzwoq.
--
-- etixzwoq already has the admin user sumaia@gmail.com but NO tables,
-- so this script creates the whole schema from scratch. Parts 2 and 3
-- are therefore no-ops here — they exist so the file stays correct if
-- it is ever run against a project that already has the intake tables.
-- ----------------------------------------------------------------
--
-- WHY THIS IS NEEDED
--   The admin panel (commit d2915be) expects user_roles, has_role(),
--   site_settings and the analytics_* functions. They were never
--   applied to EITHER project. Without them: login fails or lands on
--   "Access denied", and Analytics/Settings are dead pages.
-- ================================================================


-- ================================================================
-- PART 1 — The full schema (verbatim copy of supabase/schema.sql)
--
-- Creates: app_role enum, site_settings, kit_meta, profiles,
-- user_roles, has_role(), the three intake tables, the
-- submission-management RPCs, the analytics_* RPCs, and all RLS.
--
-- Every CREATE is guarded (IF NOT EXISTS / OR REPLACE), so on a
-- project that already has the intake tables this only fills gaps.
-- ================================================================

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

-- ================================================================
-- PART 2 — Patch tables that already existed
--
-- PART 1 uses CREATE TABLE IF NOT EXISTS, so on a project where the
-- intake tables were created earlier by the Lovable migrations, it
-- SKIPS them entirely — leaving them missing columns the app and the
-- admin RPCs depend on.
--
-- This part must run AFTER Part 1, not before: on an empty project
-- the tables don't exist yet, and ALTER TABLE on a missing table
-- aborts the whole script.
--
-- Measured on 2026-07-26:
--   ozphae   session_requests    : updated_at MISSING
--            corporate_inquiries : updated_at MISSING
--            contact_messages    : OK
--   etixzwoq no tables at all — Part 1 creates them complete, so
--            everything here is a no-op.
--
-- `updated_at` matters most: Part 1 attaches a BEFORE UPDATE trigger
-- that sets NEW.updated_at. Without the column, every admin confirm
-- or reschedule would error at runtime.
-- ================================================================

ALTER TABLE public.session_requests
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS preferred_date date,
  ADD COLUMN IF NOT EXISTS expert_slug    text,
  ADD COLUMN IF NOT EXISTS expert_name    text,
  ADD COLUMN IF NOT EXISTS notes          text;

ALTER TABLE public.corporate_inquiries
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS preferred_date date;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS preferred_date date;

-- ================================================================
-- PART 3 — Retire the superseded INSERT policies
--
-- The original Lovable migrations created policies named
-- "Anyone can submit a …". Part 2 created equivalent ones
-- (*_anon_insert). Leaving both is harmless (permissive policies
-- OR together) but ambiguous. The new policies are a superset of
-- the old ones, so dropping the old ones cannot block a submission.
-- ================================================================

DROP POLICY IF EXISTS "Anyone can submit a session request"  ON public.session_requests;
DROP POLICY IF EXISTS "Anyone can submit a corporate inquiry" ON public.corporate_inquiries;
DROP POLICY IF EXISTS "Anyone can submit a contact message"   ON public.contact_messages;


-- ================================================================
-- PART 3B — Bug fix: analytics_sources misclassifies subdomains
--
-- The version in PART 2 (and in supabase/schema.sql) writes the
-- regex as '(^|\\.)(google|...)' . With standard_conforming_strings
-- ON — the Postgres default — a backslash inside a plain '...'
-- literal is NOT an escape, so the regex engine receives  (^|\\.)
-- which means "start of string" OR "a literal backslash followed by
-- any character". Hostnames never contain backslashes, so the
-- alternation collapses to ^ alone.
--
-- Effect: only bare domains are classified. Real-world referrers are
-- almost always subdomains, so they all fall through to 'referral':
--     google.com      -> search    (correct)
--     www.google.com  -> referral  (WRONG)
--     m.facebook.com  -> referral  (WRONG)
--
-- Fix: single backslash, so the regex sees (^|\.) = start-of-string
-- or a literal dot. Redefining the function here overrides PART 2.
-- ================================================================

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

GRANT EXECUTE ON FUNCTION public.analytics_sources(date, date) TO authenticated;


-- ================================================================
-- PART 4 — Make sumaia@gmail.com an admin
--
-- On etixzwoq the user sumaia@gmail.com ALREADY EXISTS and its password
-- is verified working. (The password itself is deliberately not written
-- down here — this repository is public. Ask the project owner, or reset
-- it from Authentication → Users.)
--
-- So this block should find the user and simply grant it the admin
-- role. Nothing needs creating first.
--
-- If you ever run this against a project where the user is absent,
-- create it via the dashboard first:
--   Authentication → Users → Add user
--     Auto Confirm : ON      <-- required, or login fails
--
-- Running this file BEFORE the user exists is safe: PART 4 skips
-- itself with a warning rather than raising an error, so Parts 1-3B
-- still apply. Create the user, then re-run PART 4 on its own.
-- ================================================================

DO $$
DECLARE
  v_email text := 'sumaia@gmail.com';
  v_uid   uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_uid IS NULL THEN
    -- Deliberately a WARNING, not an EXCEPTION. The Supabase SQL
    -- Editor runs the script in one transaction, so raising here
    -- would roll back Parts 1-3B too and fix nothing.
    RAISE WARNING
      'SKIPPED PART 4: user % does not exist in this project yet. Everything above WAS applied. Create the user in Authentication -> Users (Auto Confirm ON), then re-run PART 4 on its own.',
      v_email;
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.profiles (id, email, display_name)
  VALUES (v_uid, v_email, 'Sumaia')
  ON CONFLICT (id) DO NOTHING;

  -- The admin panel shows a forced "set a new password" screen while
  -- user_metadata.reset_required is true. Clear it so login goes
  -- straight through.
  UPDATE auth.users
  SET raw_user_meta_data =
        COALESCE(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('display_name', 'Sumaia', 'reset_required', false)
  WHERE id = v_uid;

  RAISE NOTICE 'Admin role granted to % (%)', v_email, v_uid;
END $$;


-- ================================================================
-- PART 5 — Verify. Run this and read the output.
-- Every row should say OK.
-- ================================================================

SELECT 'has_role() exists' AS check,
       CASE WHEN to_regprocedure('public.has_role(uuid, public.app_role)') IS NOT NULL
            THEN 'OK' ELSE 'MISSING' END AS result
UNION ALL
SELECT 'user_roles table',
       CASE WHEN to_regclass('public.user_roles')      IS NOT NULL THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'site_settings table',
       CASE WHEN to_regclass('public.site_settings')   IS NOT NULL THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'analytics_events table',
       CASE WHEN to_regclass('public.analytics_events') IS NOT NULL THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'notification_outbox table',
       CASE WHEN to_regclass('public.notification_outbox') IS NOT NULL THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'session_requests.updated_at',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_schema='public' AND table_name='session_requests'
                           AND column_name='updated_at') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'corporate_inquiries.updated_at',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_schema='public' AND table_name='corporate_inquiries'
                           AND column_name='updated_at') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'sumaia@gmail.com exists',
       CASE WHEN EXISTS (SELECT 1 FROM auth.users
                         WHERE lower(email)='sumaia@gmail.com') THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'sumaia@gmail.com is admin',
       CASE WHEN EXISTS (SELECT 1 FROM public.user_roles r
                         JOIN auth.users u ON u.id = r.user_id
                         WHERE lower(u.email)='sumaia@gmail.com' AND r.role='admin')
            THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'sumaia@gmail.com confirmed',
       CASE WHEN EXISTS (SELECT 1 FROM auth.users
                         WHERE lower(email)='sumaia@gmail.com'
                           AND email_confirmed_at IS NOT NULL)
            THEN 'OK' ELSE 'NOT CONFIRMED - login will fail' END;


-- ================================================================
-- APPENDIX (optional) — create the auth user purely in SQL
--
-- Only use this if the dashboard route in PART 4 is unavailable.
-- Creating users through the dashboard or the Admin API is the
-- supported path; writing to auth.users by hand depends on GoTrue's
-- internal table layout and can differ between versions.
--
-- To use: uncomment, set the password, run it, THEN run PART 4.
-- ================================================================

-- DO $$
-- DECLARE
--   v_email    text := 'sumaia@gmail.com';
--   v_password text := 'CHANGE-ME';    -- set before running; do not commit a real one
--   v_uid      uuid := gen_random_uuid();
-- BEGIN
--   IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(v_email)) THEN
--     RAISE NOTICE 'User % already exists — nothing to do.', v_email;
--     RETURN;
--   END IF;
--
--   INSERT INTO auth.users (
--     instance_id, id, aud, role, email, encrypted_password,
--     email_confirmed_at, created_at, updated_at,
--     raw_app_meta_data, raw_user_meta_data,
--     confirmation_token, recovery_token, email_change_token_new, email_change
--   ) VALUES (
--     '00000000-0000-0000-0000-000000000000', v_uid,
--     'authenticated', 'authenticated', v_email,
--     crypt(v_password, gen_salt('bf')),
--     now(), now(), now(),
--     '{"provider":"email","providers":["email"]}'::jsonb,
--     jsonb_build_object('display_name', 'Sumaia', 'reset_required', false),
--     '', '', '', ''
--   );
--
--   INSERT INTO auth.identities (
--     id, user_id, identity_data, provider, provider_id,
--     last_sign_in_at, created_at, updated_at
--   ) VALUES (
--     gen_random_uuid(), v_uid,
--     jsonb_build_object('sub', v_uid::text, 'email', v_email),
--     'email', v_uid::text, now(), now(), now()
--   );
--
--   RAISE NOTICE 'Created auth user % (%)', v_email, v_uid;
-- END $$;

-- Nirvana admin · Contacts / CRM (Phase 4)
--
-- Locked scope: contact records auto-built from submissions, deduped, with a
-- submission history and internal notes. No pipeline stages, owner
-- assignment, or follow-up tasks — that's explicitly out of scope.
--
-- Dedup key is EMAIL ONLY, not phone. All three submission tables have a
-- NOT NULL email-equivalent column, so email alone is a complete key — and
-- matching by phone too is actively wrong for this practice: session_requests
-- explicitly supports "couples" bookings, so two different people (partners)
-- can legitimately share one phone number. Merging them into one contact by
-- phone would attribute one partner's whole submission history to the other.
--
-- Idempotent.

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

-- ------------------------------------------------------------------
-- Find-or-create a contact by email (race-safe via ON CONFLICT — this runs
-- from a BEFORE INSERT trigger on tables the public can insert into
-- anonymously, so two simultaneous first-time submissions from the same
-- email must not both try to insert the contact row).
-- ------------------------------------------------------------------
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

-- Backfill any pre-existing rows (a no-op today at 0 rows in every table,
-- written correctly for when that stops being true).
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

-- ------------------------------------------------------------------
-- Admin reads/writes. contacts/contact_notes carry aggregated PII across a
-- person's whole history, so — unlike the submission tables — there is no
-- public grant on them at all; everything goes through admin-only RPCs.
-- ------------------------------------------------------------------
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

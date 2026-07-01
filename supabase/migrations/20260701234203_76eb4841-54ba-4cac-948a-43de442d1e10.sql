
-- Add length constraints
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_name_len CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT contact_messages_email_len CHECK (char_length(email) BETWEEN 3 AND 255),
  ADD CONSTRAINT contact_messages_message_len CHECK (char_length(message) BETWEEN 1 AND 2000),
  ADD CONSTRAINT contact_messages_email_fmt CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE public.corporate_inquiries
  ADD CONSTRAINT corp_name_len CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT corp_role_len CHECK (role IS NULL OR char_length(role) <= 120),
  ADD CONSTRAINT corp_org_len CHECK (char_length(organisation) BETWEEN 1 AND 150),
  ADD CONSTRAINT corp_email_len CHECK (char_length(work_email) BETWEEN 3 AND 255),
  ADD CONSTRAINT corp_email_fmt CHECK (work_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT corp_team_len CHECK (team_size IS NULL OR char_length(team_size) <= 60),
  ADD CONSTRAINT corp_prog_len CHECK (program_interest IS NULL OR char_length(program_interest) <= 200),
  ADD CONSTRAINT corp_ctx_len CHECK (context IS NULL OR char_length(context) <= 2000);

ALTER TABLE public.session_requests
  ADD CONSTRAINT sr_name_len CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT sr_email_len CHECK (char_length(email) BETWEEN 3 AND 255),
  ADD CONSTRAINT sr_email_fmt CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT sr_phone_len CHECK (phone IS NULL OR char_length(phone) <= 40),
  ADD CONSTRAINT sr_stype_len CHECK (session_type IS NULL OR char_length(session_type) <= 100),
  ADD CONSTRAINT sr_fmt_len CHECK (preferred_format IS NULL OR char_length(preferred_format) <= 60),
  ADD CONSTRAINT sr_tz_len CHECK (timezone IS NULL OR char_length(timezone) <= 80),
  ADD CONSTRAINT sr_notes_len CHECK (notes IS NULL OR char_length(notes) <= 2000);

-- Replace permissive WITH CHECK (true) INSERT policies with explicit, non-true expressions.
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 1 AND 2000
    AND status = 'new'
  );

ALTER TABLE public.contact_messages ALTER COLUMN status SET DEFAULT 'new';

DROP POLICY IF EXISTS "Anyone can submit a corporate inquiry" ON public.corporate_inquiries;
CREATE POLICY "Anyone can submit a corporate inquiry"
  ON public.corporate_inquiries FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(organisation) BETWEEN 1 AND 150
    AND char_length(work_email) BETWEEN 3 AND 255
    AND status = 'new'
  );

ALTER TABLE public.corporate_inquiries ALTER COLUMN status SET DEFAULT 'new';

DROP POLICY IF EXISTS "Anyone can submit a session request" ON public.session_requests;
CREATE POLICY "Anyone can submit a session request"
  ON public.session_requests FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND status = 'new'
  );

ALTER TABLE public.session_requests ALTER COLUMN status SET DEFAULT 'new';

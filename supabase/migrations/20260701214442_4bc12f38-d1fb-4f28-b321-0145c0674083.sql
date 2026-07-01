
-- Session requests
CREATE TABLE public.session_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  session_type text NOT NULL,
  preferred_format text NOT NULL,
  timezone text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.session_requests TO anon, authenticated;
GRANT ALL ON public.session_requests TO service_role;
ALTER TABLE public.session_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a session request" ON public.session_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Corporate inquiries
CREATE TABLE public.corporate_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  organisation text NOT NULL,
  work_email text NOT NULL,
  team_size text,
  program_interest text,
  context text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.corporate_inquiries TO anon, authenticated;
GRANT ALL ON public.corporate_inquiries TO service_role;
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a corporate inquiry" ON public.corporate_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Contact messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

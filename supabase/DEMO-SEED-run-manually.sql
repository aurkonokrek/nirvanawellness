-- Nirvana admin — realistic DEMO data so the redesign is judged with content
-- in it, not an empty state. Uses real expert names/slugs and real page
-- paths from the site's own data files so Top Pages / expert_name look true
-- to life. Idempotent-ish: guarded by a marker check so re-running the seed
-- script twice doesn't double the rows.
--
-- HOW TO RUN: paste this whole file into the Supabase SQL editor for project
-- etixzwoqvuolnofnfshm and execute. This was intentionally NOT applied by
-- Claude — it writes fabricated client-looking data (names, emails, phone
-- numbers) into production, which needs a human to press the button.
--
-- ALL of the client-facing rows below (session_requests, corporate_inquiries,
-- contact_messages) are fictional, for admin-panel testing only. Delete them
-- before the practice relies on this data being real:
--   delete from session_requests    where created_at < '<go-live date>';
--   delete from corporate_inquiries where created_at < '<go-live date>';
--   delete from contact_messages    where created_at < '<go-live date>';
--   delete from analytics_events    where occurred_at < '<go-live date>';
--   delete from site_settings where key in ('demo_data_seeded', 'demo_analytics_seeded');

do $$
begin
  if exists (select 1 from public.site_settings where key = 'demo_data_seeded') then
    raise notice 'Seed already applied, skipping.';
    return;
  end if;

  -- ------------------------------------------------------------------
  -- session_requests
  -- ------------------------------------------------------------------
  insert into public.session_requests
    (name, email, phone, session_type, preferred_format, timezone, preferred_date, expert_slug, expert_name, notes, admin_notes, status, created_at)
  values
    ('Farah Ahmed', 'farah.ahmed82@gmail.com', '+8801711223344', 'individual', 'in-person', 'Asia/Dhaka', current_date + 3, 'sumaia-azmi', 'Sumaia Azmi', 'Looking for someone to talk to about work stress and sleep issues.', null, 'new', now() - interval '2 hours'),
    ('Tanvir Islam', 'tanvir.islam@outlook.com', '+8801912345678', 'individual', 'online', 'Asia/Dhaka', current_date + 5, 'sanjida-afroz', 'Sanjida Afroz', 'Referred by a friend. First time trying therapy.', null, 'new', now() - interval '6 hours'),
    ('Nusrat & Rafiq', 'nusrat.rafiq@gmail.com', '+8801611998877', 'couples', 'in-person', 'Asia/Dhaka', current_date + 2, 'aparazita-rahman', 'Aparazita Rahman', 'Married 6 years, communication has broken down since our second child.', 'Called ahead to confirm evening slot — prefers after 7pm.', 'confirmed', now() - interval '1 day'),
    ('James Whitfield', 'j.whitfield@expatmail.com', '+8801555667788', 'individual', 'online', 'Europe/London', current_date + 7, 'dr-richard-castle', 'Dr. Richard Castle', 'Relocated to Dhaka 3 months ago for work, struggling with the adjustment.', null, 'new', now() - interval '3 hours'),
    ('Shirin Kabir', 'shirin.kabir@yahoo.com', null, 'individual', 'either', 'Asia/Dhaka', current_date + 1, 'shadin-haque', 'Shadin Haque', 'Anxiety around an upcoming medical procedure.', 'Sent confirmation SMS 2026-07-25.', 'confirmed', now() - interval '2 days'),
    ('Anika Chowdhury', 'anika.c@gmail.com', '+8801777889900', 'unsure', 'in-person', 'Asia/Dhaka', current_date + 10, null, null, 'Not sure what kind of support I need, just know I need to talk to someone.', null, 'new', now() - interval '4 hours'),
    ('Rezaul Karim', 'rezaul.karim@corp-bd.com', '+8801822334455', 'individual', 'online', 'Asia/Dhaka', current_date - 2, 'abhijeet-vaishnav', 'Abhijeet Vaishnav', 'Burnout, considering a career change.', 'Rescheduled once already — be flexible on next date.', 'rescheduled', now() - interval '5 days'),
    ('Priyanka Das', 'priyanka.das@gmail.com', '+8801933445566', 'couples', 'either', 'Asia/Dhaka', current_date - 5, 'aparazita-rahman', 'Aparazita Rahman', 'Pre-marital counselling.', 'Completed session, both very satisfied.', 'closed', now() - interval '9 days'),
    ('Michael Sørensen', 'msorensen@nordicgroup.dk', '+4551234567', 'individual', 'online', 'Europe/Berlin', current_date - 8, 'dr-richard-castle', 'Dr. Richard Castle', 'Remote employee based in Dhaka office, homesickness and isolation.', null, 'contacted', now() - interval '11 days'),
    ('Tahmina Sultana', 'tahmina.sultana@gmail.com', '+8801644556677', 'individual', 'in-person', 'Asia/Dhaka', current_date - 12, 'sumaia-azmi', 'Sumaia Azmi', 'Grief counselling following a parent''s passing.', null, 'closed', now() - interval '15 days'),
    ('Imran Chowdhury', 'imran.c@startup.io', null, 'individual', 'online', 'Asia/Singapore', current_date + 4, null, null, 'Panic attacks over the last month, work-related.', null, 'new', now() - interval '30 minutes'),
    ('Lubna & Kamal Hossain', 'lubna.hossain@gmail.com', '+8801711009988', 'couples', 'in-person', 'Asia/Dhaka', current_date - 20, 'aparazita-rahman', 'Aparazita Rahman', 'Trust issues after infidelity.', 'Client cancelled — said they''d reach out again when ready.', 'cancelled', now() - interval '22 days')
  ;

  -- ------------------------------------------------------------------
  -- corporate_inquiries
  -- ------------------------------------------------------------------
  insert into public.corporate_inquiries
    (name, role, organisation, work_email, team_size, program_interest, context, admin_notes, preferred_date, status, created_at)
  values
    ('Farhana Yasmin', 'Head of People', 'BrightPath Technologies', 'farhana.yasmin@brightpath.com.bd', '50-100', 'Team Reset (2-day)', 'Our engineering team has had a rough quarter — two rounds of layoffs adjacent to us, morale is low.', null, current_date + 14, 'new', now() - interval '1 day'),
    ('Sabbir Rahman', 'HR Director', 'Meridian Textiles Ltd', 'sabbir.rahman@meridiantex.com', '200+', 'Leadership Off-site (3-day)', 'Looking for a leadership retreat for our senior management team, ideally outside Dhaka.', 'Sent proposal deck 2026-07-24, awaiting budget approval on their end.', current_date + 30, 'contacted', now() - interval '6 days'),
    ('Elena Vasquez', 'Regional HR Lead', 'Global Freight Solutions', 'e.vasquez@globalfreight.com', '20-50', 'Workshop series', 'Small regional office, interested in a recurring monthly wellness workshop for staff.', null, current_date + 21, 'new', now() - interval '3 hours'),
    ('Nasrin Akter', 'Founder', 'Akter & Co Law Firm', 'nasrin@akterlaw.bd', '10-20', 'Team Reset (2-day)', 'Small partner-track firm, high billable-hour culture, want to get ahead of burnout.', 'Confirmed for the Sept cohort.', current_date + 45, 'confirmed', now() - interval '10 days'),
    ('David Okoro', 'CHRO', 'PanAfrica Logistics BD', 'd.okoro@panafricalog.com', '100-200', 'Leadership Off-site (3-day)', 'Considering this for Q4, would like a call first to discuss facilitator fit.', null, current_date - 3, 'rescheduled', now() - interval '14 days')
  ;

  -- ------------------------------------------------------------------
  -- contact_messages
  -- ------------------------------------------------------------------
  insert into public.contact_messages
    (name, email, message, admin_notes, status, created_at)
  values
    ('Rashida Begum', 'rashida.begum@gmail.com', 'Hi, do you offer sessions in Bangla? My mother would be more comfortable in her first language.', null, 'new', now() - interval '1 hour'),
    ('Connor Ashworth', 'connor.ashworth@mediahouse.co.uk', 'I write for a wellness publication and would love to feature Nirvana in a piece on mental health access in South Asia. Who should I speak with?', 'Forwarded to Sumaia for comment.', 'contacted', now() - interval '4 days'),
    ('Mitali Sarker', 'mitali.sarker@gmail.com', 'Is there a sliding scale fee for students? I''m a university student and really want to start therapy but the listed rate is a stretch.', null, 'new', now() - interval '8 hours'),
    ('Ovi Ahmed', 'ovi.ahmed99@gmail.com', 'Just wanted to say the retreat last month changed my outlook completely. Thank you to the whole team.', 'Lovely note — consider for a testimonial (with permission).', 'closed', now() - interval '18 days'),
    ('Zara Islam', 'zara.islam@gmail.com', 'Do you have wheelchair access at the Dhaka location?', 'Confirmed yes, replied directly.', 'closed', now() - interval '25 days')
  ;

  -- Marker so re-runs of this script are a no-op. Delete this row (and all
  -- rows above) before the practice goes live with real client data —
  -- `delete from session_requests/corporate_inquiries/contact_messages where
  -- created_at < <go-live date>` plus `delete from site_settings where
  -- key = 'demo_data_seeded'`.
  insert into public.site_settings (key, value)
  values ('demo_data_seeded', now()::text)
  on conflict (key) do nothing;
end $$;

-- ------------------------------------------------------------------
-- analytics_events — 30 days of realistic-shaped traffic across real
-- site paths, with a mix of direct/search/social referrers and
-- desktop/mobile devices, weighted so /book and expert pages get
-- healthy but not overwhelming traffic.
-- ------------------------------------------------------------------
do $$
declare
  d date;
  n int;
  paths text[] := array[
    '/', '/', '/', '/approach', '/experts', '/experts/sumaia-azmi', '/experts/sanjida-afroz',
    '/experts/dr-richard-castle', '/book', '/book', '/corporate', '/resources',
    '/resources/what-talk-therapy-cant-reach', '/resources/five-minute-practice-hard-week',
    '/retreats', '/retreats/team-reset-2-day', '/resources/tests'
  ];
  referrers text[] := array[
    null, null, null, 'https://www.google.com/', 'https://www.google.com/',
    'https://www.facebook.com/', 'https://www.instagram.com/', 'https://www.bing.com/',
    'https://l.instagram.com/', 'https://m.facebook.com/'
  ];
  devices text[] := array['mobile', 'mobile', 'desktop', 'desktop', 'tablet'];
  i int;
  p text;
  r text;
  dev text;
  visitor text;
begin
  if exists (select 1 from public.site_settings where key = 'demo_analytics_seeded') then
    raise notice 'Analytics seed already applied, skipping.';
    return;
  end if;

  for d in select generate_series(current_date - 29, current_date, interval '1 day')::date loop
    -- Weekdays busier than weekends; slow ramp up toward "today".
    n := (6 + (random() * 10)::int) + case when extract(dow from d) in (0,6) then -3 else 0 end;
    n := greatest(n, 2);
    for i in 1..n loop
      p := paths[1 + floor(random() * array_length(paths, 1))::int];
      r := referrers[1 + floor(random() * array_length(referrers, 1))::int];
      dev := devices[1 + floor(random() * array_length(devices, 1))::int];
      visitor := md5(d::text || '-' || i::text || '-' || p);
      insert into public.analytics_events (occurred_at, event_type, path, referrer_host, visitor_hash, device)
      values (
        d + (random() * interval '20 hours') + interval '4 hours',
        'pageview',
        p,
        case when r is null then null else regexp_replace(r, '^https?://', '') end,
        visitor,
        dev
      );
    end loop;
  end loop;

  -- Marker so re-runs of this script are a no-op. Before going live, clear
  -- with `delete from analytics_events where occurred_at < <go-live date>`
  -- plus `delete from site_settings where key = 'demo_analytics_seeded'`.
  insert into public.site_settings (key, value)
  values ('demo_analytics_seeded', now()::text)
  on conflict (key) do nothing;
end $$;

select
  (select count(*) from public.session_requests) as session_requests,
  (select count(*) from public.corporate_inquiries) as corporate_inquiries,
  (select count(*) from public.contact_messages) as contact_messages,
  (select count(*) from public.analytics_events) as analytics_events;

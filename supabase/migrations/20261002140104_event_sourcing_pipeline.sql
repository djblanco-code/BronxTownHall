CREATE TABLE public.event_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz,
  last_status text,
  last_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_sources TO authenticated;
GRANT ALL ON public.event_sources TO service_role;
ALTER TABLE public.event_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage event sources" ON public.event_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.scraped_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.event_sources(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_date date NOT NULL,
  event_time text,
  location text,
  description text,
  event_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  possible_duplicate boolean NOT NULL DEFAULT false,
  duplicate_note text,
  dedupe_key text NOT NULL UNIQUE,
  published_resource_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scraped_events TO authenticated;
GRANT ALL ON public.scraped_events TO service_role;
ALTER TABLE public.scraped_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage scraped events" ON public.scraped_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.event_sources (name, url) VALUES
 ('NYPL – Bronx branches', 'https://www.nypl.org/events/calendar?location=bronx'),
 ('Fordham University events', 'https://www.fordham.edu/events/'),
 ('Lehman College events', 'https://www.lehman.edu/events/'),
 ('Bronx Community College events', 'https://www.bcc.cuny.edu/about-bcc/events/'),
 ('Hostos Community College events', 'https://www.hostos.cuny.edu/Events');

-- Events table for hyper-local Bronx events with community submission + moderation
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'other',
  category TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  address TEXT,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  cost TEXT,
  contact TEXT,
  website TEXT,
  image_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_community_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_by TEXT,
  submitted_email TEXT,
  submitted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  views INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved events
CREATE POLICY "Approved events are public" ON public.events
  FOR SELECT USING (approval_status = 'approved');

-- Users can read their own submissions regardless of status
CREATE POLICY "Users read own submissions" ON public.events
  FOR SELECT TO authenticated
  USING (submitted_user_id = auth.uid());

-- Admins read everything
CREATE POLICY "Admins read all events" ON public.events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Anyone (including anon) can submit; forced to pending & community_submitted
CREATE POLICY "Anyone can submit events" ON public.events
  FOR INSERT
  WITH CHECK (approval_status = 'pending' AND is_community_submitted = TRUE);

-- Admins can update/delete (moderation)
CREATE POLICY "Admins update events" ON public.events
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete events" ON public.events
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX events_date_idx ON public.events(event_date);
CREATE INDEX events_status_idx ON public.events(approval_status);

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed approved sample events
INSERT INTO public.events (title, description, event_type, category, event_date, event_time, location, address, is_free, cost, website, is_verified, is_community_submitted, approval_status) VALUES
('Bronx Frame Film Screening','Films from local Bronx filmmakers with post-screening artist talkback.','arts_culture','art','2026-08-01','7:00 PM','Andrew Freedman Home','1125 Grand Concourse, Bronx, NY 10452',TRUE,'Free · Donations accepted',NULL,TRUE,FALSE,'approved'),
('All My Ands — Film & Writing Session','Experimental film screening, artist talkback, and free writing session. Materials provided.','arts_culture','art','2026-08-02','3:00 PM','Andrew Freedman Home','1125 Grand Concourse, Bronx, NY 10452',TRUE,'Free · Writing materials provided',NULL,TRUE,FALSE,'approved'),
('Bronx Art and Book Festival','Free festival with books, art, photography, poetry, and children''s activities.','festival','art','2026-08-08','12:00 PM','Bronx Museum of the Arts','1040 Grand Concourse, Bronx, NY 10456',TRUE,'Free · All ages welcome','https://bronxmuseum.org',TRUE,FALSE,'approved'),
('Reduce, Renew and Recycle — Exhibit Opening','Art made from recycled materials. Opening reception; runs through August.','arts_culture','art','2026-08-15','2:00 PM','Christ Church Riverdale','5040 Henry Hudson Pkwy, Bronx, NY 10471',TRUE,'Free',NULL,TRUE,FALSE,'approved'),
('Bronx Artists Spring Forum','Networking and community updates for Bronx-based artists.','arts_culture','art','2026-09-10','6:00 PM','Bronx Council on the Arts HQ','2700 East Tremont Ave, Bronx, NY 10461',TRUE,'Free',NULL,TRUE,FALSE,'approved'),
('BxArts Factory Block pARTy','Family-friendly annual celebration: live painting, poetry, games, arts & crafts.','block_party','art','2026-08-22','1:00 PM','BxArts Factory','South Bronx (see website)',TRUE,'Free',NULL,TRUE,FALSE,'approved'),
('Riverdale Block Party','Annual community event: vendors, live music, taekwondo demo, doggie parade.','block_party','community','2026-08-29','11:00 AM','Riverdale','Riverdale Ave, Bronx, NY',TRUE,'Free',NULL,TRUE,FALSE,'approved'),
('Music in the Garden','Weekly summer concerts featuring Bronx-based artists.','festival','recreation','2026-08-07','7:00 PM','Riverdale Neighborhood House','5521 Mosholu Ave, Bronx, NY 10471',TRUE,'Free',NULL,TRUE,FALSE,'approved'),
('Riverdale Y 5K & Fun Run','Community race event with a family fun run.','recreation','recreation','2026-09-19','9:00 AM','Riverdale YM-YWHA','5625 Arlington Ave, Bronx, NY 10471',FALSE,'Registration required',NULL,TRUE,FALSE,'approved'),
('Free Summer Concert — Caribbean Jazz','Bronx Council on the Arts free concert series.','festival','art','2026-08-10','7:00 PM','Bronx Council on the Arts','2700 East Tremont Ave, Bronx, NY',TRUE,'Free',NULL,TRUE,FALSE,'approved');

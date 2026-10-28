-- Traffic / community alerts
CREATE TABLE public.traffic_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('accident','closure','hazard','traffic_light','other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 200),
  description TEXT CHECK (description IS NULL OR length(description) <= 2000),
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  zip_codes TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'official' CHECK (source IN ('311','community','official','dot')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  is_resolved BOOLEAN NOT NULL DEFAULT false
);
GRANT SELECT ON public.traffic_alerts TO anon, authenticated;
GRANT ALL ON public.traffic_alerts TO service_role;
ALTER TABLE public.traffic_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active alerts" ON public.traffic_alerts
  FOR SELECT TO anon, authenticated USING (is_resolved = false OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage alerts" ON public.traffic_alerts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER traffic_alerts_updated BEFORE UPDATE ON public.traffic_alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_traffic_alerts_created ON public.traffic_alerts(created_at DESC);
CREATE INDEX idx_traffic_alerts_zip ON public.traffic_alerts USING GIN(zip_codes);

-- Community submissions (moderated)
CREATE TABLE public.community_alert_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_name TEXT CHECK (submitter_name IS NULL OR length(submitter_name) <= 120),
  submitter_email TEXT CHECK (submitter_email IS NULL OR submitter_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('accident','closure','hazard','traffic_light','other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 200),
  description TEXT CHECK (description IS NULL OR length(description) <= 2000),
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  zip_code TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes TEXT
);
GRANT INSERT ON public.community_alert_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.community_alert_submissions TO authenticated;
GRANT ALL ON public.community_alert_submissions TO service_role;
ALTER TABLE public.community_alert_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an alert" ON public.community_alert_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(title) BETWEEN 3 AND 200
    AND alert_type IN ('accident','closure','hazard','traffic_light','other')
    AND severity IN ('low','medium','high')
    AND status = 'pending'
    AND admin_notes IS NULL
  );
CREATE POLICY "Admins read submissions" ON public.community_alert_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());
CREATE POLICY "Admins moderate submissions" ON public.community_alert_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER community_alerts_updated BEFORE UPDATE ON public.community_alert_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_alert_subs_status ON public.community_alert_submissions(status, created_at DESC);
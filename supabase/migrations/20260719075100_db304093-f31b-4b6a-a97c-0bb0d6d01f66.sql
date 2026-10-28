CREATE TABLE public.entrepreneur_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 5 AND 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  idea_summary TEXT NOT NULL CHECK (length(idea_summary) BETWEEN 5 AND 4000),
  stage TEXT NOT NULL CHECK (stage IN ('idea','planning','launching','operating','growing')),
  help_needed TEXT[] NOT NULL DEFAULT '{}',
  contacted BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

GRANT INSERT ON public.entrepreneur_leads TO anon;
GRANT SELECT, INSERT, UPDATE ON public.entrepreneur_leads TO authenticated;
GRANT ALL ON public.entrepreneur_leads TO service_role;

ALTER TABLE public.entrepreneur_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead" ON public.entrepreneur_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read leads" ON public.entrepreneur_leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update leads" ON public.entrepreneur_leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER entrepreneur_leads_set_updated_at
  BEFORE UPDATE ON public.entrepreneur_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_entrepreneur_leads_created_at ON public.entrepreneur_leads(created_at DESC);
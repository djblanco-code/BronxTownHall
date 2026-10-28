CREATE TABLE public.resource_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id text NOT NULL,
  resource_type text NOT NULL,
  reason text NOT NULL,
  details text,
  reporter_email text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.resource_reports TO anon, authenticated;
GRANT SELECT, UPDATE ON public.resource_reports TO authenticated;
GRANT ALL ON public.resource_reports TO service_role;

ALTER TABLE public.resource_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a report"
  ON public.resource_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read reports"
  ON public.resource_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
  ON public.resource_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_resource_reports_updated_at
  BEFORE UPDATE ON public.resource_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
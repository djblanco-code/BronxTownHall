
ALTER TABLE public.resource_reports
  ADD COLUMN IF NOT EXISTS resolution_note text,
  ADD COLUMN IF NOT EXISTS resource_name text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

GRANT SELECT ON public.resource_reports TO anon;

DROP POLICY IF EXISTS "Anyone can read fixed reports" ON public.resource_reports;
CREATE POLICY "Anyone can read fixed reports"
  ON public.resource_reports
  FOR SELECT
  TO anon, authenticated
  USING (status = 'fixed');

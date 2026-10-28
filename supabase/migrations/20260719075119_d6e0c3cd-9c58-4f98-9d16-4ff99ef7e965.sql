DROP POLICY "Anyone can submit a lead" ON public.entrepreneur_leads;

CREATE POLICY "Anyone can submit a lead" ON public.entrepreneur_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 120
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(idea_summary) BETWEEN 5 AND 4000
    AND stage IN ('idea','planning','launching','operating','growing')
    AND contacted = false
    AND notes IS NULL
  );
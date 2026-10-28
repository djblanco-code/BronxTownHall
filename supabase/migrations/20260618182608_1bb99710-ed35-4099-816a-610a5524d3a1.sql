
DROP POLICY IF EXISTS "anyone requests insert" ON public.resource_requests;
CREATE POLICY "submit own request" ON public.resource_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

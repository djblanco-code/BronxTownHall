-- Anonymous visitors could edit or delete any business listing. Lock writes to admins.
DROP POLICY IF EXISTS "Anyone can update a business listing" ON public.businesses;
DROP POLICY IF EXISTS "Anyone can update a business event" ON public.business_events;

CREATE POLICY "Admins can update business listings"
ON public.businesses FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update business events"
ON public.business_events FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

REVOKE UPDATE, DELETE ON public.businesses FROM anon;
REVOKE UPDATE, DELETE ON public.business_events FROM anon;
GRANT SELECT, INSERT ON public.businesses TO anon;
GRANT SELECT, INSERT ON public.business_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_events TO authenticated;
GRANT ALL ON public.businesses TO service_role;
GRANT ALL ON public.business_events TO service_role;
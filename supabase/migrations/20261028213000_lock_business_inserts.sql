-- Anyone, even without signing in, could add business listings and events
-- (including ones already marked live, verified or premium), and every
-- visitor's app then displayed them. Business sign-up now goes through the
-- org portal, so new rows here come from admins only.
DROP POLICY IF EXISTS "Anyone can add a business listing" ON public.businesses;
DROP POLICY IF EXISTS "Anyone can add a business event" ON public.business_events;

REVOKE INSERT ON public.businesses FROM anon;
REVOKE INSERT ON public.business_events FROM anon;

CREATE POLICY "Admins can add business listings"
ON public.businesses FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can add business events"
ON public.business_events FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Listings are public, so their `data` copy must never carry the owner's
-- sign-in email or password. Clean existing rows and keep them clean.
UPDATE public.businesses
SET data = data - 'email' - 'password'
WHERE data ? 'email' OR data ? 'password';

CREATE OR REPLACE FUNCTION public.strip_business_private_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.data := COALESCE(NEW.data, '{}'::jsonb) - 'email' - 'password';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS businesses_strip_private_fields ON public.businesses;
CREATE TRIGGER businesses_strip_private_fields
BEFORE INSERT OR UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.strip_business_private_fields();

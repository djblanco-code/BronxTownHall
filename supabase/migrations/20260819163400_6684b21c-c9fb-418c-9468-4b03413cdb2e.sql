CREATE TABLE public.businesses (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone text,
  website text,
  category text,
  subcategory text,
  description text,
  hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  latitude double precision,
  longitude double precision,
  tier text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'pending',
  verified boolean NOT NULL DEFAULT false,
  verified_date timestamptz,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.businesses TO anon;
GRANT ALL ON public.businesses TO service_role;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses are publicly viewable"
  ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Anyone can add a business listing"
  ON public.businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update a business listing"
  ON public.businesses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete business listings"
  ON public.businesses FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER businesses_set_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.business_events (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_date date,
  event_time text,
  location text,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.business_events TO anon;
GRANT ALL ON public.business_events TO service_role;

ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business events are publicly viewable"
  ON public.business_events FOR SELECT USING (true);
CREATE POLICY "Anyone can add a business event"
  ON public.business_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update a business event"
  ON public.business_events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete business events"
  ON public.business_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER business_events_set_updated_at
  BEFORE UPDATE ON public.business_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
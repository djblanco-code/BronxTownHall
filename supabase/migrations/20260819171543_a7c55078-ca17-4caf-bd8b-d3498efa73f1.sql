CREATE TABLE public.resources (
  id text PRIMARY KEY,
  category text NOT NULL,
  subcategory text,
  name text NOT NULL,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text NOT NULL DEFAULT '',
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text,
  hours text NOT NULL DEFAULT '',
  hours_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  neighborhood text,
  community_board int,
  distance numeric NOT NULL DEFAULT 0,
  free boolean NOT NULL DEFAULT true,
  open_now boolean NOT NULL DEFAULT false,
  requirements_i18n jsonb,
  ownership text[] NOT NULL DEFAULT '{}',
  heritage text[] NOT NULL DEFAULT '{}',
  dietary text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  accessibility text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  minor_eligibility text,
  translated_langs text[] NOT NULL DEFAULT '{}',
  source text,
  source_url text,
  verification_status text NOT NULL DEFAULT 'needs_verification',
  last_verified timestamptz,
  verify_every_days int NOT NULL DEFAULT 180,
  organization_id text,
  submitted_by text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active resources" ON public.resources
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can read all resources" ON public.resources
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert resources" ON public.resources
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update resources" ON public.resources
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete resources" ON public.resources
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER resources_set_updated_at BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX resources_category_idx ON public.resources (category) WHERE is_active;
CREATE INDEX resources_neighborhood_idx ON public.resources (neighborhood) WHERE is_active;

CREATE TABLE public.verification_policies (
  category text PRIMARY KEY,
  verify_every_days int NOT NULL DEFAULT 180,
  note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.verification_policies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_policies TO authenticated;
GRANT ALL ON public.verification_policies TO service_role;
ALTER TABLE public.verification_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verification policies" ON public.verification_policies
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage verification policies" ON public.verification_policies
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.verification_policies (category, verify_every_days, note) VALUES
  ('food', 90, 'Pantries and meal programs change hours often'),
  ('health', 365, 'Clinics and hospitals are stable'),
  ('legal', 180, NULL),
  ('jobs', 120, NULL),
  ('events', 30, 'Verify before the event date'),
  ('government', 365, 'Follows official source updates'),
  ('childcare', 180, NULL),
  ('youth', 120, NULL),
  ('housing', 180, NULL),
  ('education', 180, NULL),
  ('money', 180, NULL),
  ('family', 180, NULL),
  ('nature', 365, NULL),
  ('art', 180, NULL),
  ('recreation', 180, NULL);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS community_board int,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'needs_verification',
  ADD COLUMN IF NOT EXISTS last_verified timestamptz,
  ADD COLUMN IF NOT EXISTS organization_id text;

CREATE TABLE public.listing_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id text NOT NULL,
  resource_name text,
  claimant_name text NOT NULL,
  claimant_email text NOT NULL,
  claimant_role text,
  phone text,
  website text,
  corrections text,
  status text NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.listing_claims TO anon;
GRANT SELECT, INSERT, UPDATE ON public.listing_claims TO authenticated;
GRANT ALL ON public.listing_claims TO service_role;
ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a claim" ON public.listing_claims
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read claims" ON public.listing_claims
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update claims" ON public.listing_claims
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER listing_claims_set_updated_at BEFORE UPDATE ON public.listing_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
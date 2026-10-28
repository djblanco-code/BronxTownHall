-- ============ CATEGORY REGISTRY (extensible domains) ============
CREATE TABLE public.bronx_resource_categories (
  id text PRIMARY KEY,
  domain text NOT NULL,
  label text NOT NULL,
  subcategories text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bronx_resource_categories TO anon, authenticated;
GRANT ALL ON public.bronx_resource_categories TO service_role;
ALTER TABLE public.bronx_resource_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable by everyone" ON public.bronx_resource_categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.bronx_resource_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ MASTER RESOURCE TABLE ============
CREATE TABLE public.bronx_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  resource_name text,
  resource_category text NOT NULL REFERENCES public.bronx_resource_categories(id),
  resource_subcategory text,
  address text,
  borough text NOT NULL DEFAULT 'Bronx',
  neighborhood text,
  zip_code text,
  phone text,
  email text,
  website text,
  hours text,
  eligibility text,
  languages text[] NOT NULL DEFAULT '{}',
  description text,
  latitude double precision,
  longitude double precision,
  source text,
  source_url text,
  source_record_id text,
  last_verified timestamptz,
  verification_status text NOT NULL DEFAULT 'needs_verification'
    CHECK (verification_status IN ('verified','needs_verification','temporarily_unverified','inactive')),
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verification_method text,
  verification_note text,
  active boolean NOT NULL DEFAULT true,
  merged_into uuid REFERENCES public.bronx_resources(id) ON DELETE SET NULL,
  dedupe_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bronx_only CHECK (borough = 'Bronx')
);
CREATE INDEX bronx_resources_category_idx ON public.bronx_resources (resource_category) WHERE active;
CREATE INDEX bronx_resources_zip_idx ON public.bronx_resources (zip_code);
CREATE INDEX bronx_resources_dedupe_idx ON public.bronx_resources (dedupe_key);
CREATE INDEX bronx_resources_merged_idx ON public.bronx_resources (merged_into);

GRANT SELECT ON public.bronx_resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bronx_resources TO authenticated;
GRANT ALL ON public.bronx_resources TO service_role;
ALTER TABLE public.bronx_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active listings are public" ON public.bronx_resources FOR SELECT
  USING (active AND merged_into IS NULL);
CREATE POLICY "admins read all listings" ON public.bronx_resources FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert listings" ON public.bronx_resources FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update listings" ON public.bronx_resources FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete listings" ON public.bronx_resources FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER bronx_resources_set_updated_at BEFORE UPDATE ON public.bronx_resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER bronx_resource_categories_set_updated_at BEFORE UPDATE ON public.bronx_resource_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SOURCE PROVENANCE ============
CREATE TABLE public.bronx_resource_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.bronx_resources(id) ON DELETE CASCADE,
  source text NOT NULL,
  source_label text NOT NULL,
  source_url text,
  source_record_id text,
  source_priority integer NOT NULL DEFAULT 50,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  fields_contributed text[] NOT NULL DEFAULT '{}',
  source_last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resource_id, source, source_record_id)
);
CREATE INDEX bronx_resource_sources_resource_idx ON public.bronx_resource_sources (resource_id);

GRANT SELECT ON public.bronx_resource_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bronx_resource_sources TO authenticated;
GRANT ALL ON public.bronx_resource_sources TO service_role;
ALTER TABLE public.bronx_resource_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sources of public listings are public" ON public.bronx_resource_sources FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bronx_resources r WHERE r.id = resource_id AND r.active AND r.merged_into IS NULL));
CREATE POLICY "admins read all sources" ON public.bronx_resource_sources FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write sources" ON public.bronx_resource_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER bronx_resource_sources_set_updated_at BEFORE UPDATE ON public.bronx_resource_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ IMPORT LOG ============
CREATE TABLE public.bronx_resource_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  format text NOT NULL,
  filename text,
  imported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rows_received integer NOT NULL DEFAULT 0,
  rows_created integer NOT NULL DEFAULT 0,
  rows_updated integer NOT NULL DEFAULT 0,
  rows_merged integer NOT NULL DEFAULT 0,
  rows_skipped_non_bronx integer NOT NULL DEFAULT 0,
  rows_skipped_invalid integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bronx_resource_imports TO authenticated;
GRANT ALL ON public.bronx_resource_imports TO service_role;
ALTER TABLE public.bronx_resource_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read imports" ON public.bronx_resource_imports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins log imports" ON public.bronx_resource_imports FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SEED CATEGORY REGISTRY ============
INSERT INTO public.bronx_resource_categories (id, domain, label, subcategories, active, sort_order) VALUES
  ('food_pantry', 'food_benefits', 'Food Pantry', ARRAY['Walk-in','Appointment required','Home delivery','Mobile pantry'], true, 10),
  ('community_meal', 'food_benefits', 'Community Meal / Soup Kitchen', ARRAY['Hot meals','Grab and go','Weekend meals','Senior meals'], true, 20),
  ('emergency_food', 'food_benefits', 'Emergency Food', ARRAY['Same-day food','Disaster response','Food box'], true, 30),
  ('snap_ebt', 'food_benefits', 'SNAP / EBT Assistance', ARRAY['SNAP center','EBT replacement','Recertification'], true, 40),
  ('food_benefits_help', 'food_benefits', 'Food Benefits Assistance', ARRAY['Application help','WIC','School meals','Benefits screening'], true, 50),
  ('housing', 'housing', 'Housing', ARRAY[]::text[], false, 100),
  ('jobs', 'jobs', 'Jobs & Workforce', ARRAY[]::text[], false, 110),
  ('healthcare', 'healthcare', 'Healthcare', ARRAY[]::text[], false, 120),
  ('legal', 'legal', 'Legal Services', ARRAY[]::text[], false, 130),
  ('education', 'education', 'Education', ARRAY[]::text[], false, 140),
  ('childcare', 'childcare', 'Childcare', ARRAY[]::text[], false, 150),
  ('youth', 'youth', 'Youth Programs', ARRAY[]::text[], false, 160),
  ('immigration', 'immigration', 'Immigration Services', ARRAY[]::text[], false, 170),
  ('government_benefits', 'benefits', 'Government Benefits', ARRAY[]::text[], false, 180),
  ('small_business', 'small_business', 'Small Business Assistance', ARRAY[]::text[], false, 190),
  ('community_events', 'events', 'Community Events', ARRAY[]::text[], false, 200);
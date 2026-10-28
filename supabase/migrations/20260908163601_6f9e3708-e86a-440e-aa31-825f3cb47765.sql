CREATE TABLE public.org_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type text NOT NULL CHECK (account_type IN ('business','nonprofit','government')),
  org_name text NOT NULL,
  has_physical_location boolean NOT NULL DEFAULT true,
  address text,
  zip_code text,
  neighborhood text,
  public_phone text,
  website text,
  hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  hours_mode text NOT NULL DEFAULT 'schedule' CHECK (hours_mode IN ('schedule','call','appointment')),
  category text,
  languages text[] NOT NULL DEFAULT '{}',
  languages_other text,
  services text,
  requirements text,
  accessibility text[] NOT NULL DEFAULT '{}',
  ownership_tags text[] NOT NULL DEFAULT '{}',
  ownership_other text,
  dietary_tags text[] NOT NULL DEFAULT '{}',
  photo_url text,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  business_industry text,
  has_google_listing boolean,
  tier_interest text CHECK (tier_interest IN ('free','premium_interest','exploring')),
  premium boolean NOT NULL DEFAULT false,
  nonprofit_status text CHECK (nonprofit_status IN ('yes','pending','no')),
  mission text,
  ein text,
  population_served text,
  office_name text,
  role_title text,
  district text,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','verified','needs_changes','rejected')),
  published boolean NOT NULL DEFAULT true,
  priority_review boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX org_accounts_user_idx ON public.org_accounts(user_id);
CREATE INDEX org_accounts_status_idx ON public.org_accounts(status);
CREATE INDEX org_accounts_type_idx ON public.org_accounts(account_type);

GRANT SELECT (
  id, user_id, account_type, org_name, has_physical_location, address, zip_code, neighborhood,
  public_phone, website, hours, hours_mode, category, languages, languages_other, services,
  requirements, accessibility, ownership_tags, ownership_other, dietary_tags, photo_url, socials,
  business_industry, premium, nonprofit_status, mission, population_served, office_name,
  role_title, district, status, published, verified_at, verified_fields, created_at, updated_at
) ON public.org_accounts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_accounts TO authenticated;
GRANT ALL ON public.org_accounts TO service_role;

ALTER TABLE public.org_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published listings are public"
  ON public.org_accounts FOR SELECT
  USING (published AND status <> 'rejected');

CREATE POLICY "owners read their listings"
  ON public.org_accounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins read all listings"
  ON public.org_accounts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owners create their listings"
  ON public.org_accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending_review' AND verified_at IS NULL AND premium = false);

CREATE POLICY "owners update their listings"
  ON public.org_accounts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins update listings"
  ON public.org_accounts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "owners delete their listings"
  ON public.org_accounts FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER org_accounts_set_updated_at
  BEFORE UPDATE ON public.org_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.org_account_contacts (
  org_id uuid PRIMARY KEY REFERENCES public.org_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_role text,
  contact_email text NOT NULL,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_account_contacts TO authenticated;
GRANT ALL ON public.org_account_contacts TO service_role;

ALTER TABLE public.org_account_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners manage their contact details"
  ON public.org_account_contacts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins manage contact details"
  ON public.org_account_contacts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER org_account_contacts_set_updated_at
  BEFORE UPDATE ON public.org_account_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.official_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.org_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) <= 280),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX official_updates_org_idx ON public.official_updates(org_id);

GRANT SELECT ON public.official_updates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.official_updates TO authenticated;
GRANT ALL ON public.official_updates TO service_role;

ALTER TABLE public.official_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published updates are public"
  ON public.official_updates FOR SELECT
  USING (status = 'published');

CREATE POLICY "owners read their updates"
  ON public.official_updates FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owners write their updates"
  ON public.official_updates FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins manage updates"
  ON public.official_updates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER official_updates_set_updated_at
  BEFORE UPDATE ON public.official_updates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
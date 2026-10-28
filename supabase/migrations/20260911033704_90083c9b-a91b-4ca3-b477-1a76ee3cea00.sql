CREATE TABLE public.ad_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  interest text NOT NULL DEFAULT 'not_sure',
  budget_range text,
  message text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ad_inquiries_interest_chk CHECK (interest IN ('homepage_banner','sponsored_card','not_sure')),
  CONSTRAINT ad_inquiries_status_chk CHECK (status IN ('new','contacted','closed'))
);

GRANT INSERT ON public.ad_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.ad_inquiries TO authenticated;
GRANT ALL ON public.ad_inquiries TO service_role;

ALTER TABLE public.ad_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an advertising inquiry"
  ON public.ad_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read ad inquiries"
  ON public.ad_inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ad inquiries"
  ON public.ad_inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete ad inquiries"
  ON public.ad_inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER ad_inquiries_set_updated_at
  BEFORE UPDATE ON public.ad_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sponsored_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement text NOT NULL,
  category text,
  sponsor_name text NOT NULL,
  headline text NOT NULL,
  body text,
  cta_label text,
  cta_url text,
  priority integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sponsored_placements_placement_chk CHECK (placement IN ('homepage_banner','category_card'))
);

GRANT SELECT ON public.sponsored_placements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sponsored_placements TO authenticated;
GRANT ALL ON public.sponsored_placements TO service_role;

ALTER TABLE public.sponsored_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sponsored placements"
  ON public.sponsored_placements FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins can view all sponsored placements"
  ON public.sponsored_placements FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert sponsored placements"
  ON public.sponsored_placements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sponsored placements"
  ON public.sponsored_placements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sponsored placements"
  ON public.sponsored_placements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER sponsored_placements_set_updated_at
  BEFORE UPDATE ON public.sponsored_placements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX sponsored_placements_lookup_idx ON public.sponsored_placements (placement, category, active);
CREATE TABLE public.legal_consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.org_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  topic TEXT NOT NULL CHECK (topic IN ('contract_review', 'llc_questions', 'lease_review', 'employment', 'intellectual_property', 'other')),
  topic_details TEXT,
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('email', 'phone')),
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.legal_consultation_requests TO authenticated;
GRANT UPDATE ON public.legal_consultation_requests TO authenticated;
GRANT ALL ON public.legal_consultation_requests TO service_role;
ALTER TABLE public.legal_consultation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business owners can create legal requests"
ON public.legal_consultation_requests FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.org_accounts o
    WHERE o.id = org_id AND o.user_id = auth.uid() AND o.account_type = 'business'
  )
);
CREATE POLICY "Owners can view their legal requests"
ON public.legal_consultation_requests FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Admins can view legal requests"
ON public.legal_consultation_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update legal requests"
ON public.legal_consultation_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER legal_consultation_requests_set_updated_at
BEFORE UPDATE ON public.legal_consultation_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX legal_consultation_requests_status_created_idx
ON public.legal_consultation_requests(status, created_at DESC);
CREATE INDEX legal_consultation_requests_org_idx
ON public.legal_consultation_requests(org_id, created_at DESC);

CREATE TABLE public.business_hiring_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.org_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  employer_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  description TEXT NOT NULL,
  application_method TEXT NOT NULL,
  bronx_preferred BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_hiring_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_hiring_posts TO authenticated;
GRANT ALL ON public.business_hiring_posts TO service_role;
ALTER TABLE public.business_hiring_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published hiring posts"
ON public.business_hiring_posts FOR SELECT TO anon, authenticated
USING (status = 'published');
CREATE POLICY "Owners can view their hiring posts"
ON public.business_hiring_posts FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Business owners can create hiring posts"
ON public.business_hiring_posts FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.org_accounts o
    WHERE o.id = org_id AND o.user_id = auth.uid() AND o.account_type = 'business'
  )
);
CREATE POLICY "Owners can update their hiring posts"
ON public.business_hiring_posts FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.org_accounts o
    WHERE o.id = org_id AND o.user_id = auth.uid() AND o.account_type = 'business'
  )
);
CREATE POLICY "Owners can delete their hiring posts"
ON public.business_hiring_posts FOR DELETE TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Admins can view all hiring posts"
ON public.business_hiring_posts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all hiring posts"
ON public.business_hiring_posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hiring posts"
ON public.business_hiring_posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER business_hiring_posts_set_updated_at
BEFORE UPDATE ON public.business_hiring_posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX business_hiring_posts_public_idx
ON public.business_hiring_posts(status, bronx_preferred, created_at DESC);
CREATE INDEX business_hiring_posts_org_idx
ON public.business_hiring_posts(org_id, created_at DESC);
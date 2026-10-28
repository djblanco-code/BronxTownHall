-- Owner/admin access to full rows (including internal columns) without
-- exposing those columns through the Data API to every signed-in user.
CREATE OR REPLACE FUNCTION public.my_org_accounts()
RETURNS SETOF public.org_accounts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.org_accounts
  WHERE auth.uid() IS NOT NULL
    AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ORDER BY created_at DESC
$$;

REVOKE EXECUTE ON FUNCTION public.my_org_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_org_accounts() TO authenticated;

CREATE OR REPLACE FUNCTION public.all_org_accounts_admin()
RETURNS SETOF public.org_accounts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.org_accounts
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY created_at ASC
$$;

REVOKE EXECUTE ON FUNCTION public.all_org_accounts_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.all_org_accounts_admin() TO authenticated;

-- Internal columns are no longer readable over the Data API by anyone.
REVOKE SELECT ON public.org_accounts FROM authenticated;
GRANT SELECT (
  id, user_id, account_type, org_name, has_physical_location, address, zip_code, neighborhood,
  public_phone, website, hours, hours_mode, category, languages, languages_other, services,
  requirements, accessibility, ownership_tags, ownership_other, dietary_tags, photo_url, socials,
  business_industry, has_google_listing, tier_interest, premium, nonprofit_status, mission,
  population_served, office_name, role_title, district, status, published, verified_at,
  created_at, updated_at
) ON public.org_accounts TO authenticated;

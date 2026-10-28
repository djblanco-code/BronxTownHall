REVOKE SELECT ON public.org_accounts FROM anon;
GRANT SELECT (
  id, user_id, account_type, org_name, has_physical_location, address, zip_code, neighborhood,
  public_phone, website, hours, hours_mode, category, languages, languages_other, services,
  requirements, accessibility, ownership_tags, ownership_other, dietary_tags, photo_url, socials,
  business_industry, premium, nonprofit_status, mission, population_served, office_name, role_title,
  district, status, published, verified_at, verified_fields, created_at, updated_at
) ON public.org_accounts TO anon;

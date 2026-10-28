-- Any signed-in user could post an "official update" under any office's name:
-- the policy only checked that the poster was signed in as themselves. Now a
-- post must come from the owner of a government listing staff have verified,
-- and posts that don't (including any made before this fix) stop showing.

CREATE OR REPLACE FUNCTION public.is_verified_office(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_accounts o
    WHERE o.id = _org_id
      AND o.user_id = _user_id
      AND o.account_type = 'government'
      AND o.status = 'verified'
  );
$$;

REVOKE ALL ON FUNCTION public.is_verified_office(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_verified_office(uuid, uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "published updates are public" ON public.official_updates;
CREATE POLICY "published updates are public"
  ON public.official_updates FOR SELECT
  USING (status = 'published' AND public.is_verified_office(org_id, user_id));

DROP POLICY IF EXISTS "owners write their updates" ON public.official_updates;

CREATE POLICY "verified offices post updates"
  ON public.official_updates FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'published'
    AND public.is_verified_office(org_id, auth.uid())
  );

-- Owners may delete their own posts; hiding and editing stay with staff.
CREATE POLICY "owners delete their updates"
  ON public.official_updates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

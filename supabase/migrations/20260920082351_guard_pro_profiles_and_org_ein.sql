DROP POLICY IF EXISTS "own pro insert" ON public.pro_profiles;
CREATE POLICY "own pro insert" ON public.pro_profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND verified = false);

CREATE OR REPLACE FUNCTION public.tg_pro_profiles_guard_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.verified := OLD.verified;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pro_profiles_guard_verified ON public.pro_profiles;
CREATE TRIGGER pro_profiles_guard_verified
BEFORE UPDATE ON public.pro_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_pro_profiles_guard_verified();

REVOKE EXECUTE ON FUNCTION public.tg_pro_profiles_guard_verified() FROM PUBLIC, anon, authenticated;

REVOKE SELECT (ein, admin_notes) ON public.org_accounts FROM anon;

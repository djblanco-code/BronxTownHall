CREATE OR REPLACE FUNCTION public.tg_org_accounts_guard_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  NEW.verified          := OLD.verified;
  NEW.verified_at       := OLD.verified_at;
  NEW.verified_by       := OLD.verified_by;
  NEW.verified_fields   := OLD.verified_fields;
  NEW.premium           := OLD.premium;
  NEW.priority_review   := OLD.priority_review;
  NEW.published         := OLD.published;
  NEW.status            := OLD.status;
  NEW.admin_notes       := OLD.admin_notes;
  NEW.user_id           := OLD.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS org_accounts_guard_privileged_fields ON public.org_accounts;
CREATE TRIGGER org_accounts_guard_privileged_fields
BEFORE UPDATE ON public.org_accounts
FOR EACH ROW EXECUTE FUNCTION public.tg_org_accounts_guard_privileged_fields();

REVOKE EXECUTE ON FUNCTION public.tg_org_accounts_guard_privileged_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.tg_org_accounts_guard_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

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

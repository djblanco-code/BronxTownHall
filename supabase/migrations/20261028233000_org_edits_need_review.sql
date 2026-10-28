-- Verified org listings kept their badge after the owner changed their
-- phone, address or name: the guard trigger restored every verification
-- column for non-admins, which also silently discarded the portal's "back to
-- review" reset (so "needs changes" listings never returned to the queue).
-- And owners could create a listing with details already marked confirmed.

CREATE OR REPLACE FUNCTION public.tg_org_accounts_guard_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _field text;
  _changed boolean := false;
  _new jsonb := to_jsonb(NEW);
  _old jsonb := to_jsonb(OLD);
  _confirmed jsonb := COALESCE(OLD.verified_fields, '{}'::jsonb);
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Staff-only columns.
  NEW.verified_by     := OLD.verified_by;
  NEW.premium         := OLD.premium;
  NEW.priority_review := OLD.priority_review;
  NEW.published       := OLD.published;
  NEW.admin_notes     := OLD.admin_notes;
  NEW.user_id         := OLD.user_id;

  -- An edited detail is unconfirmed again until staff re-check it.
  FOREACH _field IN ARRAY ARRAY[
    'category', 'accessibility', 'languages', 'services', 'website',
    'address', 'hours', 'public_phone', 'requirements'
  ] LOOP
    IF _new -> _field IS DISTINCT FROM _old -> _field THEN
      _confirmed := _confirmed - _field;
      _changed := true;
    END IF;
  END LOOP;

  IF _new -> 'org_name' IS DISTINCT FROM _old -> 'org_name'
     OR _new -> 'office_name' IS DISTINCT FROM _old -> 'office_name'
     OR _new -> 'account_type' IS DISTINCT FROM _old -> 'account_type' THEN
    _changed := true;
  END IF;

  NEW.verified_fields := _confirmed;

  -- Owners can send their listing back to review by editing it, but can
  -- never mark it verified themselves. Rejected listings stay rejected.
  IF _changed AND OLD.status <> 'rejected' THEN
    NEW.status := 'pending_review';
    NEW.verified_at := NULL;
  ELSE
    NEW.status := OLD.status;
    NEW.verified_at := OLD.verified_at;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tg_org_accounts_guard_privileged_fields() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "owners create their listings" ON public.org_accounts;
CREATE POLICY "owners create their listings"
  ON public.org_accounts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending_review'
    AND verified_at IS NULL
    AND verified_by IS NULL
    AND verified_fields = '{}'::jsonb
    AND admin_notes IS NULL
    AND premium = false
  );

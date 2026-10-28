-- 1. Event submitter contact details must never be readable by public/anon API requests.
REVOKE SELECT ON public.events FROM anon, authenticated;

GRANT SELECT (
  id, title, description, event_type, category, event_date, event_time,
  location, address, is_free, cost, contact, website, image_url,
  is_verified, is_community_submitted, approval_status,
  views, saves, shares, created_at, updated_at,
  neighborhood, community_board, source, source_url,
  verification_status, last_verified, organization_id
) ON public.events TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT INSERT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;

-- Admin-only access to submitter contact details (column grants apply to admins too).
CREATE OR REPLACE FUNCTION public.admin_event_submissions()
RETURNS TABLE(id uuid, title text, approval_status text, submitted_by text, submitted_email text, submitted_user_id uuid, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, e.title, e.approval_status, e.submitted_by, e.submitted_email, e.submitted_user_id, e.created_at
  FROM public.events e
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY e.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.admin_event_submissions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_event_submissions() TO authenticated, service_role;

-- 3. Submissions may not claim another user's identity.
DROP POLICY IF EXISTS "Anyone can submit events" ON public.events;
CREATE POLICY "Anyone can submit events"
ON public.events FOR INSERT
TO anon, authenticated
WITH CHECK (
  approval_status = 'pending'
  AND is_community_submitted = true
  AND (submitted_user_id IS NULL OR submitted_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Anyone can submit an alert" ON public.community_alert_submissions;
CREATE POLICY "Anyone can submit an alert"
ON public.community_alert_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(title) >= 3 AND length(title) <= 200
  AND alert_type = ANY (ARRAY['accident','closure','hazard','traffic_light','other'])
  AND severity = ANY (ARRAY['low','medium','high'])
  AND status = 'pending'
  AND admin_notes IS NULL
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- 2. Internal automation/job status must not be publicly readable.
DROP POLICY IF EXISTS "Job state is public" ON public.verification_job_state;
REVOKE SELECT ON public.verification_job_state FROM anon;
GRANT SELECT ON public.verification_job_state TO authenticated;
GRANT ALL ON public.verification_job_state TO service_role;
CREATE POLICY "Admins read job state"
ON public.verification_job_state FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

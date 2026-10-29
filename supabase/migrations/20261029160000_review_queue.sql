-- Submitted events could arrive pre-marked "verified" (the insert policy only
-- checked the approval status), and staff now review submissions in the app.

DROP POLICY IF EXISTS "Anyone can submit events" ON public.events;
CREATE POLICY "Anyone can submit events"
ON public.events FOR INSERT
TO anon, authenticated
WITH CHECK (
  approval_status = 'pending'
  AND is_community_submitted = true
  AND is_verified = false
  AND verification_status = 'needs_verification'
  AND views = 0 AND saves = 0 AND shares = 0
  AND (submitted_user_id IS NULL OR submitted_user_id = auth.uid())
);

-- Suggestions from "Suggest a resource" and "Suggest an edit" now land in
-- resource_requests (they used to stay in the browser that sent them).
-- Keep what a stranger can send short, and new rows open.
DROP POLICY IF EXISTS "anyone requests insert" ON public.resource_requests;
CREATE POLICY "anyone requests insert" ON public.resource_requests
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'open'
  AND length(need) BETWEEN 2 AND 300
  AND (note IS NULL OR length(note) <= 2000)
  AND (category IS NULL OR length(category) <= 40)
  AND (neighborhood IS NULL OR length(neighborhood) <= 80)
  AND (user_id IS NULL OR user_id = auth.uid())
);

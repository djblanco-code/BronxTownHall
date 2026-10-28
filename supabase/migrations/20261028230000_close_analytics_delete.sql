-- These policies let any visitor delete every visitor's analytics rows (the
-- check was only `visitor_id IS NOT NULL`), while "Delete all my data" could
-- never use them anyway (visitors can't read these tables). Deletion now runs
-- on the server, scoped to the requesting device's own code.
DROP POLICY IF EXISTS "Visitors can delete their own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Visitors can delete their own analytics sessions" ON public.analytics_sessions;

REVOKE DELETE ON public.analytics_events FROM anon, authenticated;
REVOKE DELETE ON public.analytics_sessions FROM anon, authenticated;

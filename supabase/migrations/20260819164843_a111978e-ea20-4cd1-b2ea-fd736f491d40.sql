CREATE POLICY "Visitors can delete their own analytics events"
ON public.analytics_events FOR DELETE
USING (visitor_id IS NOT NULL);

CREATE POLICY "Visitors can delete their own analytics sessions"
ON public.analytics_sessions FOR DELETE
USING (visitor_id IS NOT NULL);

GRANT DELETE ON public.analytics_events TO anon, authenticated;
GRANT DELETE ON public.analytics_sessions TO anon, authenticated;
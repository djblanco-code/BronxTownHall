GRANT SELECT ON public.creators TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.creators TO authenticated;
GRANT ALL ON public.creators TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_contacts TO authenticated;
GRANT ALL ON public.creator_contacts TO service_role;

GRANT SELECT ON public.creator_picks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.creator_picks TO authenticated;
GRANT ALL ON public.creator_picks TO service_role;

GRANT INSERT ON public.creator_events TO anon, authenticated;
GRANT SELECT ON public.creator_events TO authenticated;
GRANT ALL ON public.creator_events TO service_role;
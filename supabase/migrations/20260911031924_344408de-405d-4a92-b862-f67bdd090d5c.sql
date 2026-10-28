REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Split the public read policies so anonymous visitors never call has_role().
DROP POLICY IF EXISTS "Active creator pages are public" ON public.creators;
CREATE POLICY "Anyone can read active creator pages" ON public.creators
  FOR SELECT TO anon USING (active);
CREATE POLICY "Signed-in read of creator pages" ON public.creators
  FOR SELECT TO authenticated
  USING (active OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Picks of active creators are public" ON public.creator_picks;
CREATE POLICY "Anyone can read picks of active creators" ON public.creator_picks
  FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.creators cr WHERE cr.id = creator_picks.creator_id AND cr.active));
CREATE POLICY "Signed-in read of creator picks" ON public.creator_picks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.creators cr
    WHERE cr.id = creator_picks.creator_id
      AND (cr.active OR cr.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));
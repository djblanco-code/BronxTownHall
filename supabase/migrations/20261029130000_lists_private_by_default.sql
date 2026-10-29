-- "My Lists" showed every public list from every user, and anyone could
-- read all public lists (with their owners' ids) straight from the API.
-- Now people can only read their own lists; a list marked public is shared
-- only through its link, via shared_list(slug), which leaves out the owner.

DROP POLICY IF EXISTS "own or public lists select" ON public.lists;
CREATE POLICY "own lists select" ON public.lists
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "list items visible if list visible" ON public.list_items;
CREATE POLICY "own list items select" ON public.list_items
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

REVOKE SELECT ON public.lists FROM anon;
REVOKE SELECT ON public.list_items FROM anon;

CREATE OR REPLACE FUNCTION public.shared_list(_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'name', l.name,
    'description', l.description,
    'share_slug', l.share_slug,
    'items', COALESCE(
      (SELECT jsonb_agg(
         jsonb_build_object('resource_id', i.resource_id, 'note', i.note, 'position', i.position)
         ORDER BY i.position
       )
       FROM public.list_items i WHERE i.list_id = l.id),
      '[]'::jsonb
    )
  )
  FROM public.lists l
  WHERE l.share_slug = _slug AND l.is_public
$$;

REVOKE ALL ON FUNCTION public.shared_list(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.shared_list(text) TO anon, authenticated;

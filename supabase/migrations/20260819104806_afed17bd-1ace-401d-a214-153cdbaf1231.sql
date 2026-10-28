CREATE OR REPLACE FUNCTION public.event_submission_stats(_weeks integer DEFAULT 12)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scoped AS (
    SELECT * FROM public.events
    WHERE created_at >= now() - (_weeks || ' weeks')::interval
  )
  SELECT CASE WHEN public.has_role(auth.uid(), 'admin') THEN json_build_object(
    'total', (SELECT count(*) FROM scoped),
    'community_submitted', (SELECT count(*) FROM scoped WHERE is_community_submitted),
    'approved', (SELECT count(*) FROM scoped WHERE approval_status = 'approved'),
    'pending', (SELECT count(*) FROM scoped WHERE approval_status = 'pending'),
    'by_week', COALESCE((
      SELECT json_agg(x ORDER BY x.week)
      FROM (
        SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS week, count(*)::int AS count
        FROM scoped GROUP BY 1
      ) x), '[]'::json),
    'by_category', COALESCE((
      SELECT json_agg(y ORDER BY y.count DESC)
      FROM (
        SELECT COALESCE(NULLIF(category, ''), 'uncategorized') AS category, count(*)::int AS count
        FROM scoped GROUP BY 1
      ) y), '[]'::json)
  ) ELSE json_build_object('total', 0, 'community_submitted', 0, 'approved', 0, 'pending', 0, 'by_week', '[]'::json, 'by_category', '[]'::json) END
$$;

GRANT EXECUTE ON FUNCTION public.event_submission_stats(integer) TO authenticated;
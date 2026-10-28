REVOKE ALL ON FUNCTION public.event_submission_stats(integer) FROM PUBLIC, anon;
CREATE OR REPLACE FUNCTION public.event_submission_stats(_weeks integer DEFAULT 12)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH scoped AS (
    SELECT * FROM public.events
    WHERE created_at >= now() - (_weeks || ' weeks')::interval
  )
  SELECT json_build_object(
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
  )
$$;
GRANT EXECUTE ON FUNCTION public.event_submission_stats(integer) TO authenticated;
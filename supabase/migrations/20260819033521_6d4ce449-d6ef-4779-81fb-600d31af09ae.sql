ALTER TABLE public.analytics_events ALTER COLUMN resource_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.search_analytics(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH s AS (
    SELECT
      lower(trim(coalesce(e.metadata->>'query',''))) AS q,
      coalesce((e.metadata->>'result_count')::int, 0) AS result_count,
      coalesce(e.metadata->>'mode','fuzzy') AS mode
    FROM public.analytics_events e
    WHERE e.event_type = 'search_performed'
      AND e.occurred_at >= now() - make_interval(days => greatest(1, coalesce(_days, 30)))
      AND coalesce(e.metadata->>'query','') <> ''
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM s),
    'with_results', (SELECT count(*) FROM s WHERE result_count > 0),
    'zero_results', (SELECT count(*) FROM s WHERE result_count = 0),
    'ai_searches', (SELECT count(*) FROM s WHERE mode = 'ai'),
    'fuzzy_searches', (SELECT count(*) FROM s WHERE mode <> 'ai'),
    'top_queries', coalesce((
      SELECT jsonb_agg(t) FROM (
        SELECT q AS query, count(*) AS searches,
               count(*) FILTER (WHERE result_count = 0) AS zero_results,
               round(avg(result_count)::numeric, 1) AS avg_results
        FROM s GROUP BY q ORDER BY count(*) DESC LIMIT 10
      ) t), '[]'::jsonb),
    'top_zero_queries', coalesce((
      SELECT jsonb_agg(t) FROM (
        SELECT q AS query, count(*) AS searches
        FROM s WHERE result_count = 0 GROUP BY q ORDER BY count(*) DESC LIMIT 10
      ) t), '[]'::jsonb)
  );
$$;

CREATE OR REPLACE FUNCTION public.category_performance(_days integer DEFAULT 30)
RETURNS TABLE (category text, views bigint, clicks bigint, conversion_rate numeric)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    coalesce(e.category, 'unknown') AS category,
    count(*) FILTER (WHERE e.event_type = 'resource_viewed') AS views,
    count(*) FILTER (WHERE e.event_type IN ('call_clicked','directions_clicked','website_clicked','resource_shared','resource_saved')) AS clicks,
    CASE WHEN count(*) FILTER (WHERE e.event_type = 'resource_viewed') = 0 THEN 0
         ELSE round(
           100.0 * count(*) FILTER (WHERE e.event_type IN ('call_clicked','directions_clicked','website_clicked','resource_shared','resource_saved'))
           / count(*) FILTER (WHERE e.event_type = 'resource_viewed'), 0)
    END AS conversion_rate
  FROM public.analytics_events e
  WHERE e.occurred_at >= now() - make_interval(days => greatest(1, coalesce(_days, 30)))
    AND e.resource_id IS NOT NULL
  GROUP BY coalesce(e.category, 'unknown')
  ORDER BY views DESC;
$$;

GRANT EXECUTE ON FUNCTION public.search_analytics(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.category_performance(integer) TO authenticated, service_role;
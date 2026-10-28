CREATE OR REPLACE FUNCTION public.top_resources(_limit integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY views DESC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT
      resource_id,
      MAX(category) AS category,
      COUNT(*) FILTER (WHERE event_type = 'resource_viewed') AS views,
      COUNT(*) FILTER (WHERE event_type IN ('call_clicked', 'directions_clicked', 'website_clicked')) AS clicks,
      CASE
        WHEN COUNT(*) FILTER (WHERE event_type = 'resource_viewed') = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE event_type IN ('call_clicked', 'directions_clicked', 'website_clicked'))::numeric
           / COUNT(*) FILTER (WHERE event_type = 'resource_viewed')::numeric) * 100
        )
      END AS conversion_rate
    FROM public.analytics_events
    GROUP BY resource_id
    ORDER BY views DESC
    LIMIT _limit
  ) t;

  RETURN result;
END;
$$;
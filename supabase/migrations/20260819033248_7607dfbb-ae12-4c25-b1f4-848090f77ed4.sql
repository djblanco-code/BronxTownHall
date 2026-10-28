CREATE OR REPLACE FUNCTION public.top_shared_resources(_limit integer DEFAULT 10)
RETURNS TABLE (
  resource_id text,
  category text,
  total_shares bigint,
  sms_shares bigint,
  whatsapp_shares bigint,
  other_shares bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    e.resource_id,
    max(e.category) AS category,
    count(*) AS total_shares,
    count(*) FILTER (WHERE e.metadata->>'share_method' = 'sms') AS sms_shares,
    count(*) FILTER (WHERE e.metadata->>'share_method' = 'whatsapp') AS whatsapp_shares,
    count(*) FILTER (WHERE coalesce(e.metadata->>'share_method','other') NOT IN ('sms','whatsapp')) AS other_shares
  FROM public.analytics_events e
  WHERE e.event_type = 'resource_shared' AND e.resource_id IS NOT NULL
  GROUP BY e.resource_id
  ORDER BY count(*) DESC
  LIMIT greatest(1, least(coalesce(_limit, 10), 100));
$$;

GRANT EXECUTE ON FUNCTION public.top_shared_resources(integer) TO authenticated, service_role;
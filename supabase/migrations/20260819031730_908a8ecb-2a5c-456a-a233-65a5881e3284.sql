CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  event_type text NOT NULL,
  resource_id text NOT NULL,
  category text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX analytics_events_resource_id_idx ON public.analytics_events (resource_id);
CREATE INDEX analytics_events_event_type_idx ON public.analytics_events (event_type);
CREATE INDEX analytics_events_occurred_at_idx ON public.analytics_events (occurred_at DESC);

GRANT INSERT ON public.analytics_events TO anon;
GRANT INSERT, SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record an analytics event"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.top_resources(_limit integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

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
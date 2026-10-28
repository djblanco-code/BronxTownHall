
CREATE TABLE public.analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  is_first_visit boolean NOT NULL DEFAULT false,
  device text,
  language text,
  zip_code text,
  path text
);

CREATE INDEX analytics_sessions_occurred_at_idx ON public.analytics_sessions (occurred_at DESC);
CREATE INDEX analytics_sessions_visitor_idx ON public.analytics_sessions (visitor_id);

GRANT INSERT ON public.analytics_sessions TO anon;
GRANT INSERT, SELECT ON public.analytics_sessions TO authenticated;
GRANT ALL ON public.analytics_sessions TO service_role;

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a visit"
  ON public.analytics_sessions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read visits"
  ON public.analytics_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.analytics_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_users bigint;
  new_week bigint;
  wau bigint;
  mau bigint;
  eligible bigint;
  returned bigint;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT count(DISTINCT visitor_id) INTO total_users FROM analytics_sessions;

  SELECT count(*) INTO new_week
  FROM (SELECT visitor_id, min(occurred_at) AS first_seen
        FROM analytics_sessions GROUP BY visitor_id) f
  WHERE f.first_seen >= now() - interval '7 days';

  SELECT count(DISTINCT visitor_id) INTO wau
  FROM analytics_sessions WHERE occurred_at >= now() - interval '7 days';

  SELECT count(DISTINCT visitor_id) INTO mau
  FROM analytics_sessions WHERE occurred_at >= now() - interval '30 days';

  WITH firsts AS (
    SELECT visitor_id, min(occurred_at) AS first_seen
    FROM analytics_sessions GROUP BY visitor_id
  )
  SELECT count(*),
         count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM analytics_sessions s
           WHERE s.visitor_id = f.visitor_id
             AND s.occurred_at > f.first_seen
             AND s.occurred_at <= f.first_seen + interval '7 days'))
  INTO eligible, returned
  FROM firsts f
  WHERE f.first_seen <= now() - interval '1 day';

  result := jsonb_build_object(
    'total_users', COALESCE(total_users, 0),
    'new_users_this_week', COALESCE(new_week, 0),
    'weekly_active_users', COALESCE(wau, 0),
    'monthly_active_users', COALESCE(mau, 0),
    'retention_rate', CASE WHEN COALESCE(eligible,0) = 0 THEN 0
                           ELSE round((returned::numeric / eligible) * 100) END,
    'retention_base', COALESCE(eligible, 0),
    'daily', COALESCE((
      SELECT jsonb_agg(d ORDER BY d->>'day')
      FROM (
        SELECT jsonb_build_object(
          'day', to_char(date_trunc('day', occurred_at), 'YYYY-MM-DD'),
          'visits', count(*),
          'visitors', count(DISTINCT visitor_id)) AS d
        FROM analytics_sessions
        WHERE occurred_at >= now() - interval '30 days'
        GROUP BY 1
      ) x), '[]'::jsonb),
    'devices', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', COALESCE(device,'unknown'), 'count', c))
      FROM (SELECT device, count(DISTINCT visitor_id) AS c
            FROM analytics_sessions GROUP BY device ORDER BY c DESC LIMIT 10) y), '[]'::jsonb),
    'languages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', COALESCE(language,'unknown'), 'count', c))
      FROM (SELECT language, count(DISTINCT visitor_id) AS c
            FROM analytics_sessions GROUP BY language ORDER BY c DESC LIMIT 10) z), '[]'::jsonb),
    'zips', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', zip_code, 'count', c))
      FROM (SELECT zip_code, count(DISTINCT visitor_id) AS c
            FROM analytics_sessions WHERE zip_code IS NOT NULL AND zip_code <> ''
            GROUP BY zip_code ORDER BY c DESC LIMIT 10) w), '[]'::jsonb)
  );

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_overview() FROM public;
GRANT EXECUTE ON FUNCTION public.analytics_overview() TO authenticated;

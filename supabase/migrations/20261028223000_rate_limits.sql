-- Shared rate limits for endpoints that call paid APIs (AI, text-to-speech,
-- Google Maps). Counters live here so every server instance sees the same
-- count. `key` is a hash of the caller's IP, never the IP itself.
CREATE TABLE public.rate_limit_hits (
  bucket text NOT NULL,
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, key, window_start)
);
CREATE INDEX rate_limit_hits_window_idx ON public.rate_limit_hits (window_start);

ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_hits FROM anon, authenticated;
GRANT ALL ON public.rate_limit_hits TO service_role;

-- Counts one call and returns true when the caller is over `_limit` calls in
-- the current `_window_seconds` window.
CREATE OR REPLACE FUNCTION public.hit_rate_limit(
  _bucket text,
  _key text,
  _limit integer,
  _window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _start timestamptz := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds);
  _hits integer;
BEGIN
  INSERT INTO public.rate_limit_hits AS r (bucket, key, window_start, hits)
  VALUES (_bucket, _key, _start, 1)
  ON CONFLICT (bucket, key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO _hits;

  -- Keep the table small: drop a few windows older than a day on each call.
  DELETE FROM public.rate_limit_hits
  WHERE ctid IN (
    SELECT ctid FROM public.rate_limit_hits
    WHERE window_start < now() - interval '1 day'
    LIMIT 50
  );

  RETURN _hits > _limit;
END;
$$;

REVOKE ALL ON FUNCTION public.hit_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(text, text, integer, integer) TO service_role;

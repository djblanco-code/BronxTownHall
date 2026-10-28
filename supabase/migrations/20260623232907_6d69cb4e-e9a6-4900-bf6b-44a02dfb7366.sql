
CREATE TABLE public.geocoded_locations (
  address_key TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  formatted_address TEXT,
  nearest_subway_station TEXT,
  nearest_subway_distance_m DOUBLE PRECISION,
  nearest_subway_lines TEXT[] NOT NULL DEFAULT '{}',
  nearest_bus_routes TEXT[] NOT NULL DEFAULT '{}',
  nearest_bus_distance_m DOUBLE PRECISION,
  transit_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.geocoded_locations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.geocoded_locations TO authenticated;
GRANT ALL ON public.geocoded_locations TO service_role;

ALTER TABLE public.geocoded_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read geocoded locations"
  ON public.geocoded_locations FOR SELECT
  USING (true);

CREATE POLICY "Service role manages geocoded locations"
  ON public.geocoded_locations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_geocoded_locations_updated_at
  BEFORE UPDATE ON public.geocoded_locations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

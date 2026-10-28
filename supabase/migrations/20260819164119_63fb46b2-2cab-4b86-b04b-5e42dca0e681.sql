CREATE TABLE public.resource_verifications (
  resource_id text PRIMARY KEY,
  resource_name text,
  category text,
  phone text,
  address text,
  verified boolean NOT NULL DEFAULT false,
  phone_ok boolean,
  address_ok boolean,
  places_ok boolean,
  google_place_id text,
  formatted_address text,
  verification_issues text[] NOT NULL DEFAULT '{}',
  last_verified_date timestamptz,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resource_verifications TO anon;
GRANT SELECT ON public.resource_verifications TO authenticated;
GRANT ALL ON public.resource_verifications TO service_role;

ALTER TABLE public.resource_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verification results are public" ON public.resource_verifications FOR SELECT USING (true);

CREATE TRIGGER resource_verifications_set_updated_at BEFORE UPDATE ON public.resource_verifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.verification_job_state (
  id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'idle',
  lease_until timestamptz,
  last_run_at timestamptz,
  last_error text,
  processed_last_run integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.verification_job_state TO anon;
GRANT SELECT ON public.verification_job_state TO authenticated;
GRANT ALL ON public.verification_job_state TO service_role;

ALTER TABLE public.verification_job_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job state is public" ON public.verification_job_state FOR SELECT USING (true);

CREATE TRIGGER verification_job_state_set_updated_at BEFORE UPDATE ON public.verification_job_state FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.verification_job_state (id, status) VALUES ('resource-verifier', 'idle');
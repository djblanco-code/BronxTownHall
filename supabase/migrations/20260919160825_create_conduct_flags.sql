CREATE TABLE public.conduct_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id text NOT NULL,
  resource_name text,
  resource_type text NOT NULL DEFAULT 'resource',
  category text,
  concern text NOT NULL,
  details text NOT NULL,
  happened_on date,
  money_involved text,
  reporter_name text,
  reporter_email text,
  reporter_phone text,
  willing_to_talk boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conduct_flags_details_len CHECK (char_length(details) BETWEEN 10 AND 4000),
  CONSTRAINT conduct_flags_status_chk CHECK (status IN ('new','reviewing','action_taken','dismissed')),
  CONSTRAINT conduct_flags_concern_chk CHECK (concern IN ('unlicensed','predatory_pricing','fraud','discrimination','unsafe','immigration_scam','other'))
);

CREATE INDEX conduct_flags_status_idx ON public.conduct_flags (status, created_at DESC);
CREATE INDEX conduct_flags_resource_idx ON public.conduct_flags (resource_id);

GRANT INSERT ON public.conduct_flags TO anon;
GRANT SELECT, INSERT, UPDATE ON public.conduct_flags TO authenticated;
GRANT ALL ON public.conduct_flags TO service_role;

ALTER TABLE public.conduct_flags ENABLE ROW LEVEL SECURITY;

-- Anyone may raise a concern; nobody but an admin may read them back, so
-- flag counts and statuses can never be surfaced publicly.
CREATE POLICY "Anyone can submit a conduct flag"
  ON public.conduct_flags FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND reviewed_by IS NULL AND admin_notes IS NULL);

CREATE POLICY "Admins read conduct flags"
  ON public.conduct_flags FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update conduct flags"
  ON public.conduct_flags FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER conduct_flags_set_updated_at
  BEFORE UPDATE ON public.conduct_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
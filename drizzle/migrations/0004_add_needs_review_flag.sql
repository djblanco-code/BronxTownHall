ALTER TABLE public.bronx_resources
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

CREATE INDEX IF NOT EXISTS bronx_resources_needs_review_idx
  ON public.bronx_resources (needs_review) WHERE needs_review;
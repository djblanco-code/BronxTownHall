ALTER TABLE public.bronx_resources ADD COLUMN IF NOT EXISTS how_to_apply text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS how_to_apply text;
COMMENT ON COLUMN public.bronx_resources.how_to_apply IS 'Direct next-step link or phone for applying/enrolling; separate from website/phone.';
COMMENT ON COLUMN public.resources.how_to_apply IS 'Direct next-step link or phone for applying/enrolling; separate from website/phone.';
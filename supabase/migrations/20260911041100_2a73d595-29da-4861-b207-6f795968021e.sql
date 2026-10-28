ALTER TABLE public.bronx_resources ADD COLUMN IF NOT EXISTS application_url text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS application_url text;
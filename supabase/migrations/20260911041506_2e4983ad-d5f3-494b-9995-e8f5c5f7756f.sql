ALTER TABLE public.bronx_resources
  ADD COLUMN IF NOT EXISTS availability_status text,
  ADD COLUMN IF NOT EXISTS insurance_accepted text;

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS availability_status text,
  ADD COLUMN IF NOT EXISTS insurance_accepted text;

ALTER TABLE public.bronx_resources
  DROP CONSTRAINT IF EXISTS bronx_resources_availability_status_check;
ALTER TABLE public.bronx_resources
  ADD CONSTRAINT bronx_resources_availability_status_check
  CHECK (availability_status IS NULL OR availability_status IN ('accepting','waitlist','full'));

ALTER TABLE public.resources
  DROP CONSTRAINT IF EXISTS resources_availability_status_check;
ALTER TABLE public.resources
  ADD CONSTRAINT resources_availability_status_check
  CHECK (availability_status IS NULL OR availability_status IN ('accepting','waitlist','full'));
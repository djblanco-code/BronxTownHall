ALTER TABLE public.bronx_resources
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS event_time text;

COMMENT ON COLUMN public.bronx_resources.event_date IS 'Specific calendar date for time-bound listings (workshops, giveaways, classes). NULL for ongoing programs.';
COMMENT ON COLUMN public.bronx_resources.event_time IS 'Start time text, e.g. "6:30 PM". NULL when only the date is known.';
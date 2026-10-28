ALTER TABLE public.bronx_resources
ADD COLUMN event_end_date DATE;

CREATE INDEX bronx_resources_event_date_range_idx
ON public.bronx_resources (event_date, event_end_date)
WHERE event_date IS NOT NULL;
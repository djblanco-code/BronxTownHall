CREATE TABLE public.internal_settings (key text PRIMARY KEY, value text NOT NULL);
GRANT ALL ON public.internal_settings TO service_role;
ALTER TABLE public.internal_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.internal_settings FROM anon, authenticated;
INSERT INTO public.internal_settings (key, value)
VALUES ('event_scrape_cron_secret', encode(extensions.gen_random_bytes(32), 'hex'));
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('weekly-resource-verification') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-resource-verification');

SELECT cron.schedule(
  'weekly-resource-verification',
  '0 7 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://project--dacd2cdf-1929-4f29-84ad-53c1cd64e2af.lovable.app/api/public/verify-resources',
    headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_EkmGz52MtzgloS3ui7H1zA_7-oYikYw"}'::jsonb,
    body := '{"batch_size": 10}'::jsonb
  );
  $$
);
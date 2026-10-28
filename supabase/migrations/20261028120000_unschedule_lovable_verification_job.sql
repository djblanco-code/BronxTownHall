-- The weekly verification job (20260819164258) posts to the old Lovable-hosted
-- URL. Drop it; docs/self-hosting.md schedules it against your own domain.
SELECT cron.unschedule('weekly-resource-verification')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-resource-verification');

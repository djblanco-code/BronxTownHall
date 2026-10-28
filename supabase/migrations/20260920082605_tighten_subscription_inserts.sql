DROP POLICY IF EXISTS "Public can subscribe" ON public.newsletter_subscriptions;
CREATE POLICY "Public can subscribe" ON public.newsletter_subscriptions
FOR INSERT TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) >= 5 AND length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND unsubscribed_at IS NULL
  AND confirmed = false
  AND (user_id IS NULL OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Anyone can opt in to alerts" ON public.alert_subscriptions;
CREATE POLICY "Anyone can opt in to alerts" ON public.alert_subscriptions
FOR INSERT TO anon, authenticated
WITH CHECK (
  unsubscribed_at IS NULL
  AND confirmed = false
  AND (phone IS NOT NULL OR email IS NOT NULL)
);

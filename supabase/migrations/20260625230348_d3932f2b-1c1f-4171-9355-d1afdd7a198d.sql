
DROP POLICY "Public can subscribe" ON public.newsletter_subscriptions;
CREATE POLICY "Public can subscribe" ON public.newsletter_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND unsubscribed_at IS NULL
  );

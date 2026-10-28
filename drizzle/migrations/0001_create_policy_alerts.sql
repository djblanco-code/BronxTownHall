CREATE TABLE public.policy_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  kind text NOT NULL DEFAULT 'policy',
  headline text NOT NULL,
  detail text,
  source_url text,
  source_label text,
  deadline_date date,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT policy_alerts_headline_len CHECK (char_length(headline) BETWEEN 3 AND 160),
  CONSTRAINT policy_alerts_kind_chk CHECK (kind IN ('policy','deadline'))
);

CREATE INDEX policy_alerts_category_idx ON public.policy_alerts (category, published);

GRANT SELECT ON public.policy_alerts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policy_alerts TO authenticated;
GRANT ALL ON public.policy_alerts TO service_role;

ALTER TABLE public.policy_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published alerts are public"
  ON public.policy_alerts FOR SELECT TO anon, authenticated
  USING (published = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins read all alerts"
  ON public.policy_alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert alerts"
  ON public.policy_alerts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update alerts"
  ON public.policy_alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete alerts"
  ON public.policy_alerts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER policy_alerts_set_updated_at
  BEFORE UPDATE ON public.policy_alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.alert_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'sms',
  phone text,
  email text,
  categories text[] NOT NULL DEFAULT '{}',
  language text NOT NULL DEFAULT 'en',
  zip_code text,
  confirmed boolean NOT NULL DEFAULT true,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alert_subscriptions_channel_chk CHECK (channel IN ('sms','email')),
  CONSTRAINT alert_subscriptions_contact_chk CHECK (
    (channel = 'sms' AND phone IS NOT NULL AND char_length(phone) BETWEEN 7 AND 20)
    OR (channel = 'email' AND email IS NOT NULL AND char_length(email) BETWEEN 5 AND 255)
  )
);

CREATE INDEX alert_subscriptions_categories_idx ON public.alert_subscriptions USING gin (categories);

GRANT INSERT ON public.alert_subscriptions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.alert_subscriptions TO authenticated;
GRANT ALL ON public.alert_subscriptions TO service_role;

ALTER TABLE public.alert_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can opt in to alerts"
  ON public.alert_subscriptions FOR INSERT TO anon, authenticated
  WITH CHECK (unsubscribed_at IS NULL);

CREATE POLICY "Admins read alert subscriptions"
  ON public.alert_subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update alert subscriptions"
  ON public.alert_subscriptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER alert_subscriptions_set_updated_at
  BEFORE UPDATE ON public.alert_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
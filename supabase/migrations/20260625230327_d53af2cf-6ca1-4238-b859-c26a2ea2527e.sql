
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  zip_code TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  interests TEXT[] NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'weekly',
  confirmed BOOLEAN NOT NULL DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscriptions TO authenticated;
GRANT INSERT ON public.newsletter_subscriptions TO anon;
GRANT ALL ON public.newsletter_subscriptions TO service_role;

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can subscribe" ON public.newsletter_subscriptions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users view own subscription" ON public.newsletter_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users update own subscription" ON public.newsletter_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins manage all subscriptions" ON public.newsletter_subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER newsletter_subscriptions_set_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_zip ON public.newsletter_subscriptions(zip_code);

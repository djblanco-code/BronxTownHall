
-- 1. saved_resources
CREATE TABLE public.saved_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_resources TO authenticated;
GRANT ALL ON public.saved_resources TO service_role;
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved select" ON public.saved_resources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own saved insert" ON public.saved_resources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saved update" ON public.saved_resources FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saved delete" ON public.saved_resources FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. lists
CREATE TABLE public.lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  share_slug text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lists TO authenticated;
GRANT SELECT ON public.lists TO anon;
GRANT ALL ON public.lists TO service_role;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or public lists select" ON public.lists FOR SELECT TO anon, authenticated USING (is_public OR auth.uid() = user_id);
CREATE POLICY "own lists insert" ON public.lists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own lists update" ON public.lists FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own lists delete" ON public.lists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. list_items
CREATE TABLE public.list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  resource_id text NOT NULL,
  note text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_id, resource_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_items TO authenticated;
GRANT SELECT ON public.list_items TO anon;
GRANT ALL ON public.list_items TO service_role;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "list items visible if list visible" ON public.list_items FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND (l.is_public OR l.user_id = auth.uid())));
CREATE POLICY "own list items insert" ON public.list_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid()));
CREATE POLICY "own list items update" ON public.list_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid()));
CREATE POLICY "own list items delete" ON public.list_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

-- 4. reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved reviews public" ON public.reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own review insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own review update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own review delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 5. pro_profiles
CREATE TABLE public.pro_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_name text NOT NULL,
  role_title text,
  org_type text,
  bio text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_profiles TO authenticated;
GRANT ALL ON public.pro_profiles TO service_role;
ALTER TABLE public.pro_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pro select" ON public.pro_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own pro insert" ON public.pro_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own pro update" ON public.pro_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin pro delete" ON public.pro_profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id text NOT NULL,
  client_label text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','unsuccessful')),
  note text,
  referred_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own referrals select" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = pro_user_id);
CREATE POLICY "own referrals insert" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = pro_user_id);
CREATE POLICY "own referrals update" ON public.referrals FOR UPDATE TO authenticated USING (auth.uid() = pro_user_id);
CREATE POLICY "own referrals delete" ON public.referrals FOR DELETE TO authenticated USING (auth.uid() = pro_user_id);

-- 7. resource_requests
CREATE TABLE public.resource_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  need text NOT NULL,
  category text,
  neighborhood text,
  note text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_review','fulfilled','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_requests TO authenticated;
GRANT INSERT ON public.resource_requests TO anon;
GRANT ALL ON public.resource_requests TO service_role;
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin requests select" ON public.resource_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anyone requests insert" ON public.resource_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin requests update" ON public.resource_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin requests delete" ON public.resource_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. resource_notes
CREATE TABLE public.resource_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_notes TO authenticated;
GRANT ALL ON public.resource_notes TO service_role;
ALTER TABLE public.resource_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes select" ON public.resource_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own notes insert" ON public.resource_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notes update" ON public.resource_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notes delete" ON public.resource_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger fn (idempotent)
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER set_updated_at_saved BEFORE UPDATE ON public.saved_resources FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at_lists BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at_reviews BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at_pro BEFORE UPDATE ON public.pro_profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at_referrals BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_updated_at_resource_notes BEFORE UPDATE ON public.resource_notes FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

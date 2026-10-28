CREATE TABLE public.resource_packs (
  slug text PRIMARY KEY,
  resource_ids text[] NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  views integer NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT ON public.resource_packs TO anon;
GRANT SELECT, INSERT ON public.resource_packs TO authenticated;
GRANT ALL ON public.resource_packs TO service_role;

ALTER TABLE public.resource_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Packs are publicly readable" ON public.resource_packs FOR SELECT USING (true);
CREATE POLICY "Anyone can create a pack" ON public.resource_packs FOR INSERT WITH CHECK (
  array_length(resource_ids, 1) BETWEEN 1 AND 20
  AND (note IS NULL OR length(note) <= 200)
);
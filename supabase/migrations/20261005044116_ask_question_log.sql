CREATE TABLE public.ask_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  category text,
  outcome text NOT NULL,
  match_count integer NOT NULL DEFAULT 0,
  lang text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ask_questions TO authenticated;
GRANT ALL ON public.ask_questions TO service_role;
ALTER TABLE public.ask_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read asked questions" ON public.ask_questions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX ask_questions_created_idx ON public.ask_questions (created_at DESC);
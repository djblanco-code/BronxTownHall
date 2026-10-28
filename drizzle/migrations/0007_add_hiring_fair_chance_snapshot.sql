ALTER TABLE public.business_hiring_posts
ADD COLUMN fair_chance_employer BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX business_hiring_posts_fair_chance_idx
ON public.business_hiring_posts(status, fair_chance_employer, created_at DESC);
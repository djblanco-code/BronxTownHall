-- Job posts were published the moment any business account (even one still
-- pending review) wrote one, so anyone could put a scam job in front of
-- residents. Now a post starts as a draft, only staff can publish it, and an
-- owner can edit or close their post but never publish or reopen it.

ALTER TABLE public.business_hiring_posts ALTER COLUMN status SET DEFAULT 'draft';

-- Posts from organizations that aren't verified go back to draft for review.
UPDATE public.business_hiring_posts p
SET status = 'draft'
WHERE p.status = 'published'
  AND NOT EXISTS (
    SELECT 1 FROM public.org_accounts o
    WHERE o.id = p.org_id AND o.status = 'verified'
  );

DROP POLICY IF EXISTS "Business owners can create hiring posts" ON public.business_hiring_posts;
CREATE POLICY "Business owners can create hiring posts"
ON public.business_hiring_posts FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'draft'
  AND EXISTS (
    SELECT 1 FROM public.org_accounts o
    WHERE o.id = org_id AND o.user_id = auth.uid() AND o.account_type = 'business'
  )
);

-- Owners can work on a draft or close a post. Editing a published post sends
-- it back to draft, and a post staff closed stays closed.
DROP POLICY IF EXISTS "Owners can update their hiring posts" ON public.business_hiring_posts;
CREATE POLICY "Owners can update their hiring posts"
ON public.business_hiring_posts FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND status <> 'closed')
WITH CHECK (
  user_id = auth.uid()
  AND status IN ('draft', 'closed')
  AND EXISTS (
    SELECT 1 FROM public.org_accounts o
    WHERE o.id = org_id AND o.user_id = auth.uid() AND o.account_type = 'business'
  )
);

-- An office's past updates disappeared whenever it edited its phone or hours,
-- because editing sends the office back to review and updates were only
-- shown while the office was verified. Posting still requires a verified
-- office (the insert policy), so every published update was posted by one.
-- Keep them visible while the office is back in review; hide them only when
-- staff reject the office.

DROP POLICY IF EXISTS "published updates are public" ON public.official_updates;
CREATE POLICY "published updates are public"
  ON public.official_updates FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.org_accounts o
      WHERE o.id = org_id
        AND o.user_id = official_updates.user_id
        AND o.account_type = 'government'
        AND o.status <> 'rejected'
    )
  );

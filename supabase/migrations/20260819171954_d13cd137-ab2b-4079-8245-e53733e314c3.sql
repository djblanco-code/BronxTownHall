ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'needs_verification',
  ADD COLUMN IF NOT EXISTS last_verified timestamptz;

UPDATE public.events SET verification_status = 'verified', last_verified = COALESCE(last_verified, updated_at)
WHERE is_verified = true AND verification_status = 'needs_verification';

CREATE INDEX IF NOT EXISTS events_date_status_idx ON public.events (event_date, approval_status);
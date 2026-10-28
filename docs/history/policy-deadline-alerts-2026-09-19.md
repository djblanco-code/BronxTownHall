# Policy & Deadline Alerts

A new, separate feed for concrete rule, eligibility, and deadline changes that affect
whether residents can get a resource — kept apart from "Latest from Your Officials"
(which stays as-is for general news from offices).

## What residents see

- On every category page (Food, Health, Childcare, Money, Legal, …), a compact
  **Alerts** section directly under the category header, shown only when that category
  has active alerts.
- Each alert is **one short headline** plus a date, e.g.
  "3-K income eligibility threshold changed". Nothing long by default.
- A **Read more** control expands a few sentences of detail in place, and links to the
  official source page when one is provided. Nothing else expands automatically.
- Deadline and renewal reminders use the same section and the same one-line format
  ("SNAP recertification season is here"), with an optional deadline date shown as a
  small pill ("Deadline: Oct 31").
- Alerts are labelled as staff-posted and fact-checked, in the same visual language as
  the existing verification badges.

## Getting notified

- A **"Get alerts for this category"** button in that section opens a small form:
  phone number (for text) or email, plus checkboxes for which categories they want.
  Choosing Childcare and Money means alerts only for those two.
- Prefilled with the interests already captured during onboarding, so most people just
  confirm.
- A settings entry lets people change categories or unsubscribe at any time; one
  unsubscribe link/keyword ends everything.
- Honest limitation: the app has no outbound text-message or push provider connected
  yet, so sign-ups are stored and the confirmation says "You're on the list — alerts
  start as soon as texting goes live." Sending goes live the moment a texting service
  is connected; no rework of the sign-up side is needed. I can wire a provider in a
  follow-up if you want alerts actually delivered now.

## Publishing (admin only)

- New **Policy & Deadline Alerts** panel on the admin page: write a headline (hard
  one-sentence limit enforced), optional detail, category, optional source URL,
  optional deadline date, and publish/unpublish.
- Only accounts holding the admin role can create, edit, or unpublish. Residents can
  never post here — there is no submission form anywhere in the public app.
- Published alerts can be expired automatically after their deadline passes.

## Technical notes

- New table `policy_alerts`: `id`, `category`, `headline` (<=160 chars), `detail`,
  `source_url`, `source_label`, `deadline_date`, `kind` ('policy' | 'deadline'),
  `published`, `published_at`, `created_by`, `expires_at`, timestamps. Public
  `SELECT TO anon, authenticated` limited to `published = true AND (expires_at IS NULL
OR expires_at > now())`; insert/update/delete gated on `has_role(auth.uid(),'admin')`.
  Explicit GRANTs in the same migration.
- New table `alert_subscriptions`: `id`, `phone`, `email`, `categories text[]`,
  `channel` ('sms' | 'email'), `language`, `confirmed`, `unsubscribed_at`, timestamps.
  Anonymous INSERT allowed (opt-in), no anonymous SELECT; admin read for sending.
  Mirrors the existing `newsletter_subscriptions` interest-array shape so one sender
  can serve both.
- `src/lib/policy-alerts.ts`: load-by-category, admin CRUD, subscribe/unsubscribe.
- `src/components/PolicyAlerts.tsx` (headline list + inline expand + subscribe entry),
  `src/components/AlertSubscribeForm.tsx`, `src/components/AdminPolicyAlertPanel.tsx`.
- Rendered from `src/routes/category.$cat.tsx`; admin panel added to `src/routes/admin.tsx`.
- Headline/label strings added to all five languages; alert content itself appears in
  the language it was written in, consistent with existing listing behaviour.
- No seeded example alerts — the section stays hidden until staff publish real ones.

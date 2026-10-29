# Bronx Town Hall — Pilot-Readiness Pass

## What the audit found

**49 routes, ~201 resources, 25 database tables.** The app is over-built, not under-built. Four findings matter:

1. **Verification badges are fabricated.** `lastVerifiedFor(id)` hashes the resource ID into a number 0–59 and subtracts that many days. Every "Verified 12 days ago" pill, the home-page "Verified this week" counter, and the `/data-quality` numbers are generated math, not records. This is the highest-risk thing in the codebase — if a BP evaluator or judge asks "verified by whom?", there is no answer.
2. **Resources live in code.** `src/lib/data.ts` is 487 lines of hardcoded records. No `source`, `verification_status`, `last_verified`, or `organization_id` fields exist. Every correction needs a code deploy.
3. **Raw search text is stored in the database.** `src/lib/track-search.ts` inserts the lowercased query into `analytics_events.metadata->>'query'`, joined to a persistent `visitor_id`. The `search_analytics` DB function ranks those strings. This directly contradicts Priority 9.
4. **Translations are hollow.** Roughly 150 of 201 records call `r("Name","Name","Name","Name","Name")` — the same English string five times. Tapping "Español" shows English.

Events already have a real `events` table with dates, approval status, and RLS. Neighborhoods and community boards already exist as data. Those are the foundations to build on.

## What changes

### 1. Resources move to the database (Priority 6)

New `resources` table mirroring the existing `Resource` type plus the missing trust fields: `source`, `source_url`, `verification_status`, `last_verified`, `verify_every_days`, `neighborhood`, `community_board`, `organization_id`, `is_active`, `submitted_by`. Migration seeds all 201 existing records with literal INSERTs so nothing is lost.

`src/lib/data.ts` stays in place as the offline/SSR fallback and type source. A new loader reads from the database and falls back to the static array on error — no route breaks during the transition.

### 2. Verification becomes real (Priorities 5 + 11)

- Delete `lastVerifiedFor()`. `VerifiedPill` reads the actual `last_verified` and `verification_status` columns.
- Five statuses: verified by organization, verified by Bronx Town Hall, verified via public source, community submitted, needs verification.
- `verify_every_days` per record (defaulting per category, editable) drives freshness — a pantry at 90 days, a hospital at 365.
- Records with no verification say **"Not yet verified"**, honestly, rather than showing a green pill.
- `/data-quality` counters recompute from real columns.

### 3. Admin content management (Priority 7)

`/admin` gains a Resources tab and an Events tab: create, edit, deactivate, set verification status, stamp "verified today", and review community submissions. Plain forms, admin-role gated, no dashboard framework.

### 4. Home page focus (Priority 1)

- Remove the auto-opening trivia modal. The fact card moves inline near the footer and stays on `/facts`.
- "Show me what this can do" moves off the resident home; the tour stays reachable at `/?tour=1` and from `/pitch`.
- Rotating search placeholders: free events this weekend, dentist near me, food pantry near me, things happening in my neighborhood, community meetings this week, free kayaking in the Bronx.
- ZIP text input becomes a neighborhood picker (ZIP still accepted).
- Trim competing CTAs: emergency and SMS stay, the ticker and secondary links consolidate.

### 5. Events become the hero (Priority 4)

New "This Weekend in the Bronx" section directly under search, above the category grid. Real cards from the `events` table with date, time, location, neighborhood, free/paid, category, source, verification. Filter chips: Today · This week · This weekend · Next week. `/events` gains the same filters.

### 6. Categories and personalization (Priorities 2 + 3)

All 14 categories stay. The home grid keeps 6 featured + "See all 14" — featured slots fill from pinned categories first, then behavioral signals, then defaults. Onboarding becomes location-only with a skip; the needs quiz stays reachable at `/onboarding?full=1`. Sensitive categories (legal, health, immigration-adjacent) never feed personalization signals.

### 7. Privacy by design (Priority 9)

- Stop storing raw query text. `trackSearchPerformed` persists only a coarse intent bucket, result-count band, and a found/not-found boolean.
- Sensitive categories (legal, health, and any record flagged sensitive) emit no analytics events at all — no view, no call, no directions.
- "We don't save what you search" appears under the search bar, worded as a description of behavior, not a legal guarantee.
- `search_analytics` DB function rewritten to read buckets instead of strings.

### 8. Six pilot metrics (Priority 10)

`/admin/analytics` reduces to: Weekly Active Residents · W1 and W4 return · Action Rate · **Discovery Rate** (actions on records the user did not search for, from an existing `surface` field on each event) · Zero-result and no-action rate by bucket · Verification Freshness. Existing charts stay below the fold.

### 9. Hyperlocal architecture (Priority 13)

`neighborhood` and `community_board` on resources and events, with an optional district filter. Bronx-wide remains the default — this only makes a curated single-district pilot possible later.

### 10. Multilingual honesty (Priority 12)

UI translation untouched. A `translated_langs` field marks which records are genuinely translated; untranslated content shows a small "English only" note instead of silently serving English. No bulk auto-translation.

### 11. Organization claiming (Priority 8)

A "Is this your organization?" link on resource detail pages writing to the existing report/submission flow with a `claim` type, surfacing in the admin queue. No portal.

## Not being touched

The 14-category taxonomy. The 6 + "See More" pattern. The visual identity. Civic/`/civic` and community boards. Emergency page and offline support. SMS. TTS. Map and transit. Packs, lists, favorites. Business routes (left as-is, not extended). Pitch, deck, one-pager. No route deletions.

## Not being built

Premium subscriptions, business analytics, social sync, video upload, AI verification agent, five-language content, heatmaps, white-label, creator tools, push infrastructure.

## Needs your decision (not assumed)

- **Seed verification honestly.** Every one of the 201 records will import as "Needs verification" unless you tell me otherwise. That means the demo shows mostly grey pills until you verify records by hand. The alternative — marking them "verified via public source" — is a claim I can't substantiate for you. Say which.
- Default re-verification interval per category.
- Which categories count as sensitive for the no-tracking path.
- Exact privacy wording (you're in law school — you should write the sentence).
- Whether the pilot narrows to one community board district for November.

## Technical notes

- One migration: `resources` table + seed INSERTs + `verify_every_days`, plus new columns on `events`. GRANTs and RLS included; anon SELECT on active rows only, admin writes via `has_role`.
- Reads through `createServerFn` in `src/lib/resources.functions.ts` with the static array as fallback.
- `src/lib/data.ts` retained, not deleted.
- Changes staged in order: migration → verification truth → home page → events → privacy → admin → analytics, testing between each.

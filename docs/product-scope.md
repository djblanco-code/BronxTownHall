# Product scope

The short version of the Bronx Town Hall product vision, kept in the repo so
people and agents can check work against it. Update it when a decision
changes.

## What the app is

Bronx Town Hall is a small, honest directory of free help in the Bronx: food,
health, legal aid, jobs, youth programs and local events, in five languages
(en, es, fr, bn, ar), with a clear note on when each listing was last checked.
It points people to 311, NYC agencies and nonprofits; it does not replace them.
Phone first, workable on a laptop.

The first version does three things well:

1. Help a resident find free help nearby.
2. Show what is happening in their part of the Bronx.
3. Show who represents them.

## Who it is for

| Archetype          | Example residents                                     | What the app must do                                                               |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Need it now        | Single parent in Mott Haven; Bengali-speaking retiree | Reach one checked, open place in a few taps; read it aloud; call or get directions |
| Explore my Bronx   | Student at Fordham                                    | Show what is happening this week near them; make it easy to share                  |
| Sign up (optional) | Any resident                                          | Keep saved places and lists across devices; updates for their area                 |

Organizations (nonprofits, sponsors, local businesses) are the long-term paying
customers, through representation in the app. Residents come first.

Launch: the whole Bronx is available; outreach and testing focus on one zip
code first.

## Tabs

| Tab       | Purpose                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| Home      | What's useful today: search, deadlines, open tonight, events today, help now                  |
| Find      | Look for help by need: search, Ask, categories, list or map view, listing pages               |
| Events    | Things to do this week and weekend, add to calendar, share                                    |
| Town Hall | Community board, precinct and council member by zip, meeting times, verified official updates |
| Saved     | Favorites and lists, with optional sign-up so they sync                                       |

Settings (language, text size, Simplified View, privacy) sits behind the profile
icon. SOS is on every screen. Simplified View keeps the same tabs.

## In the first version

- Listings checked by people, with the last-checked date
- Search, Ask and categories, with a map view
- Events, including community-submitted events after admin review
- Town Hall information and verified official updates
- Optional sign-up for saved places and lists
- Five languages, Simplified View, read-aloud, SOS
- The organization portal for submitting listings for review
- Admin tools to review listings, events and organizations

## Not in the first version (hidden, not deleted)

- Buzz, until there is real local data behind it
- Business directory and business sign-up
- Caseworker tools (Pro, referrals, packs)
- Creators, social sync, the Digest page
- Pitch, deck and one-pager pages: reachable by link, not in navigation
- Different layouts by tech comfort (a later idea)

## Principles

1. Show when each listing was last checked, and say so when it hasn't been.
2. AI only understands the question and picks from our own listings; it never writes facts.
3. Keep the path from a question to a phone number or address short.
4. Five languages, right-to-left Arabic, larger text and read-aloud everywhere.
5. No account required; personal history stays on the device; people can delete their data.
6. Empty or failed states suggest a next step instead of a dead end.
7. Small changes, one per PR, each checked on a phone, in Arabic and in Simplified View.

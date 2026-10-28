# Mobile-first refactor

Goal: rebuild The Bronx App one workflow at a time. Each piece is designed for
phones first (using [Mobbin](https://mobbin.com) references from strong mobile
apps), moved into its own feature folder, and verified on real screen sizes
before the next one starts. Once the mobile pieces are done, a web pass gives
each screen a proper desktop layout.

## How a piece is done

1. **Audit**: screenshot the current screens at 390×844 and list what gets in the way.
2. **Reference**: pull Mobbin screens/flows for the same job and note the patterns worth copying.
3. **Move + rebuild**: put the workflow in `src/features/<name>/`; the route file
   stays as a thin wrapper.
4. **Verify**: typecheck, lint, build, then before/after screenshots on phone,
   tablet and desktop, plus Arabic (RTL) and Simplified View.
5. **Ship**: one commit per piece.

## Feature folders

```
src/features/<feature>/
  index.ts        public API: the only path other code imports from
  messages.ts     strings for all five languages, auto-registered as `<feature>.*`
  components/     UI owned by the feature
  nav.ts, lib/…   feature logic and config, as needed
src/routes/       thin route files: route config + render the feature's screen
src/components/ui shared design-system primitives (shadcn, bottom-sheet)
```

- Import a feature only through `@/features/<feature>`, never from files inside it.
- Shared building blocks go in `src/components/ui`, `src/hooks` or `src/lib`,
  not inside a feature that others then reach into.
- Anything fixed to the bottom of the screen uses the `app-float-bottom`
  (floating) or `app-dock-bottom` (full-width bar) utilities from `styles.css`,
  never a hard-coded `bottom-24`. A page's floating button goes in
  `<AppShell fab={…}>`, so it stacks with SOS.

## Pieces

| #   | Piece                                                                                                                        | Status  |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | **App shell**: top bar, tab bar, language picker, floating actions, footer                                                   | ✅ Done |
| 2   | **Home / Discover**: search-first hero, compact categories, no arrival pop-ups, rethink the Feedback button                  | ✅ Done |
| 2b  | **Home: Today in the Bronx**: greeting, deadline alerts, open tonight, events today and this weekend, picks from history     | ✅ Done |
| 3   | **Browse a category**: list cards, filters in a bottom sheet                                                                 | Next    |
| 4   | **Resource detail**: sticky Call / Directions / Save / Share bar                                                             |         |
| 5   | **Search + Ask**: one search screen with recents and suggestions                                                             |         |
| 6   | **Map**: map with a draggable results sheet                                                                                  |         |
| 7   | **Events**: Buzz, Events and This Week as one date-driven flow                                                               |         |
| 8   | **Saved**: favorites, lists and resource packs                                                                               |         |
| 9   | **Settings & accessibility**: language, text size, Simplified View, account, About/legal                                     |         |
| 10  | **Civic / Your Voice**                                                                                                       |         |
| 11  | **Business**: directory, owner portal and dashboard                                                                          |         |
| 12  | **Admin**: internal tools, desktop-first, mostly moved rather than redesigned                                                |         |
| W   | **Web pass**: desktop (lg+) layouts for 2–11, and desktop navigation (Favorites, Buzz and Settings have no desktop link yet) |         |

Cross-cutting follow-ups:

- **Root-level nudges**: the "Personalize your experience" card (`__root.tsx`)
  still appears after 30 seconds on any page; fold it into the Settings piece.
- **PWA polish**: opt into `viewport-fit=cover`. The safe-area insets already
  flow through `--app-tabbar-h` / `--app-bottom-inset`, so this only needs
  top-bar and landscape padding added.

## Piece 2b: Today in the Bronx (done)

Home now answers "what's useful right now?" instead of asking "what do you
need today?". It builds on the opening-hours parser (`src/lib/opening-hours.ts`),
which reads 176 of the 231 seeded listings' hours and says "unknown" for the
rest rather than guessing.

- A greeting for the time of day in New York, in the visitor's language, with
  their neighborhood and the date ("Good evening, Mott Haven · Wed, Oct 28"),
  above the title "Today in the Bronx". It appears after hydration in a
  fixed-height line, so nothing shifts.
- Staff-published deadlines that haven't passed yet, as up to two amber rows.
  Nothing renders when none are active.
- "Right now": chips for Open tonight, Events today and This weekend, starting
  on the first one with something in it. Open tonight lists places still open
  after 6 PM, open ones first, nearest first, preferring the chosen
  neighborhood when it has at least three. Each tile says "Open until 8 PM",
  "Opens at 3 PM", "Open until dusk" (parks) or "Open 24 hours".
- "Picked for you": listings from the categories this phone has browsed most
  (on-device history only), open ones first. Legal, health and housing are
  never used to personalise, and the row hides when personalisation is off.
- Listing tiles (`ResourceTile`) live in the resources feature next to
  `ResourceCard`; the row layout (`CardRow`) is shared by both Home rows.

Mobbin references:

- Greeting with today's summary underneath:
  [Withings](https://mobbin.com/screens/6852bc4c-c9d3-434d-b52f-54521e690076),
  [Bloom](https://mobbin.com/screens/1b17c919-dc12-4e39-ad3d-5da1d854bf69)
- Local, time-sensitive items first:
  [Nextdoor](https://mobbin.com/screens/f0b2ac3d-75b2-4f56-af18-24f4417377c9)
- A row picked from what you've looked at:
  [Nike](https://mobbin.com/screens/8ea0b69c-e7d6-49ee-b2b9-414b4ecda229)

## Piece 2: Home (done)

**Before** (390×844, returning visitor): the category grid started at 803px,
right at the bottom of the screen and behind the tab bar; events started at
1,409px. A first visit opened the daily-fact pop-up on top of everything; the
category tip dimmed the whole page; a Feedback button floated over SOS; the
large "Want a simpler view?" card and a location card pushed content down; and
a failed events request left the section empty or spinning.

**After** (`src/features/home`; the route file went from 313 lines to 25):

- Search first: neighborhood picker above the title, one search field with the
  microphone inside it, "Ask a question" and "Keyword search" as chips, and the
  privacy and verification notes as two quiet lines.
- Categories as a four-across icon grid with labels below: eight in two rows
  (personalised as before, sensitive categories never surface), "See all" opens
  the rest in place. The grid now starts at 593px; events at 811px.
- Upcoming events as swipeable cards with a date badge (a grid on desktop),
  skeleton cards while loading, and an error line with a link to all events
  when the request fails or stalls for 10 seconds.
- "Need help now?" groups Emergency and the text line as list rows.
- Nothing opens on arrival: the daily fact is an inline card lower down, the
  category tip is gone, and Feedback is a row at the bottom instead of a
  floating button, leaving SOS as the only one.
- Simplified View offer shrunk to one row; all new text in five languages.

Mobbin references:

- Location above search, then content rows with "See all":
  [StubHub](https://mobbin.com/screens/ce86d8f6-0d1c-4fa5-8d76-0288b648a4a8)
- Microphone inside the search field:
  [Google Maps](https://mobbin.com/screens/9ce94629-725e-49bb-ae6c-b112b10c37d1),
  [Amazon](https://mobbin.com/screens/ade63695-2dfc-46dd-8ccb-59cd3f24416d)
- Four-across category icons with labels below:
  [Yahoo News](https://mobbin.com/screens/5edd48cc-5531-4dd5-b510-046aa3639bb8),
  [Blinkit](https://mobbin.com/screens/780f4eee-3562-4c92-879d-d2199e84493d),
  [bless.](https://mobbin.com/screens/5a170a57-1114-4248-ac79-0e500194a72f)
- Swipeable event cards:
  [Posh](https://mobbin.com/screens/a2ee4aae-acfc-4cc0-ab68-2b98bd352c30),
  [Swiggy](https://mobbin.com/screens/4244994a-b193-4231-b2cf-ed52f085ae7b)

## Piece 1: App shell (done)

**Before** (390×844): the prototype banner, a header and a second row of five
language chips plus text size took ~270px before any content, on every screen.
The SOS button and the page's own floating button overlapped, the Simplified
View Help button sat exactly on top of SOS, and About/FAQ/Terms/Contact had no
link at all on phones.

**After**:

- One 56px top bar: brand, language button, account button. Text size stays in
  Settings on phones and inline on desktop.
- Language opens a bottom sheet listing each language in its own script, with
  a check on the current one (the old first-run hint now points at it).
- Signed in, the account button opens a sheet with Settings and Sign out, so
  signing out is never one stray tap. Phones could not sign in or out from the
  header before.
- Bottom tabs on phones _and tablets_ (below `lg`), with an active pill and
  safe-area padding. Previously 640–767px widths had neither tabs nor links.
- One floating-action stack (page action → Help → SOS) above the tab bar.
  Docked bars (audio player, share bar) sit on top of the tab bar and lift the
  stack while open.
- Slim prototype banner that could be dismissed for the visit (since removed).
- Footer on every screen size; navigation defined as data in
  `src/features/shell/nav.ts`.

Mobbin references:

- Slim top bar + single search entry + 4–5 tabs:
  [Eventbrite](https://mobbin.com/screens/86abe4b2-d1b5-486e-92a7-fb3183ef0e27),
  [Wanderlog](https://mobbin.com/screens/7e4d787b-2f71-4fa9-8766-b255ae1fb911),
  [Beli](https://mobbin.com/screens/6fac5df0-46f3-474d-87f2-e3aead501373)
- Language bottom sheet, native names, check on current:
  [Yami](https://mobbin.com/screens/3570fd5a-a0d2-4402-acb9-e46f0021699d),
  [Alta](https://mobbin.com/screens/ef520a6a-3126-42d7-b2d5-1289e2365f70),
  [Meta AI](https://mobbin.com/screens/d70b7e69-6a14-4793-b4f5-e8da21f71bf0)

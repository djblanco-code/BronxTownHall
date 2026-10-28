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

| # | Piece | Status |
|---|-------|--------|
| 1 | **App shell**: top bar, tab bar, language picker, floating actions, footer | ✅ Done |
| 2 | **Home / Discover**: search-first hero, compact categories, no arrival pop-ups, rethink the Feedback button | Next |
| 3 | **Browse a category**: list cards, filters in a bottom sheet | |
| 4 | **Resource detail**: sticky Call / Directions / Save / Share bar | |
| 5 | **Search + Ask**: one search screen with recents and suggestions | |
| 6 | **Map**: map with a draggable results sheet | |
| 7 | **Events**: Buzz, Events and This Week as one date-driven flow | |
| 8 | **Saved**: favorites, lists and resource packs | |
| 9 | **Settings & accessibility**: language, text size, Simplified View, account, About/legal | |
| 10 | **Civic / Your Voice** | |
| 11 | **Business**: directory, owner portal and dashboard | |
| 12 | **Admin**: internal tools, desktop-first, mostly moved rather than redesigned | |
| W | **Web pass**: desktop (lg+) layouts for 2–11, and desktop navigation (Favorites, Buzz and Settings have no desktop link yet) | |

Cross-cutting follow-ups:

- **PWA polish**: opt into `viewport-fit=cover`. The safe-area insets already
  flow through `--app-tabbar-h` / `--app-bottom-inset`, so this only needs
  top-bar and landscape padding added.
- **Lockfiles**: `package-lock.json` no longer matches `package.json`, and
  `bun.lock` resolves from Lovable's private registry; regenerate one against
  the public npm registry.

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
- Bottom tabs on phones *and tablets* (below `lg`), with an active pill and
  safe-area padding. Previously 640–767px widths had neither tabs nor links.
- One floating-action stack (page action → Help → SOS) above the tab bar.
  Docked bars (audio player, share bar) sit on top of the tab bar and lift the
  stack while open.
- Slim prototype banner that can be dismissed for the visit.
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

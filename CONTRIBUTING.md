# Contributing

Thanks for helping build The Bronx App. This guide covers how work moves from
an idea to `main`. For running the app locally and hosting it, see
[`README.md`](README.md) and [`docs/self-hosting.md`](docs/self-hosting.md).

## Deciding what to work on

- The current plan is the piece-by-piece redesign in
  [`docs/mobile-first-refactor.md`](docs/mobile-first-refactor.md). Each piece is
  one pull request.
- Bugs and smaller ideas go in GitHub issues. Comment on an issue before starting
  so two people don't build the same thing.

## Making a pull request

- Branch from `main` and target `main`.
- Keep it to **one change**: one piece, one fix, one refactor. Small pull requests
  get reviewed faster and are easy to revert.
- Fill out the pull request template, including before/after screenshots for UI.
- Name it like this:
  - Start with a prefix:
    - `feat`: a non-breaking change that adds functionality.
    - `fix`: a non-breaking change that fixes an issue.
    - `refactor`: a change that neither fixes a bug nor adds a feature.
    - `docs`: a change only to in-code or markdown documentation.
    - `test`: a change that adds missing tests.
    - `chore`: a change that is likely none of the above.
  - All lowercase, starting with a verb ("add …", "rebuild …", "fix …").
  - End with an emoji. 🌆
  - For example: `feat: rebuild the category page mobile-first 📱`
- Link the issue it closes: `Closes #<number>`.
- Pull requests are **squash-merged**, so `main` reads as one commit per change
  and the pull request title becomes the commit message.

A pull request can be merged when:

- the **CI** check (type check, lint, formatting, build) passes,
- the **Vercel** preview deploys and the change works there,
- review comments are resolved.

## Checks to run locally

```bash
npm run type-check
```

```bash
npm run lint
```

```bash
npm run format:check
```

```bash
npm run build
```

`npm run format` fixes formatting for you.

## How the code is organised

```
src/features/<name>/   one folder per workflow (shell, home, …)
  index.ts             the only file other code imports from
  messages.ts          strings in all five languages, registered as `<name>.*`
  components/ …        UI owned by the feature
src/components/ui/     shared building blocks with no app-specific logic
src/routes/            thin route files: route config + render the feature's screen
src/lib/               shared logic and data
supabase/migrations/   database changes
```

- Import a feature only through `@/features/<name>`, never from files inside it.
- If two features need the same piece of UI, move it to `src/components/ui`
  instead of copying it.
- Reach for the shared blocks first: `Section` + `SectionAction` (a titled
  section with "See all"), `Chip`, `ListGroup` + `ListRow` (tappable rows),
  `EmptyState`, `BottomSheet`, and the shadcn primitives in the same folder.
  Pass a router `<Link>` as the child (with `asChild` where the block offers
  it) so links stay type-checked.
- Anything fixed to the bottom of the screen uses the `app-float-bottom` or
  `app-dock-bottom` utilities; a page's floating button goes in
  `<AppShell fab={…}>`.

## UI changes

Design for a phone first. Before opening the pull request, check the screen at
390×844, on a tablet and on desktop, in Arabic (right-to-left) and with
Simplified View on. Every new string needs all five languages: English,
Español, Français, বাংলা and العربية.

## Database changes

Add a new file in `supabase/migrations/` named
`YYYYMMDDHHMMSS_short_description.sql`. Never edit a migration that has already
run. Apply with `npx supabase db push`, or use `npm run --silent db:bundle` to
set up a brand-new project from the SQL Editor.

## Environment variables

Add any new variable to `.env.example` and to the table in
[`docs/self-hosting.md`](docs/self-hosting.md). Anything secret must not start
with `VITE_`, because those values are sent to the browser.

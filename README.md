# The Bronx App

A free, multilingual community resource finder for Bronx residents: food,
health care, legal help, jobs, housing, events and local businesses, in
English, Español, Français, বাংলা and العربية.

**Stack:** TanStack Start (React 19, SSR) · Tailwind CSS 4 · Supabase
(Postgres, Auth, Storage) · deployed on Vercel.

## Run it locally

```bash
cp .env.example .env
```

Fill in the three required Supabase values in `.env`, then:

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:8080.

## Docs

- [`docs/self-hosting.md`](docs/self-hosting.md): set up Supabase and Vercel, environment variables, admin access, scheduled jobs
- [`docs/mobile-first-refactor.md`](docs/mobile-first-refactor.md): the piece-by-piece mobile-first redesign and the feature-folder structure
- [`CONTRIBUTING.md`](CONTRIBUTING.md): how to open a pull request (titles, template, checks, squash merging)
- [`AGENTS.md`](AGENTS.md): conventions for coding agents

## Project layout

```
src/features/   one folder per workflow (shell, home, …), imported via its index.ts
src/routes/     thin TanStack Router route files
src/components/ shared components; src/components/ui is the design-system layer
src/lib/        shared logic and data
supabase/       database migrations (apply with `npx supabase db push`)
```

# catch-it

An app for finding public transit routes (trams, buses, metro) in Prague.
Currently a web app (Next.js); a mobile app (React Native / Expo) sharing the
same business logic is planned.

## Repository structure

This is a pnpm monorepo (workspaces + [Turborepo](https://turborepo.com)):

```
apps/
  web/            # Next.js app (App Router, TypeScript, Tailwind)
  mobile/         # React Native / Expo app (not initialized yet, see apps/mobile/README.md)
packages/
  core/           # shared domain model and business logic (Stop, Line, Departure, Route...)
  api-client/     # client for Golemio/PID (Prague transit data) + TanStack Query hooks
  ui/             # shared design tokens for web (Tailwind) and mobile (NativeWind)
```

Code inside each app is organized **by feature** (`src/features/<feature>`)
rather than by technical file type — see
`apps/web/src/features/README.md`.

## Tech stack

- **Web**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Mobile (planned)**: React Native + Expo
- **Transit data**: [Golemio](https://golemio.cz) / PID (Pražská integrovaná doprava) — Prague's official open data API
- **Server state / caching**: TanStack Query
- **Testing**: Vitest + Testing Library
- **Monorepo tooling**: pnpm workspaces + Turborepo

## Getting started

```bash
pnpm install
pnpm dev            # runs the dev task for every app (currently — web)
```

The web app will be available at [http://localhost:3000](http://localhost:3000).

Other useful commands (run from the repo root, via Turborepo):

```bash
pnpm build          # build all apps/packages
pnpm lint           # lint all apps/packages
pnpm typecheck       # type-check everything
pnpm test            # run tests
```

To run a command for a single app only:

```bash
pnpm --filter @catch-it/web dev
```

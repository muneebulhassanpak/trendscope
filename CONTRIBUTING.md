# Architecture & conventions

These rules keep the codebase consistent as it grows. Follow them for every change.

## Project structure

```
app/                         Routes only — thin pages that compose features
  (dashboard)/               App shell (sidebar + header)
    admin/                   Admin area — guarded by admin/layout.tsx
  (auth)/login/              Sign-in page
  api/cron/sync/             Scheduled market sync (Bearer CRON_SECRET)
features/<domain>/           Everything for one domain
  components/                Domain UI (server components by default)
  queries.ts                 Server-only reads ("server-only")
  actions.ts                 Server actions ("use server")
  schemas.ts                 Zod schemas shared by forms and actions
  types.ts                   Domain types derived from the database types
components/
  ui/                        shadcn/ui primitives — generated, avoid editing
  layout/                    App shell: sidebar, header, user menu
  shared/                    Cross-domain building blocks (page header, stat card, charts…)
lib/
  supabase/                  server.ts, client.ts, admin.ts, proxy.ts, database.types.ts
  market-data/               Provider interface, demo provider, sync job
  auth.ts                    getViewer, requireAdminArea, authorizeWrite
  env.ts / env.server.ts     Validated environment (public / server-only)
  format.ts                  All number, currency, percent and date formatting
  action-result.ts           ActionResult type for server actions
scripts/                     CLI entry points (tsx): data:sync, data:seed
supabase/migrations/         Schema changes — the only way to change the database
e2e/                         Playwright specs
```

Domains: `dashboard`, `products`, `compare`, `rankings`, `trends`, `insights`
(public articles), `observations`, `articles` (CMS), `sources`, `sync`, `settings`, `auth`.

## Data access

- **Reads** live in `features/<domain>/queries.ts`, start with `import "server-only"`, and use
  `createClient()` from `@/lib/supabase/server` so Row Level Security applies.
- **Writes** are server actions in `features/<domain>/actions.ts`:
  1. `const auth = await authorizeWrite(); if (!auth.ok) return auth`
  2. Validate input with the domain's Zod schema (`safeParse`, never trust `FormData`)
  3. Mutate with the user-scoped client (RLS is the second line of defence)
  4. `revalidatePath(...)` and return an `ActionResult` — never throw to the client
- `createAdminClient()` (secret key, bypasses RLS) is **only** for the market sync. Never use it
  to serve a user request.
- Prefer the analytics views (`product_overview`, `market_index_daily`, `category_index_daily`)
  over recomputing aggregates in TypeScript.
- Derive types from `Database` (`Tables<"product_overview">`, `TablesInsert<"observations">`, `Enums<"user_role">` from `@/lib/supabase/database.types`);
  do not hand-write row shapes. Regenerate with `npm run db:types` after a migration.

## Auth & roles

| Role               | Market pages | Admin area | Writes                             |
| ------------------ | ------------ | ---------- | ---------------------------------- |
| anonymous / viewer | read         | —          | —                                  |
| demo               | read         | read       | blocked (`DEMO_READ_ONLY_MESSAGE`) |
| admin              | read         | read       | yes                                |

Admin pages are protected three times: the proxy redirects anonymous users, `admin/layout.tsx`
calls `requireAdminArea()`, and every action calls `authorizeWrite()`; RLS enforces it in the database.

## UI

- Server components by default; add `"use client"` only for interactivity, at the leaf.
- Pages: `<PageHeader title description actions? />` first, then content. Export `metadata`.
- Use shadcn primitives from `@/components/ui` with base-ui `render` props (not `asChild`).
- Format every number and date with `@/lib/format` — never inline `toFixed` or `toLocaleString`.
- Price change: `<ChangeBadge value={pct} />` (green up, red down, with an arrow icon — never color alone).
- Empty, loading and error states are required for every data view (`<Empty>`, `loading.tsx`, `error.tsx`).
- Mobile first: every screen must work at 390px wide with no horizontal page scroll.

### Charts

- Recharts through shadcn `ChartContainer`; colors only via `var(--chart-N)` tokens (validated
  categorical palette, both themes) and `var(--positive)` / `var(--negative)` for deltas.
- Assign series colors in fixed order by entity, never by rank. One y-axis per chart.
- 2px lines, recessive grid, tooltip on hover, legend for 2+ series.

## Naming

- Files and folders: `kebab-case`. Components: `PascalCase`. Hooks: `use-*.ts` exporting `useX`.
- Server actions: verb first (`createObservation`, `publishArticle`).
- Queries: `get*` for one, `list*` for many (`getProduct`, `listProducts`).
- URL state (filters, sort, period) lives in search params, not component state.

## Database changes

1. `npm run db:new <name>` and write SQL (RLS on every new table; `security_invoker` on views;
   `set search_path = ''` on functions).
2. `npm run db:reset && npm run data:seed` locally, then `npm run db:types`.
3. Open a PR — CI replays all migrations; merging to `main` deploys them.

**Never change the remote database by hand.**

## Testing & quality gates

- `npm run lint && npm run typecheck && npm run build` must pass.
- Add or update a Playwright spec in `e2e/` for every user-facing feature (`*.mobile.spec.ts` for
  mobile-only checks). Run with `npm run test:e2e` against the local stack.
- One feature per branch (`feat/<name>`), one PR, squash-merged after CI is green.

# TrendScope

Market intelligence dashboard — Next.js, shadcn/ui, Supabase.

## Local setup

```bash
npm install
npm run db:start        # local Supabase (Docker); prints URL + keys
cp .env.example .env.local   # fill with values from `npx supabase status`
npm run data:seed       # market data sync + demo account + editorial content
npm run dev
```

## Database workflow

The remote database is **never changed by hand**. Every schema change is a migration that goes through a PR.

1. Branch off `main`: `git checkout -b feat/<name>`
2. Create a migration: `npm run db:new <name>` → edit `supabase/migrations/<timestamp>_<name>.sql`
   (or change the schema in local Studio and run `npm run db:diff <name>`)
3. Apply locally: `npm run db:reset` (rebuilds local DB from all migrations + `supabase/seed.sql`)
4. Regenerate types: `npm run db:types`
5. Open a PR → **CI** runs lint, typecheck, build, and replays every migration on a fresh Postgres
6. Merge to `main` → **Deploy database** runs `supabase db push` against the remote project

### Required GitHub secrets (environment: `production`)

| Secret                  | Where to find it                                    |
| ----------------------- | --------------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | supabase.com → Account → Access Tokens              |
| `SUPABASE_PROJECT_ID`   | Project Settings → General → Project ID             |
| `SUPABASE_DB_PASSWORD`  | The database password set when creating the project |

## Conventions

See [CONTRIBUTING.md](CONTRIBUTING.md) for architecture, data access, auth and UI rules.

## Adding UI components

```bash
npx shadcn@latest add <component>
```

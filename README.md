# Orbit — screenshot test UI

A mock developer-platform dashboard (deployments, logs, feature flags, monitors, incidents, team, billing) built with Next.js 16, Tailwind v4, and shadcn/ui. Everything is client-side with seeded data; there is no backend.

It exists to give documentation screenshot automation a rich, deterministic target: full pages, cropped components, modals, multi-step forms, empty states, error states, and dark mode.

## Run

```bash
pnpm install
pnpm dev
```

Deploys to Vercel with zero configuration (`pnpm build` / `pnpm start`).

## Determinism

All timestamps are relative to a fixed `NOW` in `src/lib/data.ts`, so relative times ("2h ago") and charts render identically on every load. Mutations (toggling a flag, creating a key) live in a React reducer and reset on reload.

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Overview dashboard: stats, traffic chart, incidents, recent deployments |
| `/projects` | Project table/grid, filters, 3-step "New project" dialog (`?new=1`) |
| `/projects/[slug]` | Tabs: overview, deployments, environment (masked secrets with reveal), domains, settings (danger zone with typed confirmation). `?tab=environment` deep-links a tab |
| `/deployments` | Paginated, filterable deployment list |
| `/deployments/[id]` | Pipeline steps, build logs terminal, error banner (`dpl_7d3m0q`), building state (`dpl_5c9x2p`), queued (`dpl_1z6k5t`) |
| `/logs` | Log explorer with level/service filters and expandable JSON rows |
| `/flags` | Feature flags table with switches, detail sheet (`?focus=<key>`), 3-tab create dialog (`?new=1`) |
| `/monitors` | Monitor list; `/monitors/new` is a 4-step wizard with a collapsible advanced section; `/monitors/[id]` has charts |
| `/incidents` | Master/detail incident view with timeline (`?focus=inc_204`) |
| `/api-keys` | Keys table, scoped create dialog (`?new=1`), one-time secret reveal modal |
| `/webhooks` | Endpoints with expandable deliveries, create sheet |
| `/team` | Members with inline role select, invite dialog |
| `/audit-log` | Filterable audit table |
| `/usage` | Usage charts and plan quotas |
| `/settings` | Vertical tabs: general, billing (`?tab=billing`), integrations, notifications, security |
| `/login` | Mock sign-in page (no auth) |

Useful edge cases: `sandbox-playground` has no deployments (empty state), `ingest-pipeline` is down (alert banner), `legacy-cron` is paused, and `⌘K` opens the command palette anywhere.

Stable hooks for automation: many containers carry `data-testid` attributes (e.g. `build-logs`, `create-flag-dialog`, `api-key-reveal-dialog`, `delete-project-dialog`, `env-vars`, `monitor-alert-conditions`).

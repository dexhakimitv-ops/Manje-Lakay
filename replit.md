# Manje Lakay

Mobile-first Haitian food ordering PWA with a Haitian Creole customer homepage, persistent meal catalog, gourde pricing, search and category browsing, checkout, a working shopping cart, and a merchant dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/manje-lakay/src/App.tsx` — customer homepage, sample menu data, search/filtering, cart state, and install prompt
- `artifacts/manje-lakay/src/index.css` — Manje Lakay visual theme and responsive styling
- `artifacts/manje-lakay/public/manifest.json` — PWA metadata for Android installation
- `artifacts/manje-lakay/public/sw.js` — offline shell caching for the first-load experience
- `lib/api-spec/openapi.yaml` — typed contracts for meals, orders, and merchant overview data
- `artifacts/api-server/src/routes/meals.ts` — meal catalog CRUD
- `artifacts/api-server/src/routes/orders.ts` — customer order submission and merchant status actions
- `artifacts/api-server/src/routes/merchant.ts` — merchant dashboard counts
- `lib/db/src/schema/` — persistent meals and orders tables

## Architecture decisions

- The first customer experience is frontend-only with local sample data so the core browse-to-cart flow can be validated before adding accounts, vendors, or payments.
- PWA metadata and a service worker are included from the first build so the mobile experience is installable and has an offline-ready shell.
- Haitian Creole is the primary interface language and prices are presented in HTG (goud).
- Meal and order state is now persisted in PostgreSQL behind the shared API server; the homepage and merchant route consume the same records.

## Product

Customers can discover Haitian meals, search and filter by category, compare prices and ratings, add meals to a cart, enter delivery and payment details, and submit orders. Merchants can manage their meal catalog, availability, restaurant details, and incoming orders from `/merchant`.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

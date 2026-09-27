# Manje Lakay

Mobile-first Haitian food ordering PWA with a Haitian Creole customer homepage, sample local meals, gourde pricing, search and category browsing, and a working shopping cart.

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

## Architecture decisions

- The first customer experience is frontend-only with local sample data so the core browse-to-cart flow can be validated before adding accounts, vendors, or payments.
- PWA metadata and a service worker are included from the first build so the mobile experience is installable and has an offline-ready shell.
- Haitian Creole is the primary interface language and prices are presented in HTG (goud).

## Product

Customers can discover Haitian meals, search and filter by category, compare prices and ratings, add meals to a cart, adjust quantities, and see an order total before checkout.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

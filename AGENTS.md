# AGENTS.md — VDV LMS

Guidance for agentic coding tools operating in this repository.

## Project Overview

A Next.js 16 App Router LMS built with:
- **Runtime**: Next.js 16 (App Router, React 19, React Compiler)
- **Database**: PostgreSQL via Prisma v7 + `@prisma/adapter-pg`
- **Auth**: Supabase Auth (`@supabase/ssr`)
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Validation**: Zod v4 (`zod/mini` in `"use client"` files, `zod` in server-side files)
- **Forms**: `@tanstack/react-form`
- **Linter/Formatter**: Biome (replaces ESLint + Prettier entirely)
- **Package manager**: pnpm

---

## Commands

```bash
pnpm dev               # Start Next.js dev server
pnpm build             # Production build
pnpm start             # Start production server
pnpm lint              # Run Biome check (lint + format check)
pnpm format            # Auto-fix formatting with Biome
npx prisma <cmd>       # Run Prisma CLI (.env.local loaded via prisma.config.ts)
pnpm test              # Run Vitest (single run)
pnpm test:watch        # Run Vitest in watch mode
pnpm test:integration  # Run Playwright integration tests
```

**Unit tests**: Vitest with `vite-tsconfig-paths`. Test files live alongside source as `*.test.ts`/`*.test.tsx` under `src/`. Environment is `node` (no jsdom).

**Integration tests**: Playwright. Tests live in `integration-tests/`. Run against a live server (`pnpm dev` or `pnpm start`).

---

## TypeScript

- `strict: true` — never use `any` or disable strict checks
- Path alias `@/` maps to `src/` — never use `../` parent traversal
- `moduleResolution: "bundler"`, target `ES2023`
- Use `import type` for type-only imports

---

## Code Style (Biome-enforced)

- 2-space indentation, double quotes
- Imports auto-sorted by Biome — do not manually reorder
- No `.eslintrc`, no `.prettierrc`

---

## Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Source files | `kebab-case` | `route-helpers.ts` |
| Pages | `page.tsx` inside kebab-case dir | `login/page.tsx` |
| API routes | `route.ts` inside resource dir | `api/consultations/route.ts` |
| React components | PascalCase default export | `LoginPage` |
| Server Actions | `camelCase` + `Action` suffix | `loginAction` |
| Utility functions | `camelCase` | `getCurrentUser` |
| Zod schemas | `camelCase` + `Schema` suffix | `createSchema` |
| Prisma models | PascalCase | `Tutor`, `Consultation` |
| DB fields | `camelCase` | `firstName`, `tutorId` |
| Unused params | `_` prefix | `_request` |

---

## Next.js App Router Patterns

- **Server Components by default** — only add `"use client"` for browser APIs, state, or event handlers
- **Server Actions** — `"use server"` at top of file
- **API routes** — named HTTP verb exports (`GET`, `POST`, etc.) from `route.ts`
- **Dynamic params** are `Promise`-typed and must be awaited:
  ```ts
  export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  ```
- **Middleware** lives in `src/proxy.ts` (not `middleware.ts`), exports `proxy` + `config.matcher`
- `reactCompiler: true` is enabled — do not add `useMemo`/`useCallback` without a specific reason

---

## Error Handling Patterns

- **API routes**: auth-guard first, then `try/catch`; return `{ error }` JSON with appropriate status codes (401, 404, 500)
- **Request body validation**: `schema.safeParse(await request.json())` — return 400 on failure
- **Server Actions**: return `{ error: message }` — do not throw; call `redirect()` on success
- **Middleware**: 401 JSON for `/api/*`, redirect to `/login` for pages

---

## Zod v4 API Conventions

- Import from `zod/mini` in `"use client"` files, `zod` in server-side files
- String format validators are **top-level functions**, not chained methods:
  - `z.email()`, `z.uuid()`, `z.url()`, `z.iso.datetime()`, `z.iso.date()`, `z.iso.time()`
- Other v4 changes: `z.enum(MyEnum)` (not `z.nativeEnum`), `z.strictObject({})`, `z.looseObject({})`, `schemaA.extend(schemaB.shape)` (not `.merge`)

---

## Database (Prisma)

- Singleton in `src/db.ts` — `import { prisma } from "@/db"`
- Generated client in `src/generated/prisma/` — never edit; regenerate with `pnpm prisma generate`
- Migrations: `pnpm prisma migrate dev`
- Models: `Tutor`, `Student`, `Consultation` — see `prisma/schema.prisma`

---

## Supabase

- **Browser**: `import { createClient } from "@/supabase/client"` (in `"use client"` components)
- **Server**: `import { createClient } from "@/supabase/server"` (async, cookie-aware)
- **Admin**: `import { createAdminClient } from "@/supabase/admin"` (service role — server only)
- Auth helpers: `import { getCurrentUser } from "@/utils/auth"`
- Env vars validated via Zod in `src/utils/env.ts` — `import { env } from "@/utils/env"`, never `process.env` directly

---

## Styling

- Tailwind CSS v4 — `@import "tailwindcss"` syntax; no `tailwind.config.js`
- DaisyUI v5: `btn`, `card`, `card-body`, `fieldset`, `input`, `alert`, `loading`, etc.
- Dark mode via `prefers-color-scheme` and CSS variables
- Fonts: `--font-geist-sans`, `--font-geist-mono`

---

## File Size

Prefer many small, focused files over few large ones. Each file should have a single clear responsibility. When a file grows to handle multiple concerns, split it — one function or one data set per file is a reasonable target.

---

## Code Organization

```
src/
  app/          # Next.js routing (pages, layouts, API routes, server actions)
    api/        # REST handlers: tutors/, students/, consultations/
    auth/       # Auth server actions
    login/      # Login page
    signup/     # Signup page
  supabase/     # Client factories (client.ts, server.ts, admin.ts, proxy.ts)
  utils/        # Shared utilities (auth.ts, env.ts)
  generated/    # Auto-generated Prisma client — do not edit
  db.ts         # Prisma singleton
  proxy.ts      # Next.js middleware
```

Layer-first, resource-second. Business logic lives in route handlers — no service/repository layer, no `components/` or `hooks/` folder.

---

## Key Constraints

- No ESLint, Prettier, or Jest — Biome for lint/format, Vitest for tests
- Always use `@/` path alias — no `../` parent traversal
- Never access `process.env` directly — use `env` from `@/utils/env`
- Never edit `src/generated/` — auto-generated by Prisma
- No `useMemo`/`useCallback` without a specific reason — React Compiler handles memoization

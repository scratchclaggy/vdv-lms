# AGENTS.md — VDV LMS

Guidance for agentic coding tools operating in this repository.

## Project Overview

A Next.js 15 App Router LMS (Learning Management System) built with:
- **Runtime**: Next.js 16 (App Router, React 19, React Compiler)
- **Database**: PostgreSQL via Prisma v7 + `@prisma/adapter-pg`
- **Auth**: Supabase Auth (`@supabase/ssr`)
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Validation**: Zod v4
- **Forms**: `@tanstack/react-form`
- **Linter/Formatter**: Biome (replaces ESLint + Prettier entirely)
- **Package manager**: pnpm

---

## Build, Lint, and Dev Commands

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run Biome check (lint + format check)
pnpm format       # Auto-fix formatting with Biome
pnpm prisma <cmd> # Run Prisma CLI with .env.local injected (e.g. pnpm prisma migrate dev)
pnpm test         # Run Vitest (single run)
pnpm test:watch   # Run Vitest in watch mode
```

Tests use **Vitest** with `vite-tsconfig-paths` for `@/` alias resolution. Test files live alongside source files as `*.test.ts` or `*.test.tsx` under `src/`. The test environment is `node` (no jsdom) — suitable for utilities, server actions, and API logic.

---

## TypeScript

- `strict: true` — all strict checks are enabled; never use `any` or disable strict checks
- Path alias `@/` maps to `src/` — always use `@/` for internal imports, never `../` parent traversal
- `moduleResolution: "bundler"` — Next.js 16 bundler-style resolution
- Target: `ES2023`
- Use `import type` for type-only imports:
  ```ts
  import type { Metadata } from "next";
  import { type NextRequest, NextResponse } from "next/server";
  ```

---

## Code Style (Biome-enforced)

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: double quotes for strings
- **Imports**: automatically sorted by Biome (`organizeImports: "on"`) — do not manually reorder
- Run `pnpm lint` to check; run `pnpm format` to auto-fix formatting
- No `.eslintrc`, no `.prettierrc` — Biome is the sole tool for both

### Import Order (Biome-managed)
1. Third-party packages (`next/server`, `zod`, `react`, etc.)
2. Internal `@/` aliased modules
3. Relative same-directory imports (`./something`)

---

## Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Files — pages | `page.tsx` inside kebab-case dir | `login/page.tsx` |
| Files — API routes | `route.ts` inside resource dir | `api/consultations/route.ts` |
| Files — utilities | `camelCase.ts` | `auth.ts`, `env.ts`, `db.ts` |
| React components | PascalCase default export | `LoginPage`, `RootLayout` |
| Server Actions | `camelCase` + `Action` suffix | `loginAction`, `signupAction` |
| Utility functions | `camelCase` | `getCurrentUser`, `createClient` |
| Zod schemas | `camelCase` + `Schema` suffix | `createSchema`, `envSchema` |
| Prisma models | PascalCase (matches DB table) | `Tutor`, `Student`, `Consultation` |
| DB fields | `camelCase` | `firstName`, `startTime`, `tutorId` |
| Unused params | Prefix with `_` | `_request`, `_error` |

---

## Next.js App Router Patterns

- **Server Components by default** — only add `"use client"` when browser APIs, React state, or event handlers are required
- **Server Actions** — mark the file with `"use server"` at the top
- **API routes** — export named HTTP verb functions (`GET`, `POST`, `PATCH`, `DELETE`) from `route.ts`
- **Dynamic segments** — folder name with brackets: `[id]/route.ts`; params are `Promise`-typed and must be awaited:
  ```ts
  export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  ```
- **Middleware** lives in `src/proxy.ts` (not `middleware.ts`) and exports a `proxy` function + `config.matcher`
- `reactCompiler: true` is enabled in `next.config.ts` — do not add manual `useMemo`/`useCallback` unless there is a specific reason

---

## Error Handling Patterns

### API routes — try/catch with JSON error responses
```ts
export async function GET(_request: NextRequest, { params }: ...) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await prisma.tutor.findUnique({ where: { id } });
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch tutor" }, { status: 500 });
  }
}
```

### Request body validation — Zod `safeParse`
```ts
const validation = createSchema.safeParse(await request.json());
if (!validation.success) {
  return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
}
```

### Server Actions — return error object, do not throw
```ts
export async function loginAction(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message }; // return, don't throw
  redirect("/");
}
```

### Client components — handle server action errors via state
```ts
const [serverError, setServerError] = useState<string | null>(null);
const result = await loginAction(value.email, value.password);
if (result?.error) setServerError(result.error);
```

### Middleware — 401 JSON for `/api/*`, redirect to `/login` for pages
```ts
if (!user) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}
```

---

## Database (Prisma)

- Prisma client is a singleton in `src/db.ts` — import as `import { prisma } from "@/db"`
- Generated client lives in `src/generated/prisma/` — never edit these files
- To regenerate: `pnpm prisma generate`
- To run migrations: `pnpm prisma migrate dev`
- Prisma CLI always uses `.env.local` (injected via `dotenv-cli`)
- Models: `Tutor`, `Student`, `Consultation` — see `prisma/schema.prisma`

---

## Supabase

- **Browser client**: `import { createClient } from "@/supabase/client"` (use inside `"use client"` components)
- **Server client**: `import { createClient } from "@/supabase/server"` (async, cookie-aware — use in Server Components and API routes)
- Auth helpers: `import { getCurrentUser } from "@/utils/auth"`
- Environment variables are validated at startup via Zod in `src/utils/env.ts`; import as `import { env } from "@/utils/env"` — never access `process.env` directly in application code

---

## Styling

- Tailwind CSS v4 — use `@import "tailwindcss"` syntax; no `tailwind.config.js`
- DaisyUI v5 components: `btn`, `card`, `card-body`, `fieldset`, `input`, `alert`, `loading`, etc.
- Dark mode is handled via `prefers-color-scheme` CSS media query and CSS variables
- Fonts: Geist Sans and Geist Mono, available as `--font-geist-sans` and `--font-geist-mono`

---

## Code Organization

```
src/
  app/          # Next.js routing (pages, layouts, API routes, server actions)
    api/        # REST handlers grouped by resource: tutors/, students/, consultations/
    auth/       # Server actions for authentication
    login/      # Login page
    signup/     # Signup page
  supabase/     # Supabase client factories (client.ts, server.ts, proxy.ts)
  utils/        # Shared pure utilities (auth.ts, env.ts)
  generated/    # Auto-generated Prisma client — do not edit
  db.ts         # Prisma singleton export
  proxy.ts      # Next.js middleware
```

The structure is **layer-first, resource-second** (not feature folders). Business logic lives directly in route handlers. There is no separate service/repository layer, no shared `components/` folder, and no `hooks/` folder yet.

---

## Key Constraints

- Do not introduce ESLint, Prettier, or Jest — Biome is the only lint/format tool; Vitest is the test runner
- Do not use relative parent imports (`../`) — always use `@/` path alias
- Do not access `process.env` directly — use `env` from `@/utils/env`
- Do not edit files in `src/generated/` — they are auto-generated by Prisma
- Do not add `useMemo`/`useCallback` without a specific reason — the React Compiler handles memoization

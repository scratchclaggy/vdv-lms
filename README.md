# VDV LMS

## Overview

This is a mock learning management system (LMS) to serve as a basic portfolio piece. The LMS allows students to create consultations with tutors, view their upcoming consultations, and mark consultations complete/incomplete.

## Tech Stack

- Next.js 16 (App Router, React 19, React Compiler)
- PostgreSQL with Prisma v7 (pg adapter)
- Supabase Auth (@supabase/ssr)
- Tailwind CSS v4 + DaisyUI v5
- TanStack Form + Zod v4
- Biome (lint/format)
- Lefthook (git hooks)
- Vitest (unit tests) + Playwright (integration tests)

## Getting Started

1. Install dependencies `pnpm install`
2. Create a local env file `cp .env.example .env.local`
3. Start Supabase `pnpm supabase start`
4. Update `.env.local` with the keys provided by the `pnpm supabase start` command (or use `pnpm supabase status` to see them again)
5. Run database migrations `pnpm prisma migrate deploy`
6. Seed sample data `pnpm prisma db seed` — all seed accounts use the password `some password` (e.g. `david@student.com`)
7. Run the application with `pnpm run dev`

### Optional

To run integration tests you will need to populate a `.env.test.local`. It can be identical to `.env.local` but it is highly recommended that you choose a different postgres instance (e.g. `postgresql://postgres:postgres@127.0.0.1:54322/postgres_test`).

### Links

- Website: [http://localhost:3000](http://localhost:3000)
- Supabase Studio: [http://localhost:54323](http://localhost:54323)

## Data model

We are keeping this _very_ simple for demonstration purposes.

```
    ┌─────────┐          ┌──────────────┐          ┌─────────┐
    │  Tutor  │1        *│ Consultation │*        1│ Student │
    │         ├──────────┤              ├──────────┤         │
    └─────────┘          └──────────────┘          └─────────┘
```

- The schema is intentionally minimal — no subjects, no availability windows, no scheduling rules
- Students can schedule a consultation with a tutor
- Consultations belong to a student and a tutor
- Both Student.id and Tutor.id are UUIDs sourced from Supabase auth (they match the auth user's UUID)


## Considerations

- So far only student user stories are implemented. Some basic provisions for tutors exist but are predominantly out of scope.
- When students sign-up as an 'auth' user (via Supabase) they are also onboarded as a student. Future feature work could include either an admin view or API to handle tutor onboarding.
- If the DB insert fails during signup, the Supabase auth user is deleted to avoid orphaned accounts.
- The consultation only considers PENDING / COMPLETED — no CANCELLED or other status.
- Currently local only for demonstration purposes

## Security

- All API routes require a user session, enforced via a Next.js proxy and the Supabase setup recommended in their documentation
- Resource access is checked based on DB state (e.g. a student can only access their own consultations)

## API Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/sign-up` | Register a new student |
| `GET` | `/api/consultations` | List consultations for the authenticated user |
| `POST` | `/api/consultations` | Create a consultation |
| `PATCH` | `/api/consultations/:id` | Update consultation status (`PENDING` \| `COMPLETED`) |

Note that the API routes are not currently accessed via application code. They were included to allow for 'black box' integration testing via playwright, and serve as a potential feature mobile clients or other services could interact with the service. The thinking here is that the API handlers are very thin, mostly concerned with passing the payload to a server action and returning an http response based on the action's return value.


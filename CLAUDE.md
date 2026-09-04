# CLAUDE.md

This file is read automatically by Claude Code at the start of every session
in this repo. It is the entry point — the `/docs` folder referenced below
contains the full specification and should be treated as authoritative.

## Before writing any code

**First, read `docs/PROGRESS.md` in full.** It reflects the actual current
state of the project — what's built, what's half-done, what's next, and any
decisions made mid-implementation. Do this before reading anything else,
every single session, with no exceptions.

Then read whichever of these are relevant to the task you've been given:

1. `docs/01-problem-and-solution.md` — what we're building and why, design
   principles, and what's explicitly out of scope for v1.
2. `docs/02-tech-stack.md` — the exact stack, why each piece was chosen, the
   scalability approach, and the code architecture/patterns to follow.
3. `docs/03-database-schema.md` — the full Postgres/Supabase schema,
   including RLS policies. Treat this as the source of truth for table and
   column names.
4. `docs/04-features-and-user-flows.md` — every screen, its fields, and its
   states, grouped by Learner App / Guard App / Admin Dashboard.
5. `docs/05-business-rules-and-edge-cases.md` — the precise logic for
   matching, capacity/overflow handling, unregistered parcels, and the
   OTP/delegation model. When a screen's behavior is ambiguous, this file
   has the answer.
6. `docs/06-design-system.md` — the visual/UI spec: navigation structure,
   color palette, typography, component inventory, and screen-by-screen
   notes reverse-engineered from the actual mobile mockups. Read this
   before building or styling **any** screen — `01`–`05` define data and
   logic but have zero visual direction on their own. This file also logs
   known conflicts between the mockups and the business-rules doc (e.g. the
   OTP screen's timer) and states which one wins.
7. `docs/07-working-with-claude-code.md` — the session workflow this project
   is run under. Read this once to understand why `PROGRESS.md` exists and
   how prompts reach you.

If a request conflicts with one of these docs, flag the conflict and ask
whether the doc should be updated — don't silently diverge from the spec.

## End of Session — Mandatory

**Before ending any session, update `docs/PROGRESS.md`** following the
instructions written inside that file (Current State, Next Up, Known
Issues, Decisions & Deviations, and a new Session History entry). This is
not optional — `PROGRESS.md` is the only thing that survives into the next
session. A session that writes code but doesn't update `PROGRESS.md` has
left the project in a worse state than one that updates it honestly and does
less.

If the task also changed the schema or a business rule, confirm
`docs/03-database-schema.md` or `docs/05-business-rules-and-edge-cases.md`
was updated to match — the numbered docs and the actual code should never
silently drift apart.

## Project Summary

A mobile-first parcel management system for a university gate (Gate No. 2):
learners pre-register expected deliveries, a guard confirms arrivals and
assigns storage, and learners collect using a one-time code that can be
shared with a delegate. An admin dashboard gives the Founder's Office
visibility into volume, dwell time, and overdue trends. Full detail in
`docs/01-problem-and-solution.md`.

## Stack (see `docs/02-tech-stack.md` for full rationale)

- Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase: Postgres, Auth, Realtime, Edge Functions
- TanStack Query for client-side data fetching/caching
- Vercel for hosting
- No client-side polling anywhere — data updates arrive via Supabase
  Realtime (guard/admin only) or Web Push (learner)

## Code Conventions

- **TypeScript strict mode.** No `any` without a comment explaining why.
- **All Supabase queries go through `/lib/repositories`.** UI components and
  route handlers never call `supabase.from(...)` directly — see the
  Repository Pattern section in `docs/02-tech-stack.md`.
- **Business logic lives in `/lib/services`, not in route handlers or
  components.** A route handler should read like: validate input → call a
  service → return a response.
- **Enums over strings.** Match the Postgres enum types (`request_status`,
  `collection_type`, `escalation_stage`) with TypeScript enums of the same
  values — never compare against raw string literals like `"pending"`.
- **Schema changes are migrations.** Add a new file under
  `/supabase/migrations`, never hand-edit the database directly. Update
  `docs/03-database-schema.md` in the same change.
- **Formatting/linting:** Prettier + ESLint, run before every commit.
  Config files live at the repo root once scaffolded — don't hand-format.

## Folder Structure

```
/app
  /(learner)/parcels/...
  /(guard)/guard/...
  /(admin)/admin/...
/components          — shared, presentation-only UI components
/lib
  /types              — enums + interfaces mirroring the DB schema
  /repositories        — one class per table/aggregate
  /services            — OtpService, EscalationService, MatchingService, NotificationService
  /supabase            — Supabase client singletons (browser + server)
/supabase
  /migrations           — versioned SQL, source of truth for schema
  /functions             — Edge Functions (otp-verify, escalate-overdue, notify-arrival)
/docs                  — the specification files listed above (do not delete)
  PROGRESS.md            — living state, read first / updated last, every session
  06-working-with-claude-code.md  — the session workflow this project follows
```

## Local Development

```bash
# install deps
npm install

# start Supabase locally (requires Supabase CLI)
supabase start

# apply migrations to local DB
supabase db reset

# run the app
npm run dev
```

Required environment variables (`.env.local`, never commit):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, never exposed to the browser
```

## Testing

Minimum required (see `docs/02-tech-stack.md` §5): unit tests for
`OtpService`, `EscalationService`, and `MatchingService`. Run with:

```bash
npm run test
```

## Build Order (suggested)

1. Supabase schema + RLS (`docs/03-database-schema.md`) — get this right
   first, everything else depends on it.
2. Auth (college-domain-restricted Supabase Auth) + role-based routing.
3. Learner App screens A1–A3 (register, confirm, list).
4. Guard App screens B1–B2 (dashboard, mark arrived) — this is what makes A3
   meaningfully testable end-to-end.
5. OTP flow: A5 + B4.
6. Escalation cron + B5 (overdue).
7. Unregistered-parcel path: B3 + the A3 claim flow.
8. Admin dashboard (C1–C3).

## What NOT to build (v1)

See `docs/01-problem-and-solution.md` §7 — no native apps, no courier API
integrations, no payments, no multi-gate support, no QR/barcode scanning.

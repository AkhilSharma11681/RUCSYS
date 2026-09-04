# PROGRESS.md — Living Project State

> **Claude Code: read this file COMPLETELY before doing anything else, at the
> start of every single session — before `01-problem-and-solution.md`, before
> touching any code.** This file reflects the *current reality* of the
> project. The numbered docs (`01`–`06`) describe the intended design and
> rarely change; this file describes what's actually been built, what's
> half-done, and what to do next. If the two ever disagree, trust this file
> for "what exists," and the numbered docs for "how it should behave."
>
> **At the END of every session, before finishing, update this file** — see
> "How To Update This File" below. Do not end a session without doing this.
> An unupdated `PROGRESS.md` is the single biggest reason context gets lost
> between sessions — treat updating it as part of the task, not an optional
> extra.

---

## How To Update This File (do this every session, no exceptions)

1. Rewrite **Current State** so it accurately describes the project *right
   now*, after your changes. Don't append to it — overwrite it. It should
   always be readable as "here is the truth today," not a diff.
2. Rewrite **Next Up** with what should happen next, in priority order. If
   you finished everything you were asked to do, say so explicitly and
   suggest the next logical step from `04-features-and-user-flows.md`'s
   "Build Order."
3. Add to **Known Issues / Blockers** anything you couldn't finish or fix.
   Be specific enough that a session with zero memory of this one can pick it
   up (file names, error messages, what you tried).
4. Add to **Decisions & Deviations** anything you implemented differently
   than the numbered docs describe, and why. This keeps the docs and the
   code from silently drifting apart.
5. Append **one new entry** to **Session History** at the bottom. Never edit
   or delete a previous entry — it's a permanent log. Keep each entry short
   (5–8 lines): what you were asked to do, what you actually did, and where
   you stopped.
6. If you changed the database schema, confirm `docs/03-database-schema.md`
   was updated to match, and that a migration file exists under
   `/supabase/migrations`. If you changed a business rule, confirm
   `docs/05-business-rules-and-edge-cases.md` still matches reality.

---

## Current State

**Milestone:** Project scaffolded from scratch — foundation, config, types, and database migrations in place. No screens built yet.

- Repo: Next.js 14+ App Router (TypeScript strict mode, Tailwind CSS v4, shadcn/ui initialized).
- Dependencies installed: `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query`, `recharts`, `lucide-react`.
- Folder structure matches `docs/02-tech-stack.md` §3:
  - `/app/(learner)/parcels/...`, `/app/(guard)/guard/...`, `/app/(admin)/admin/...`
  - `/components` (shadcn button already scaffolded)
  - `/lib/types` — TypeScript enums matching Postgres enums (`CollectionType`, `RequestStatus`, `EscalationStage`, `Platform`)
  - `/lib/repositories` — placeholder `.gitkeep`
  - `/lib/services` — placeholder `.gitkeep`
  - `/lib/supabase` — browser client + server client singletons
  - `/supabase/migrations` — full initial schema migration with RLS
  - `/supabase/functions` — placeholder `.gitkeep`
- Database: Single migration `20240101000000_initial_schema.sql` covers all tables (`students`, `guards`, `parcel_requests`, `parcels`, `escalation_log`, `capacity_config`), enums, indexes, triggers, materialized view (`analytics_daily`), RLS policies, and seed data.
- Tailwind configured with design system colors from `docs/06-design-system.md` (`#E4572E` primary, `#FBF6F1` background).
- Docs: all 6 numbered spec files + 6 PNG mockups + CLAUDE.md + PROGRESS.md in `/docs`.
- `.env.local.example` created with required Supabase env var placeholders.

## Next Up (priority order)

1. Set up Supabase Auth (college-domain-restricted magic link) + role-based routing middleware.
2. Build Learner App screens A1–A3 (Pre-Register `/parcels/new`, Confirmation `/parcels/[id]/confirmation`, My Requests `/parcels`).
3. Build Guard App screens B1–B2 (Dashboard `/guard` with Realtime, Mark Arrived `/guard/arrivals/[requestId]`).
4. Implement OTP flow: A5 (`/parcels/[id]/collect`) + B4 (`/guard/collect`).
5. Implement overdue escalation cron and Guard overdue list B5 (`/guard/overdue`).
6. Implement unregistered-parcel quick add (B3) and learner claim flow.
7. Build Admin Dashboard screens C1–C3.

## Known Issues / Blockers

- None yet — project is freshly scaffolded.

## Decisions & Deviations from `/docs` specs

- None yet — following spec exactly.

## Environment / Setup Notes

- Local dev URL: `http://localhost:3000`
- Run `npm run dev` to start the dev server.
- Supabase env vars needed in `.env.local` (see `.env.local.example`).

---

## Session History (append-only — never edit a past entry)

### Session 1 — Project scaffold from scratch (2026-09-05)
- Asked to: Initialize the full project from scratch — Next.js 14+ App Router, all dependencies, folder structure, types, migrations, design system config, and docs.
- Did: Scaffolded Next.js with TypeScript strict mode and Tailwind CSS v4. Installed all required deps. Set up shadcn/ui. Created the full folder structure per `02-tech-stack.md`. Created TypeScript enums matching Postgres enums. Created Supabase client singletons. Wrote the complete initial schema migration with all tables, RLS, triggers, indexes, and materialized view. Configured Tailwind with design system colors. Copied all reference docs and mockups to `/docs`. Created root `CLAUDE.md`.
- Left off at: Ready for auth setup and screen building.

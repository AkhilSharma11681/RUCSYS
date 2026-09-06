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

**Milestone:** Neon Postgres + Drizzle ORM Database Migration & Auth Infrastructure.

- A3 (My Parcel Requests list, `/parcels`) is implemented-pending-manual-verification.
- A1 (Pre-Register a Parcel) and A2 (Confirmation) screens built and verified end-to-end in browser — form submission creates a real row in Neon via ParcelRequestService, confirmation page reads it back via ParcelRequestRepository.findById and displays it correctly with live capacity data from /api/capacity.
- Fixed `Platform` enum in `lib/types/index.ts` by adding missing `Zepto` and `Blinkit` values (required by docs/04).
- Generalized `CapacityCallout` component (previously hardcoded for guard use with "Shelf Capacity" label and `/guard` default href) with an optional `label` prop and no default `href`, now reused for the learner's "Store Room Capacity" indicator on A1/A2.
- Dropped Supabase entirely; migrating to Neon Postgres + `drizzle-orm`.
- Auth is fully working end-to-end: login tested and verified for both a seeded test student (`test.student@rishihood.edu.in`, role=learner, redirects to `/parcels`) and a seeded test guard (`guard@rishihood.edu.in`, role=guard, redirects to `/guard`) via the new Credentials-based NextAuth + Neon + bcrypt flow. Confirmed `middleware.ts` required no changes — it was already provider-agnostic.
- Clean schema applied to Neon via 3 migration files under `lib/db/migrations/` (`0000_enums_and_users`, `0001_parcels_and_config`, `0002_indexes_and_views`) — verified via psql, all 6 core tables present with `password_hash` columns.
- `lib/db/index.ts` created as the single `drizzle` + `neon-http` connection singleton with explicit `DATABASE_URL` check, verified with `tsc --noEmit -p tsconfig.json` (0 errors).
- Existing code structure present: `/app/login/page.tsx`, `middleware.ts`, `auth.ts`, the `(learner)`/`(guard)`/`(admin)` route group layouts, and the 12 shared UI components (`AppHeader`, `BottomTabBar`, `PageIntro`, `StatusPill`, `DetailCard`, `DetailGrid`, `CapacityCallout`, `StepExplainer`, `NumberPicker`, `OtpDigitDisplay`, `PrimaryButton`/`OutlineButton`, `PlatformIcon`) matching `docs/06-design-system.md` and the PNG mockups.
- The 12 shared UI components do NOT need any changes (they are presentation-only with zero Supabase dependencies).

## Next Up (priority order)

1. Convert OTP edge function to a Next.js API route.
2. Convert `pg_cron` escalation to a Vercel Cron Job.
3. Build Guard App screens (B1–B2) and OTP verification workflow (B4), including building dashboard data fetching via polling (not Supabase Realtime) from the start.
4. Build Admin Dashboard screens (C1–C3).
5. Build learner screens A4 (/parcels/[id] detail view) and A5 (/parcels/[id]/collect — OTP display) — currently missing; OTP API routes exist but have no learner-facing UI to call them yet.

## Known Issues / Blockers

- (None currently) — Repositories layer (`lib/repositories/*`) has been fully converted to Drizzle ORM and verified with zero Supabase dependencies.

## Decisions & Deviations from `/docs` specs

- OTP Display (`OtpDigitDisplay`) implements a static 6-digit design with NO countdown timer, overriding the mockup's timer based on the explicit `05-business-rules-and-edge-cases` and `06-design-system.md` resolution.
- Allowed domain restrictions updated: Learner emails now support both `@rishihood.edu.in` and `@nst.rishihood.edu.in` domains across client logic and database constraints.
- Switched database provider from Supabase to Neon Postgres using Drizzle ORM (`drizzle-orm/neon-http`).
- Changed Auth model from Supabase Auth/NextAuth to custom email+password authentication storing `password_hash` on user records and maintaining sessions via NextAuth Credentials provider with JWT.
- OTP length changed from 6-digit to 4-digit, and hashing changed from the doc's HMAC suggestion confirmed as final (not bcrypt) — chosen for fast guard-side verification over password-grade slowness.
- Storage location suggestion (B2): since docs specify no algorithm, implemented as 'suggest most recently used storage_location value' (guard can always override via free text) — simplest option that still reflects real shelving behavior, since no fixed shelf list is defined anywhere in the schema or docs.

## Environment / Setup Notes

- Local dev URL: `http://localhost:3000`
- Run `npm run dev` to start the dev server.
- Database connection string required in `DATABASE_URL` within `.env.local`.
- Two seed test accounts exist via `scripts/seed-test-users.ts` (password "password123" for both: `test.student@rishihood.edu.in` and `guard@rishihood.edu.in`) — safe to re-run, skips existing rows.

---

## Session History (append-only — never edit a past entry)

### Session 1 — Project scaffold from scratch (2026-09-05)
- Asked to: Initialize the full project from scratch — Next.js 14+ App Router, all dependencies, folder structure, types, migrations, design system config, and docs.
- Did: Scaffolded Next.js with TypeScript strict mode and Tailwind CSS v4. Installed all required deps. Set up shadcn/ui. Created the full folder structure per `02-tech-stack.md`. Created TypeScript enums and interfaces matching Postgres schema. Created Supabase client singletons. Wrote the complete initial schema migration with all tables, RLS, triggers, indexes, and materialized view. Configured Tailwind in `globals.css` with design system colors (`#E4572E`, etc). Copied all reference docs and mockups to `/docs`. Created root `CLAUDE.md` and `.env.local.example`. Git initialized, committed, and pushed successfully to GitHub repo.
- Left off at: Ready for auth setup and screen building.

### Session 2 — Auth and Shared Components (2026-09-05)
- Asked to: Build the Auth system and the 12 shared presentation components from docs/06-design-system.md + PNGs. Setup layouts for (learner), (guard) and (admin).
- Did: Implemented `middleware.ts` for role-gated Supabase SSR auth (`/parcels`, `/guard`, `/admin`). Built `/login` with distinct Learner and Staff tabs (domain-restricted for learners). Built OAuth callbacks. Built `(learner)`, `(guard)`, and `(admin)` group Layouts with proper persistent headers and bottom navigation. Created all 12 mobile-first shared UI components (`AppHeader`, `BottomTabBar`, `PageIntro`, `StatusPill`, `DetailCard`, `DetailGrid`, `CapacityCallout`, `StepExplainer`, `NumberPicker`, `OtpDigitDisplay`, `PrimaryButton`, `OutlineButton`, `PlatformIcon`) adhering strictly to Tailwind tokens `#FBF6F1`, `#E4572E`, `#6B6B6B`, etc. from the specs.
- Left off at: Ready to begin building Learner App screens.

### Session 3 — Neon Postgres & Drizzle ORM Migration (2026-09-05)
- Asked to: Update PROGRESS.md to document the database migration to Neon Postgres and Drizzle ORM.
- Did: Migrated database stack from Supabase to Neon Postgres + Drizzle ORM (`drizzle-orm/neon-http`). Removed NextAuth adapter tables in favor of plain email+password auth storing `password_hash` on student/guard tables. Applied 3 clean migration files under `lib/db/migrations/` (`0000_enums_and_users`, `0001_parcels_and_config`, `0002_indexes_and_views`) establishing all 6 core tables. Created `lib/db/index.ts` as the single Drizzle connection singleton with explicit `DATABASE_URL` check (verified clean with `tsc --noEmit -p tsconfig.json`).
- Left off at: Ready to convert repository layer from Supabase to Drizzle ORM.

### Session 4 — Credentials Auth Migration & Verification (2026-09-05)
- Asked to: Update PROGRESS.md to document auth implementation and end-to-end testing with Credentials provider.
- Did: Rewrote `auth.ts` off Resend/DrizzleAdapter onto NextAuth Credentials provider with bcrypt password comparison against Neon DB (`students` and `guards` tables). Updated `/app/login/page.tsx` for password input fields across Learner and Staff tabs. Verified auth end-to-end via curl and browser for both test student (`test.student@rishihood.edu.in`) and test guard (`guard@rishihood.edu.in`), confirming proper role-based redirects (`/parcels` and `/guard`). Confirmed `middleware.ts` required no changes as it was already provider-agnostic.
- Left off at: Ready to build Learner App screens A1–A3.

### Session 5 — Learner UI Screens A1 & A2 (2026-09-05)
- Asked to: Build the Pre-Register a Parcel (A1) and Confirmation (A2) screens.
- Did: Completed screens A1 (`app/(learner)/parcels/new/page.tsx`) and A2 (`app/(learner)/parcels/[id]/confirmation/page.tsx`). Added Zepto and Blinkit to Platform enum. Generalized CapacityCallout component. Created `/api/capacity` to feed live data. Verified end-to-end form posting and confirmation reading from Neon DB using Next.js server actions and repository patterns.
- Left off at: Ready to build A3 My Parcel Requests screen (`/parcels`).

### Session 6 — Learner Screens A1/A2/A3 Visual Restyling & A3 Completion (2026-09-06)
- **What was done:**
  - Built Screen A3 (My Parcel Requests list, `/parcels`) with interactive tabs (Active, Collected, Cancelled), empty states, compact history items, detail grid, and parcel cancellation Server Action (`cancelParcelRequest`).
  - Completed precision visual restyling across all three Learner App screens: A1 (Pre-Register), A2 (Confirmation), and A3 (My Parcel Requests) to match `docs/1.png`, `docs/2.png`, and `docs/3.png` design mockups.
  - Implemented pixel-perfect SVG `IllustratedBox` (supporting `open`, `sealed`, and `success` variants with refined geometry avoiding flap flare artifacts), brand-accurate vector `PlatformIcon` (Amazon, Flipkart, Myntra, Bluedart, Delhivery, Zepto, Blinkit, etc.), updated `CapacityCallout`, `StepExplainer`, custom pill tabs, status badges, and refined typography/spacing.
- **Current state:**
  - All three Learner screens (A1, A2, A3) pass TypeScript check (`npx tsc --noEmit`) and production build (`npm run build`) cleanly with zero errors.
  - Form registration, capacity indicators, confirmation flow, parcel listing, tab filtering, and cancellation have been manually verified in browser against mockups and Neon DB.
  - All changes are committed locally (not yet pushed to `origin/feature/neon-migration`).
- **Known issues:**
  - None currently open for A1/A2/A3.
- **Next up (priority order):**
  1. Convert repositories layer (`lib/repositories/*`) from Supabase to Drizzle queries against `lib/db`.
  2. Convert Realtime guard/admin dashboards to polling mechanisms.
  3. Convert OTP edge function to a Next.js API route.
  4. Convert `pg_cron` escalation to a Vercel Cron Job.
  5. Build Guard App screens (B1–B2) and OTP verification flow (B4).
  6. Build Admin Dashboard screens (C1–C3).
- **Note explicitly:**
  - Local commits on `feature/neon-migration` are AHEAD of origin by multiple commits. A `git push` is required at an appropriate checkpoint to synchronize remote branch.


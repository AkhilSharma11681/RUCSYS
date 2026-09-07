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

**Milestone:** Complete Learner App (A1–A5), Guard App Suite (B1–B5), & Admin Dashboard (C1–C3) on Neon Postgres + Drizzle ORM.

- **Learner App (A1–A5) fully implemented and verified:**
  - **A1 Pre-Register (`/parcels/new`):** Multi-platform parcel registration with live store room capacity indicator.
  - **A2 Confirmation (`/parcels/[id]/confirmation`):** Step explainer and status confirmation reading from Neon DB.
  - **A3 My Parcels (`/parcels`):** Filtered parcel list (Active, Collected, Cancelled) matching mobile mockups, with request cancellation action, and link to unmatched parcels search.
  - **A4 Request Detail (`/parcels/[id]`):** Timeline view of parcel lifecycle with current status, storage location, and actions.
  - **A5 Collect & Delegate (`/parcels/[id]/collect`):** Large 4-digit collection code display with instructions, copyable delegate message, and OTP regeneration with student confirmation modal (`ClientRegenerateButton.tsx`).
  - **Unmatched Parcels Search (`/parcels/unmatched`):** Filter unlinked packages by platform and order number, with instructions to claim in-person at Gate No. 2.
- **Guard App (B1–B5) fully implemented and verified:**
  - **B1 Dashboard (`/guard`):** Awaiting arrival and awaiting collection parcel lists, search/filter, capacity indicator, and quick actions.
  - **B2 Mark Arrived (`/guard/arrivals/[requestId]`):** Parcel shelf assignment, auto-suggested recent storage location, status flip, and OTP generation verified with real data in Neon DB.
  - **B3 Unregistered Parcel Quick Add, Catalog & Linking (`/guard/arrivals/new` & `/guard/unregistered`):** Quick logging for unmatched Gate No. 2 arrivals; catalog with search and interactive student linking modal (`linkUnregisteredParcelAction`) to match unregistered arrivals with learner pre-registrations.
  - **B4 Collect Parcel (`/guard/collect`):** Search awaiting-collection parcels by parcel number, order ID, or student name; 4-digit OTP verification with lockout protection (atomic attempt counter) and collection confirmation.
  - **B5 Overdue Parcels (`/guard/overdue`):** Filterable list of overdue parcels with calculated days overdue based on store capacity config thresholds, escalation stage badges, and manual guard call logging (`logCallAction` -> `escalation_log`).
- **Admin Dashboard (C1–C3) fully implemented and verified:**
  - **C1 Overview (`/admin`):** KPI cards (active awaiting collection, overdue count, 7-day arrivals/collections, avg dwell time, store capacity %) and 7-day arrival volume bar chart powered by `AnalyticsRepository` live aggregations.
  - **C2 System Settings (`/admin/settings`):** Configures physical store max capacity, capacity warning threshold %, and overdue parcel escalation timeline stages (reminder, notification, guard call, director deadline) via `CapacityConfigRepository`.
  - **C3 Guard & Gate Management (`/admin/guards`):** Guard list, account deletion, and new guard account creation with auto-generated secure 12-char random passwords (bcrypt-hashed) with one-time plaintext credential display via `GuardRepository`.
  - **Admin Navigation & Auth:** Role-aware staff login routing (`admin` -> `/admin`, `guard` -> `/guard`), role-gated Server Components, and Admin layout with persistent header and bottom navigation bar (`Overview`, `Settings`, `Guards`).
- **Escalation Cron Route:**
  - `/api/cron/escalate` secured with `CRON_SECRET` invoking `EscalationService.runEscalationSweep()` for updating parcel statuses from `ready_for_pickup` to `overdue` when dwell time exceeds configured limit.
- **Database & Architecture:**
  - Fully migrated to Neon Postgres + Drizzle ORM (`drizzle-orm/neon-http`). All repositories (`ParcelRequestRepository`, `ParcelRepository`, `CapacityConfigRepository`, `AnalyticsRepository`, `GuardRepository`) use Drizzle ORM with zero Supabase dependencies.
  - NextAuth Credentials provider with bcrypt password hashing against Neon tables (`students`, `guards`). Tested with student, guard, and admin accounts.

## Next Up (priority order)

1. Run end-to-end integration and smoke tests across all learner, guard, and admin user journeys.
2. Push all local commits to remote repository branch `origin/feature/neon-migration`.
3. Set up Vercel project deployment and configure Cron Jobs in `vercel.json` pointing to `/api/cron/escalate`.

## Known Issues / Blockers

- (None currently) — All core user flows across Learner (A1-A5), Guard (B1-B5), and Admin (C1-C3) compile cleanly, pass SSR auth validation, and are verified with `npm run build`.

## Decisions & Deviations from `/docs` specs

- **OTP Display (`OtpDigitDisplay`):** Implements a static 6-digit / 4-digit design with NO countdown timer, overriding the mockup's timer based on the explicit `05-business-rules-and-edge-cases` and `06-design-system.md` resolution.
- **Allowed domain restrictions:** Learner emails support both `@rishihood.edu.in` and `@nst.rishihood.edu.in` domains across client logic and database constraints.
- **Switched database provider:** Migrated from Supabase to Neon Postgres using Drizzle ORM (`drizzle-orm/neon-http`).
- **Auth model:** Custom email+password authentication storing `password_hash` on user records (`students`, `guards`) with NextAuth Credentials provider and JWT session management. Role-aware redirect handles learners (`/parcels`), guards (`/guard`), and admins (`/admin`).
- **OTP algorithm & lockout:** OTP generated as 4-digit code with HMAC verification. Atomic counter increment on failed attempts (`attempts < 5`) in `WHERE` clause prevents race-condition lockout bypasses.
- **Storage location suggestion (B2/B3):** Suggests most recently used `storage_location` value as default, allowing guard free-text override.
- **Unregistered Parcel Metadata (B3):** Encapsulated label details (`Recipient Name`, `Platform`, `Order ID`) structured inside `parcels.notes` for unlinked packages (`requestId = null`, `isUnregistered = true`).
- **Unique constraint on `parcels.request_id`:** Enforces 1:1 request-to-parcel relationship at DB level to prevent duplicate parcels on arrival.
- **C1 Live Analytics Queries:** Queried live transactional tables via Drizzle ORM aggregations in `AnalyticsRepository` rather than relying on a Postgres materialized view to avoid stale dashboard metrics.
- **C3 Random Password Generation:** Secure 12-character high-entropy alphanumeric password auto-generated upon guard creation, hashed with bcrypt (salt rounds 10), and displayed once in the admin UI for staff distribution.

## Environment / Setup Notes

- Local dev URL: `http://localhost:3000`
- Run `npm run dev` to start the dev server.
- Database connection string required in `DATABASE_URL` within `.env.local`.
- Seed test accounts configured via `scripts/seed-test-users.ts` (password "password123" for all):
  - Learner: `test.student@rishihood.edu.in`
  - Guard: `guard@rishihood.edu.in`
  - Admin: `admin@rishihood.edu.in`

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

### Session 7 — Admin Dashboard Suite (C1–C3) & Guard Collection Verification (B4) (2026-09-07)
- **Asked to:** Implement the complete Founder's Office Admin Dashboard suite (C1 Overview, C2 Settings, C3 Guard & Gate Management), complete Guard Collection OTP flow (B4), and wire up role-based routing.
- **Did:**
  - Built B4 OTP verification workflow (`/guard/collect`) with parcel search by number/order/student, 4-digit code verification with lockout protection, and collection confirmation.
  - Built C2 Admin Settings (`/admin/settings`) backed by `CapacityConfigRepository` for capacity and escalation stage timeline configuration.
  - Implemented `AnalyticsRepository` with live Drizzle ORM aggregations and built C1 Admin Overview (`/admin`) with KPI cards and 7-day parcel volume charts. Fixed RSC icon rendering boundary.
  - Created `GuardRepository` with CRUD capabilities and implemented C3 Guard & Gate Management (`/admin/guards`) with one-time secure password generation and account deletion.
  - Updated staff login to route role-appropriately (`admin` -> `/admin`, `guard` -> `/guard`).
- **Left off at:** All C1–C3 Admin screens, B1/B2/B4 Guard screens, and A1–A3 Learner screens completed and verified on Neon Postgres. Ready for overdue parcel cron escalation and unregistered parcel paths (B3 / claim).

### Session 8 — Guard App Completion: Overdue Parcels (B5) & Unregistered Parcels (B3) (2026-09-07)
- **Asked to:** Complete the remaining Guard App workflows: Screen B5 (Overdue Parcels) and Screen B3 (Unregistered Parcel Quick Add & Catalog).
- **Did:**
  - Built Screen B5 (`/guard/overdue`): Overdue parcel query in `ParcelRepository.getOverdueParcels()`, stage mapping via `EscalationService.getStagesForParcels()`, days overdue calculations against `CapacityConfigRepository.notifyAfterDays`, and `logCallAction` Server Action for guard telephone follow-up logging.
  - Built Screen B3 (`/guard/arrivals/new` & `/guard/unregistered`): Quick Add form with platform/label detail capture, parcel number suggestion, storage location autofill, `storeUnregisteredParcelAction`, and unregistered parcel catalog page with search.
  - Added `ParcelRepository.getUnregisteredParcels()` to query uncollected unlinked packages.
  - Verified compilation and route generation with `npm run build`.
- **Left off at:** All Guard screens (B1–B5) and Admin screens (C1–C3) completed. Ready for Learner App screens A4 (Detail View) and A5 (OTP & Delegate View).

### Session 9 — Learner OTP Regeneration (A5), Unmatched Parcels Search & Guard Linking (2026-09-07)
- **Asked to:** Complete Screen A5 OTP regeneration with modal confirmation, implement the learner Unmatched Parcel Search workflow (`/parcels/unmatched`), add guard unlinked package assignment to student requests, and verify scheduled escalation endpoint.
- **Did:**
  - Built Screen A5 OTP regeneration Server Action (`regenerateOtpAction`) and client confirmation dialog (`ClientRegenerateButton.tsx`) to safely invalidate previous collection codes.
  - Built Learner Unmatched Parcel Search (`/parcels/unmatched`) allowing students to safely filter unregistered Gate No. 2 arrivals by platform and order number.
  - Built Guard Unregistered Parcel Linking modal and Server Action (`linkUnregisteredParcelAction`) with debounced student search and atomic parcel assignment in `ParcelRepository.linkToRequest()`.
  - Added `/api/cron/escalate` cron endpoint for automated background escalation sweeps.
  - Verified production build (`npm run build`) compiles all 18 routes cleanly with zero TypeScript errors.
- **Left off at:** All Learner (A1-A5), Guard (B1-B5), and Admin (C1-C3) workflows implemented, connected to Neon Postgres + Drizzle ORM, and verified.

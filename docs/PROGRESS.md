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

**Milestone:** Auth infrastructure and 12 Shared UI Components built.

- Auth implemented with Supabase SSR: Middleware enforces role-based route gating across `/parcels` (learner), `/guard` (guard), and `/admin` (admin).
- `/app/login/page.tsx` built as mobile-first UI with tabs for Learner Magic Link (restricted to `@rishihood.edu.in`) and Staff login. OAuth callback and signout routes implemented.
- Route group Layouts implemented for `(learner)`, `(guard)`, and `(admin)`, utilizing `AppHeader` and `BottomTabBar` components where appropriate.
- 12 Presentation-only Shared Components built inside `/components`: `AppHeader`, `BottomTabBar`, `PageIntro`, `StatusPill`, `DetailCard`, `DetailGrid`, `CapacityCallout`, `StepExplainer`, `NumberPicker`, `OtpDigitDisplay`, `PrimaryButton`/`OutlineButton`, `PlatformIcon`. All components strictly match the 6 PNG mockups and `docs/06-design-system.md` visual specifications (Tailwind v4 with specific token colors `#FBF6F1`, `#E4572E`).

## Next Up (priority order)

1. Build Learner App screens A1–A3 (Pre-Register `/parcels/register`, Confirmation `/parcels/[id]/confirmation`, My Requests `/parcels`).
2. Build Guard App screens B1–B2 (Dashboard `/guard` with Realtime, Mark Arrived `/guard/arrivals/[requestId]`).
3. Implement OTP flow: A5 (`/parcels/[id]/collect`) + B4 (`/guard/collect`).
4. Implement overdue escalation cron and Guard overdue list B5 (`/guard/overdue`).
5. Implement unregistered-parcel quick add (B3) and learner claim flow.
6. Build Admin Dashboard screens C1–C3.

## Known Issues / Blockers

- None.

## Decisions & Deviations from `/docs` specs

- OTP Display (`OtpDigitDisplay`) implements a static 6-digit design with NO countdown timer, overriding the mockup's timer based on the explicit `05-business-rules-and-edge-cases` and `06-design-system.md` resolution.

## Environment / Setup Notes

- Local dev URL: `http://localhost:3000`
- Run `npm run dev` to start the dev server.
- Supabase env vars needed in `.env.local` (see `.env.local.example`).

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

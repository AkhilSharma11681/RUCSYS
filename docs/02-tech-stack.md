# Tech Stack & Architecture — Smart Delivery Management System

> Read `01-problem-and-solution.md` first. This doc defines *how* we build it:
> stack choices, why each one was picked, how the system stays fast and cheap
> even if every learner opens the app in the same 10-minute window, and the
> code-level architecture (layers, patterns, folder structure) to follow.

## 1. Guiding Principles

1. **Serverless-first.** No servers to provision, patch, or scale manually.
   Everything should scale to zero when idle and scale up automatically under
   load.
2. **Push, don't poll.** The single biggest risk to "does it fall over when
   everyone opens the app at once" is client polling. Design every screen to be
   notified of changes, not to ask "did anything change?" on a timer.
3. **Let the database do database things.** Row Level Security, constraints,
   and triggers live in Postgres — not re-implemented as application logic that
   can drift out of sync.
4. **Type safety end-to-end.** One shared set of TypeScript types generated
   from the database schema, used by both the frontend and any server code.
5. **Boring technology, well-configured, beats clever technology.** Every
   choice below is a widely-used, well-documented default — the scalability
   comes from *how it's configured and used*, not from exotic infrastructure.

## 2. The Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 14+ (App Router), TypeScript** | Server components reduce client JS; API routes double as a lightweight backend when needed; deploys natively to Vercel's edge network. |
| Styling / UI | **Tailwind CSS + shadcn/ui** | Fast to build consistent, accessible components; no runtime CSS-in-JS cost. |
| State / data fetching | **TanStack Query (React Query)** | Automatic request de-duplication and caching — if 50 students load the dashboard in the same second, identical in-flight requests are shared, not repeated. |
| Database | **Supabase (managed Postgres)** | Real relational data (parcels, requests, students) with actual foreign keys and constraints — not a NoSQL fit. Supabase gives Postgres + Auth + Realtime + Storage + Edge Functions in one managed product. |
| Auth | **Supabase Auth**, restricted to the college email domain (magic link or OTP-over-email) | No custom password/auth code to secure; a learner's identity is just "their verified college email." |
| Realtime updates | **Supabase Realtime** (Postgres change subscriptions), used **only** on the guard dashboard and admin dashboard | These are the few screens genuinely needing live updates; a handful of guard/admin sessions subscribing is cheap. Learner screens use push notifications instead (see below) — they must never poll. |
| Push notifications | **Web Push (via a service worker) triggered by a Postgres trigger → Supabase Edge Function** | "Your parcel has arrived" is sent the moment a DB row changes — the learner's phone is notified without their app needing to ask. |
| Serverless business logic | **Supabase Edge Functions (Deno)** | OTP generation/verification, overdue-escalation cron job, notification dispatch. Keeps sensitive logic (e.g., OTP checks) off the client and off RLS-only enforcement. |
| Scheduled jobs | **Supabase `pg_cron`** | Runs the daily overdue-escalation sweep and capacity-threshold check directly in the database — no separate worker service to run. |
| Hosting (frontend) | **Vercel** | Auto-scaling edge network; a traffic spike from one hostel block opening the app doesn't require any manual scaling action. |
| Analytics/admin charts | **Recharts** on a Next.js server component that reads a Postgres materialized view (see `03-database-schema.md`) | Pre-aggregated data means the admin dashboard never runs an expensive `GROUP BY` over the entire parcels table on every page load. |

### Why this specifically won't fall over under a load spike
- **No polling anywhere in the learner app.** The most common cause of an
  app "melting" under load is thousands of clients hitting an endpoint every
  few seconds. This design has zero recurring learner-side requests — data
  loads once per screen visit and updates arrive via push.
- **Connection pooling is handled for you.** Supabase's pooled connection
  string (PgBouncer, transaction mode) must be used for all serverless/Edge
  Function DB access, so a burst of short-lived function invocations doesn't
  exhaust Postgres's connection limit.
- **Read-heavy screens are cached.** Store Room Capacity, the admin KPI cards,
  and the daily volume chart are all read far more often than they change —
  cache these with TanStack Query's `staleTime` (client) and consider a
  materialized view refreshed on a schedule (server) rather than computing
  them live on every request.
- **Indexes on every lookup path.** See `03-database-schema.md` — every column
  the app searches or filters by (`order_last4`, `student_id`, `status`,
  `parcel_number`) is indexed so a search doesn't become a full table scan as
  data grows.
- **Rate limiting on sensitive Edge Functions.** OTP verification in
  particular should reject after a small number of failed attempts per
  parcel (see `05-business-rules-and-edge-cases.md`) — this protects
  correctness under abuse, not just performance under legitimate load.

## 3. Code Architecture (apply real OOP / design-pattern discipline)

Even though Next.js encourages "just write a function in a route file," this
project should keep a clean, testable layering so logic isn't duplicated
across screens:

```
/app                      → routes & UI only (Next.js App Router pages)
/components                → shared, dumb UI components (no data fetching)
/lib
  /types                  → TypeScript interfaces & enums, generated from the DB schema
  /repositories           → one class per table/aggregate, ALL Supabase queries live here
  /services                → business logic that uses repositories (OTP, escalation, matching)
  /notifications            → NotificationService + channel-specific senders
  /supabase                → Supabase client singleton(s) (browser client, server client)
/supabase
  /migrations              → versioned SQL migration files (source of truth for schema)
  /functions                → Edge Functions (otp-verify, escalate-overdue, notify-arrival)
```

### Patterns to use deliberately

- **Repository Pattern.** e.g. `ParcelRepository`, `RequestRepository`,
  `StudentRepository` — every Supabase query goes through one of these
  classes. UI code never calls `supabase.from(...)` directly. This is what
  makes it possible to change the database later without rewriting every
  screen.
- **Singleton.** The Supabase client (browser and server variants) is
  instantiated once and imported everywhere — never re-created per component.
- **Service Layer.** `OtpService`, `EscalationService`, `MatchingService`
  contain the actual business rules from `05-business-rules-and-edge-cases.md`.
  Repositories only fetch/persist data; services decide what to *do* with it.
- **Factory Pattern.** `NotificationService.for(channel)` returns the right
  sender (push / email) behind one interface, so adding SMS later doesn't
  touch calling code.
- **Strategy Pattern.** Overdue escalation stages (reminder → notify → call →
  deadline) are modeled as an ordered list of `EscalationStrategy` objects, so
  the admin can reconfigure timing/order without a code change (see
  `capacity_config` / `escalation_config` in the schema).
- **DTOs / enums over magic strings.** Parcel status, collection type, and
  escalation stage are TypeScript enums matching Postgres `enum` types
  one-to-one — never compare raw strings like `"pending"` scattered across
  the codebase.

## 4. Environment & Secrets

- `.env.local` (never committed) holds `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and a server-only
  `SUPABASE_SERVICE_ROLE_KEY` used exclusively inside Edge Functions/server
  code — never shipped to the browser.
- All privileged operations (assigning parcel numbers, generating/verifying
  OTPs, running the escalation sweep) happen server-side (Edge Functions or
  Next.js server actions) using the service role key, protected further by
  Row Level Security as a second layer of defense — not the only layer.

## 5. Minimum Testing Expectations

Not full coverage, but these are mandatory given they encode the business
rules most likely to cause real-world harm if wrong:

- Unit tests for `OtpService` (generation, verification, regeneration
  invalidates the old code, rate-limit lockout).
- Unit tests for `EscalationService` (correct stage given days-since-arrival).
- Unit tests for `MatchingService` (registered match, no match →
  unregistered path, ambiguous match → surfaced to guard rather than
  auto-resolved).

## 6. Deployment Checklist

- [ ] Supabase project created; migrations in `/supabase/migrations` applied.
- [ ] RLS enabled and policy-tested for all three roles (learner, guard,
      admin) before going live — a missing policy should fail closed, not open.
- [ ] Pooled connection string used for all server-side DB access.
- [ ] `pg_cron` job scheduled for the overdue-escalation sweep.
- [ ] Web Push service worker registered and tested on a real device.
- [ ] Vercel project connected to the same repo, environment variables set.

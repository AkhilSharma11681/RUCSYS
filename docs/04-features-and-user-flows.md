# Features & User Flows

> Read `01-problem-and-solution.md`, `02-tech-stack.md`, and
> `03-database-schema.md` first. This doc describes every screen to build, its
> exact fields, and its states. Build screens in the order listed — later
> screens depend on data created by earlier ones.

There are three surfaces in this system:

1. **Learner App** (`/app/(learner)/...`)
2. **Guard App** (`/app/(guard)/...`)
3. **Admin Dashboard** (`/app/(admin)/...`)

All three are part of the same Next.js project, gated by role-based routing
(check the authenticated user's role from Supabase Auth custom claims before
rendering any route group).

---

## A. Learner App

### A1. Pre-Register a Parcel
**Route:** `/parcels/new`
**Table written:** `parcel_requests`

Fields:
- Expected Delivery Date — date picker, cannot be in the past.
- Platform — select: Amazon, Flipkart, Myntra, Zepto, Meesho, Blinkit, Other.
- Last 4 Digits of Order ID — text input, exactly 4 digits, validated client
  and server side (`order_last4 ~ '^[0-9]{4}$'`).
- Collection Type — two-option toggle: **Can be stored** / **Immediate
  collection**. Show a one-line explanation under each option.
- A live **Store Room Capacity** indicator (e.g. "82/100 stored") fetched
  once on page load — **not polled**.

Submit behavior:
- If `capacity_config.pause_new_requests_at_pct` threshold is met **and**
  `collection_type = 'can_be_stored'`, block submission with a clear message
  ("Storage is nearly full — please select Immediate Collection or try again
  later") — see `05-business-rules-and-edge-cases.md`. Immediate-collection
  requests are never blocked by capacity.
- On success, insert into `parcel_requests` with `status = 'pending'` and
  route to A2.

### A2. Confirmation Screen
**Route:** `/parcels/[id]/confirmation`

Shows a read-only summary of what was just submitted (date, platform, order
ID last 4, collection type), the current storage capacity, and a 3-step
"What happens next" explainer (Parcel Arrives → You'll Get Notified →
Collect with a One-Time Code). Primary action: "View My Requests" → A3.

### A3. My Parcel Requests
**Route:** `/parcels`
**Table read:** `parcel_requests` (own rows only, via RLS)

Tabbed view: **Active**, **Collected**, **Cancelled** — counts shown in each
tab label. Each request card shows platform, order ID last 4, status badge,
and expected/arrived date as relevant. Tapping a request opens A4 or A5
depending on status.

- `Active` = status in (`pending`, `arrived`, `ready_for_pickup`, `overdue`)
- `Collected` = status = `collected`
- `Cancelled` = status = `cancelled`

A learner should be able to cancel a `pending` request from here (sets
`status = 'cancelled'`) — needed so stale registrations don't clutter the
guard's pending-arrivals list.

### A4. Request Detail (Pending / Arrived)
**Route:** `/parcels/[id]`

Read-only detail view while status is `pending` or `arrived` — shows the same
fields as A2 plus a status timeline. If status is `arrived` but not yet
`ready_for_pickup` (i.e., still being processed by the guard), say so plainly.

### A5. Ready for Pickup — One-Time Code
**Route:** `/parcels/[id]/collect`
**Shown when:** `parcel_requests.status = 'ready_for_pickup'`

Displays:
- Parcel summary (platform, order ID last 4, assigned parcel number, storage
  location, arrival date/time).
- The **6-digit one-time code**, large and legible. This code was generated
  once when the parcel arrived (server-side, via `OtpService`) — it does
  **not** auto-refresh every 60 seconds. Fetch it once; do not poll.
- A **"Regenerate Code"** button — calls the OTP Edge Function to invalidate
  the old code and issue a new one (use if the learner shared the old code by
  mistake or suspects it leaked). Confirm before regenerating, since it
  invalidates the current code immediately, even for a proxy en route to
  collect.
- A persistent reminder: **"Rishihood will never ask for your OTP."**
- A short "How to collect" 3-step explainer (Go to Gate No. 2 → Show the code
  → Get your parcel).
- Explicitly state that the code **can be shared** with someone else
  collecting on the learner's behalf — this is a supported flow, not a
  workaround.

### A6. Notifications
Push notification (via the service worker) fires when:
- A request moves to `arrived` ("Your parcel from {platform} has arrived and
  is being processed").
- A request moves to `ready_for_pickup` ("Your parcel is ready — collect it
  at Gate No. 2").
- An overdue escalation stage fires for one of their parcels (reminder /
  notification stages only — the "call" stage is a human action, not a push).

---

## B. Guard App

### B1. Dashboard
**Route:** `/guard`
**Data:** live via Supabase Realtime subscription on `parcels` and
`parcel_requests` (this is one of the few screens allowed to subscribe to
live changes — see `02-tech-stack.md`).

Shows:
- Store Room Capacity meter (current / max).
- Four stat tiles: **Pending Arrivals**, **Stored**, **Ready for Pickup**,
  **Overdue** — each tappable, filtering the list below.
- Searchable **Pending Arrivals** list (search by name, order ID, or
  platform — debounced, server-side `ilike` query using the indexes from
  `03-database-schema.md`). Each row has a **Mark Arrived** button.
- Immediate-collection requests are visually distinguished (different badge
  color) from can-be-stored ones.
- **Parcels Ready for Pickup** and **Overdue Parcels** summary sections with
  a "View All" link.

### B2. Mark Parcel Arrived
**Route:** `/guard/arrivals/[requestId]`
**Table written:** `parcels`

Flow:
1. Guard taps a pending request (or arrives here via search/scan-less
   manual match).
2. Confirms learner details (name, order ID last 4, platform) shown
   read-only from the matched `parcel_requests` row.
3. **Assign Parcel Number** — a horizontal picker of the next available
   numbers (query: smallest integers not currently in
   `uniq_active_parcel_number`). Guard picks one and physically writes it on
   the box.
4. **Storage Location** — defaults to a suggested shelf/row, editable via
   "Change Location."
5. Optional **Notes** field (free text, capped length).
6. **Confirm & Store Parcel** — inserts into `parcels`, which (via trigger)
   flips the linked `parcel_requests.status` to `ready_for_pickup` and fires
   the arrival push notification. This also generates the OTP server-side at
   this exact moment (see A5).
7. If capacity is within a configurable margin of full, show a persistent
   "Store Room Almost Full" banner with a link to B4 (Overdue Parcels) so the
   guard can chase up old parcels first.

### B3. Unregistered Parcel — Quick Add
**Route:** `/guard/arrivals/new` (accessible from B1 even without a matching
pending request)

For a parcel that arrives with no matching `parcel_requests` row (see
`05-business-rules-and-edge-cases.md`, rule 3). Fields:
- Recipient name (free text, best guess from the shipping label).
- Platform (same select as A1).
- Order ID (as much as visible on the label).
- Same Assign Parcel Number / Storage Location / Notes fields as B2.

Submits a `parcels` row with `request_id = null`, `is_unregistered = true`.
This parcel **does not** get an OTP or a "ready for pickup" push (there's no
learner record to notify yet). It appears in a dedicated
**"Unmatched Parcels"** list that:
- The guard can manually resolve later by linking it to a
  `parcel_requests` row if the learner registers after the fact.
- The learner can find and claim from A3 ("Don't see your parcel? Search
  unmatched parcels") by entering matching details, which triggers a
  guard/admin confirmation step before the link is made (never an
  automatic, unverified claim).

### B4. Collect Parcel — Verify Code
**Route:** `/guard/collect`

A single search box (by parcel number, order ID last 4, or learner name) that
surfaces the matching parcel, then a code-entry field. Submits to the
`otp-verify` Edge Function (never a direct table check — see
`03-database-schema.md` Security Notes). On success:
- `parcels.collected_at` is set (trigger flips `parcel_requests.status` to
  `collected` and frees the parcel number).
- Optional one-line note field: who physically collected it (e.g., "self" /
  "roommate"), stored in `collected_by_note` — for the guard's own
  record-keeping, not for verification.

On failure (wrong code): increment `otp_attempts`; after the configured
threshold, lock further attempts on that parcel and surface a "Contact
support / regenerate from the learner's app" message instead of a generic
error.

### B5. Overdue Parcels
**Route:** `/guard/overdue`

List of parcels past `notify_after_days` (per `capacity_config`), each
showing days overdue and the current escalation stage from `escalation_log`.
Guard can trigger the manual "call" stage from here (marks it logged, doesn't
place the call automatically) once they've actually called the learner.

---

## C. Admin Dashboard

### C1. Overview
**Route:** `/admin`
**Data:** `analytics_daily` materialized view + `capacity_config`.

- Four KPI cards: Parcels This Month, Avg. Dwell Time, Overdue Rate, Peak
  Platform — each with a period-over-period delta.
- Daily/weekly parcel volume bar chart (Recharts, reading from
  `analytics_daily` — never a live aggregate query over raw `parcels`).
- Unregistered-parcel count as its own small metric (a proxy for how often
  the "learner forgot to register" path is being hit — worth watching).

### C2. Configuration
**Route:** `/admin/settings`

Editable form backed by `capacity_config`: max capacity, pause threshold
percentage, and the four escalation day-thresholds (reminder / notify / call
/ deadline). Changes take effect on the next cron run — no deploy needed.

### C3. Guard & Gate Management (minimal, v1)
**Route:** `/admin/guards`

Simple CRUD list of `guards` rows — add/remove guard accounts. Not a
priority screen; build last if time is short.

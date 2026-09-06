# Business Rules & Edge Cases

> Read the four docs before this one. This is the precise, implementable
> version of the rules referenced throughout — the actual logic that belongs
> inside `OtpService`, `EscalationService`, and `MatchingService` (see
> `02-tech-stack.md` for where these live).

## 1. Matching — Manual, Not QR/Barcode

**Decision:** QR/barcode scanning of real Amazon and Flipkart shipping labels
was tested directly and found unreliable (inconsistent codes, poor camera
readability). Do not build a scanning feature for v1. Instead, make manual
matching fast:

- The guard's search (B1/B2) queries `parcel_requests` with
  `status = 'pending'` filtered by `ilike` on learner name (joined from
  `students`), `order_last4`, or `platform` — all three fields are indexed
  (`03-database-schema.md`).
- Sort results by `expected_date` ascending, so the most likely match (a
  parcel expected today) surfaces first.
- If more than one request matches ambiguously (e.g., two learners with the
  same order-ID last 4 digits on the same platform on the same day), surface
  **both** to the guard for a manual pick — never auto-resolve an ambiguous
  match.

## 2. Storage Capacity & Overflow

**State:** `capacity_config` holds `max_capacity`,
`pause_new_requests_at_pct`, and the four escalation day-thresholds.

**Rule — pausing new requests:**
- When `current_stored_count / max_capacity >= pause_new_requests_at_pct`,
  new `parcel_requests` with `collection_type = 'can_be_stored'` are
  **rejected at submission (A1)** with a clear message.
- `collection_type = 'immediate'` requests are **never** blocked by capacity
  — they are not meant to sit in storage.

**Rule — staged escalation (runs as a daily `pg_cron` job):**
For every `parcels` row where `collected_at is null` and `is_unregistered =
false`, compute `days_since_arrival`:

| Day threshold | Stage | Action |
|---|---|---|
| `>= reminder_after_days` (default 3) | `reminder` | Push notification to the learner: "Your parcel is still waiting for pickup." |
| `>= notify_after_days` (default 5) | `notification` | Stronger in-app + email notification; flagged `overdue` on `parcel_requests.status`. |
| `>= call_after_days` (default 7) | `call` | Surfaced to the guard's Overdue list (B5) as needing a phone call — this is a **human action**, logged only after the guard confirms they called. |
| `>= deadline_after_days` (default 10) | `deadline_passed` | Escalated to hostel warden / admin for manual resolution. |

- Each stage is written once to `escalation_log` (don't re-fire a stage
  that's already logged for that parcel).
- **A parcel is never discarded or "dumped" automatically.** The system's job
  ends at "escalated for human resolution" — any physical disposal decision
  is a manual, out-of-system action taken by campus staff, never triggered by
  this application.

## 3. Unregistered / Walk-In Parcels

**Rule:** The guard is never instructed to refuse a parcel from a delivery
partner. Refusing risks the courier leaving it unattended anyway, which is a
worse outcome than logging it without a match.

- Use the B3 "Quick Add" flow to create a `parcels` row with
  `request_id = null`, `is_unregistered = true`.
- These parcels get a parcel number and storage location like any other, but
  **no OTP is generated yet** (there's no verified learner to protect against
  wrong-person collection until it's claimed).
- **Claiming flow:** a learner who doesn't see their parcel in "My Requests"
  can search unmatched parcels (by platform + rough order ID) from A3. A
  match candidate is shown to a guard/admin for confirmation before the
  system links `parcels.request_id` to a newly created (or existing)
  `parcel_requests` row and generates the OTP — this link is never made
  automatically from the learner's search alone, to avoid one learner
  claiming another's parcel by guessing details.
- Unregistered parcels older than `notify_after_days` with no claim should
  surface on the admin dashboard as their own metric (`analytics_daily.
  unregistered_count`) so the Founder's Office can see how often this path is
  used and investigate if it's high.

## 4. Delegated Collection via One-Time Code

**Rule:** The one-time code is a **bearer credential for the parcel**, not an
identity check on the person presenting it. This is a deliberate trade-off,
equivalent to a locker pickup code — accepted because:
- It solves real delegation needs (roommate/friend collection) without a
  separate "add a delegate" feature to build and maintain.
- The guard still performs a check (matching the code to the specific
  assigned parcel number), which prevents random/blind collection attempts.

**Lifecycle:**
1. Generated once, server-side, the moment `parcels` is inserted (B2) — via
   `OtpService.generate(parcelId)`. Stored as a hash (see
   `03-database-schema.md` Security Notes), never plaintext.
2. Valid until the parcel is collected — it does **not** expire on a timer
   and does **not** rotate every 60 seconds. (If the UI mockup shows a
   countdown, that reflects an earlier draft — the implemented behavior is
   "static until used or regenerated.")
3. **Regeneration** (learner-initiated, from A5): invalidates the previous
   code immediately and issues a new one. Reset `otp_attempts` to 0 on
   regeneration.
4. **Verification** (guard-initiated, from B4, via an Edge Function using the
   service role key — never a direct client-side table read):
   - Hash the submitted code, compare to `parcels.otp_code`.
   - On match: set `collected_at = now()`, done.
   - On mismatch: increment `otp_attempts`. After **5** consecutive failed
     attempts, lock further verification on that parcel (return a distinct
     "locked — ask the learner to regenerate their code" response) rather
     than allowing unlimited guesses against a 4-digit space.

## 5. State Machine Reference

`parcel_requests.status` values and valid transitions:

```
pending ──────► arrived ──────► ready_for_pickup ──────► collected
   │                                                          ▲
   └──────► cancelled                                          │
                                                                 │
overdue  ◄── (set alongside ready_for_pickup once notify_after_days passes) ─┘
```

- `pending → cancelled`: learner-initiated only, and only while still
  `pending` (once a parcel has arrived, cancellation must go through the
  guard/admin, not a self-service button).
- `pending → arrived`: set automatically when a matching `parcels` row is
  inserted (B2).
- `arrived → ready_for_pickup`: same trigger, immediately — there isn't a
  meaningful gap between "arrived" and "ready" in this design; both fire from
  the same guard action. (Kept as separate states for clarity/reporting.)
- `ready_for_pickup → overdue`: set by the escalation cron job, not by the
  learner or guard.
- `* → collected`: only via successful OTP verification (B4).

## 6. Validation Rules Quick Reference

| Field | Rule |
|---|---|
| `order_last4` | Exactly 4 digits, numeric only. |
| `expected_date` | Not in the past at submission time. |
| `parcel_number` | Must be unique among currently-uncollected parcels (enforced by the partial unique index — see schema). |
| `otp_code` | 4 digits, hashed at rest, max 5 verification attempts before lockout. |
| `platform` | One of the fixed set (Amazon, Flipkart, Myntra, Zepto, Meesho, Blinkit, Other) — validate against an enum/lookup, not free text, to keep analytics clean. |

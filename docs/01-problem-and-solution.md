# Problem & Solution — Smart Delivery Management System

> Read this file first. It defines *why* this project exists and *what* it must do.
> Every other doc in this folder (`02-tech-stack.md`, `03-database-schema.md`,
> `04-features-and-user-flows.md`, `05-business-rules-and-edge-cases.md`) exists to
> implement what's described here. If a feature request ever conflicts with this
> document, this document wins — come back and update it first.

## 1. The Problem (as given)

> Receiving deliveries currently creates a logistical hassle for both learners and
> the campus teams. Learners spend time coordinating, waiting and collecting
> packages, while Gate No. 2 has to manage a large volume of deliveries.
>
> Challenge: Design and build a seamless delivery experience for the learner, while
> making the backend process simpler and more reliable for security and operations.

### Constraints (non-negotiable)
1. A **security guard remains present** at Gate No. 2 — the system assists the
   guard, it does not replace the checkpoint.
2. There is a **delivery/storage room with limited capacity** — the system must
   never let it silently overflow.
3. Some deliveries **must be collected immediately** rather than stored
   (perishables, urgent items).

### Who is affected
| Actor | Pain today |
|---|---|
| **Learner** | No visibility into arrivals, repeated trips to the gate "just to check," long waits while the guard searches, no record of past/pending deliveries. |
| **Gate No. 2 Guard** | Manual register, physical searching through piles of parcels, no early warning before the storage room is full, no reliable way to confirm the right person is collecting the right parcel. |
| **Founder's Office / Operations** | Zero visibility into delivery volume, dwell time, or how well the process is working — everything lives in a paper register. |

## 2. Redefined Solution (one-liner)

> Replace the manual register and parcel-searching with a simple mobile system
> that tracks every parcel from **arrival → storage → secure collection** — for
> every learner, every guard shift, and with visibility for the institution.

This is **not** a courier-integration product and it does **not** try to replace
the guard. It is a **shared source of truth** that three parties read from and
write to:

- **Learner** registers what they expect and collects with a one-time code.
- **Guard** confirms what physically arrives, assigns it a slot, and verifies
  collection.
- **Admin / Founder's Office** sees aggregate trends without asking anyone for a
  status update.

## 3. Design Principles

These principles should guide every implementation decision. When in doubt,
build the option that best satisfies these:

1. **Nothing is ever silently lost.** A parcel that arrives without a matching
   registration is still logged, not turned away. See
   `05-business-rules-and-edge-cases.md`.
2. **The guard is never blocked by technology.** If a scan, a network call, or a
   lookup fails, the guard must have a manual fallback that takes seconds, not
   minutes.
3. **Capacity is a first-class signal, not an afterthought.** The system should
   surface "we're about to run out of room" *before* it becomes a crisis, and
   degrade gracefully (pause new stored requests) rather than fail unpredictably.
4. **Verification doesn't require the owner's physical presence.** A learner
   should be able to authorize a roommate or friend to collect for them without
   a separate "delegate a pickup" feature — the one-time code itself is the
   authorization.
5. **Build for burst load, not average load.** Everyone in a hostel block can
   open the app in the same 10-minute window after a "your parcel has arrived"
   notification goes out. The system must not fall over when that happens. See
   `02-tech-stack.md`.
6. **Every screen the guard uses must be usable one-handed, in under 10 seconds,
   possibly outdoors in bright light.** Favor big touch targets, minimal typing,
   and search-as-you-type over multi-step forms.

## 4. Actors

- **Learner** — a student who orders parcels to campus.
- **Gate Guard** — campus security staff stationed at Gate No. 2, using a
  guard-facing view of the same system.
- **Admin (Founder's Office / Operations)** — read-mostly access to aggregate
  analytics and configuration (capacity thresholds, escalation timing).
- **Delivery Partner** — not a user of the system; an external actor whose
  behavior (arriving unannounced, leaving parcels regardless of registration
  status) the system must tolerate.

## 5. High-Level User Journey

```
Learner registers parcel (date, platform, last 4 of order ID, collection type)
        │
        ▼
Guard dashboard shows it under "Pending Arrivals"
        │
        ▼
Parcel physically arrives → Guard matches & assigns a Parcel Number + location
        │                          │
        │                          └─ if unmatched → logged as "Unregistered", resolved later
        ▼
Learner is notified — parcel is "Ready for Pickup"
        │
        ▼
One-time code is generated (valid until used; learner may share it or regenerate it)
        │
        ▼
Learner or their proxy shows the code at Gate No. 2 → Guard verifies → hands over
        │
        ▼
Parcel Number is freed for reuse; event is logged for analytics
```

Storage capacity, overdue escalation, and unregistered-parcel handling run as
background rules alongside this main flow — see
`05-business-rules-and-edge-cases.md` for the exact logic.

## 6. Success Metrics (v1 pilot)

- Fewer learner trips to the gate per collected parcel (target: ~1, down from
  multiple "just checking" visits).
- Faster average hand-over time at the gate.
- Overdue rate (parcels sitting past the collection deadline) below a defined
  threshold, down from the current unmeasured baseline.
- Zero parcels handed to the wrong person during the pilot.
- Admin dashboard actively used by the Founder's Office to make at least one
  operational decision (e.g., staffing, room resizing) during the pilot.

## 7. Explicitly Out of Scope for v1

Keep the first build small and correct. Do **not** build these unless a later
version of this doc says otherwise:

- Native iOS/Android apps — a mobile-responsive web app (PWA) is sufficient.
- Direct courier/carrier API integrations (e.g., pulling real tracking data from
  Amazon/Flipkart) — the learner self-reports expected delivery info.
- Payments or any billing feature.
- Multi-campus / multi-gate support — design the schema so it *could* extend,
  but v1 targets a single gate (Gate No. 2).
- QR/barcode scanning of shipping labels — already tested and found unreliable
  in practice; manual search-based matching is the intended v1 approach.

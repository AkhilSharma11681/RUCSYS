# Database Schema — Supabase (Postgres)

> Read `01-problem-and-solution.md` and `02-tech-stack.md` first. This is the
> source of truth for the schema. Actual schema changes should be written as
> versioned files in `/supabase/migrations`, not applied ad hoc — this doc
> should stay in sync with the latest migration.

## 1. Entity Overview

```
students ──< parcel_requests ──< parcels >── escalation_log
guards                                │
                                       └── capacity_config (singleton)
```

- A **student** can have many **parcel_requests**.
- A **parcel_request** becomes exactly one **parcel** once it physically
  arrives (1:1, but modeled as separate tables because a parcel can also
  exist *without* a prior request — the unregistered-arrival path).
- **escalation_log** tracks the overdue-notification history for a parcel.
- **capacity_config** is a single-row settings table (max capacity, thresholds,
  escalation timing) editable from the admin dashboard.

## 2. Tables

### `students`
```sql
create table students (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null unique check (email like '%@rishihood.edu.in' or email like '%@nst.rishihood.edu.in'), -- restricted to college domains, enforced in Auth + check constraint
  phone         text,
  hostel_room   text,
  created_at    timestamptz not null default now()
);
```

### `guards`
```sql
create table guards (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null unique,
  gate_number   text not null default 'Gate No. 2',
  created_at    timestamptz not null default now()
);
```

### `parcel_requests`
The learner's pre-registration. Status moves forward as the parcel
progresses; see `05-business-rules-and-edge-cases.md` for the exact state
machine.

```sql
create type collection_type as enum ('can_be_stored', 'immediate');
create type request_status as enum
  ('pending', 'arrived', 'ready_for_pickup', 'collected', 'cancelled', 'overdue');

create table parcel_requests (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references students(id) on delete cascade,
  platform            text not null,          -- 'amazon' | 'flipkart' | 'myntra' | 'zepto' | 'meesho' | 'blinkit' | 'other'
  order_last4         text not null check (order_last4 ~ '^[0-9]{4}$'),
  expected_date       date not null,
  collection_type     collection_type not null default 'can_be_stored',
  status              request_status not null default 'pending',
  created_at          timestamptz not null default now()
);

create index idx_requests_student on parcel_requests(student_id);
create index idx_requests_status on parcel_requests(status);
create index idx_requests_order_last4 on parcel_requests(order_last4);
create index idx_requests_expected_date on parcel_requests(expected_date);
```

### `parcels`
Created the moment something physically arrives at the gate — whether or not
it matches a `parcel_requests` row (see the unregistered-arrival rule).

```sql
create table parcels (
  id                  uuid primary key default gen_random_uuid(),
  request_id          uuid references parcel_requests(id) on delete set null, -- nullable: unregistered arrivals
  guard_id            uuid not null references guards(id),
  parcel_number       int not null,           -- the physical number written on the box; reused after collection
  storage_location    text,                   -- e.g. "Store Room · Shelf B · Row 2"
  is_unregistered     boolean not null default false,
  arrived_at          timestamptz not null default now(),
  notes               text,

  otp_code            text,                   -- hashed, not plaintext — see Security Notes
  otp_generated_at    timestamptz,
  otp_attempts         int not null default 0,

  collected_at        timestamptz,
  collected_by_note   text,                   -- optional free-text, e.g. "collected by roommate"

  created_at          timestamptz not null default now()
);

-- A parcel_number must be unique only among currently-uncollected parcels,
-- so it can be reused once freed:
create unique index uniq_active_parcel_number
  on parcels(parcel_number)
  where collected_at is null;

create index idx_parcels_request on parcels(request_id);
create index idx_parcels_arrived_at on parcels(arrived_at);
create index idx_parcels_collected_at on parcels(collected_at);
```

### `escalation_log`
One row per escalation stage triggered for an overdue parcel.

```sql
create type escalation_stage as enum
  ('reminder', 'notification', 'call', 'deadline_passed');

create table escalation_log (
  id            uuid primary key default gen_random_uuid(),
  parcel_id     uuid not null references parcels(id) on delete cascade,
  stage         escalation_stage not null,
  triggered_at  timestamptz not null default now()
);

create index idx_escalation_parcel on escalation_log(parcel_id);
```

### `capacity_config`
Single-row table (`id = 1` always) holding tunable operational settings, so
the admin dashboard can change these without a code deploy.

```sql
create table capacity_config (
  id                          int primary key default 1 check (id = 1),
  max_capacity                int not null default 100,
  pause_new_requests_at_pct   int not null default 90,  -- pause new "can_be_stored" requests at this % full
  reminder_after_days         int not null default 3,
  notify_after_days           int not null default 5,
  call_after_days             int not null default 7,
  deadline_after_days         int not null default 10,
  updated_at                  timestamptz not null default now()
);

insert into capacity_config (id) values (1);
```

### `analytics_daily` (materialized view, not a table)
Pre-aggregated so the admin dashboard never scans the full `parcels` table.

```sql
create materialized view analytics_daily as
select
  date_trunc('day', arrived_at)::date as day,
  count(*) as parcels_arrived,
  count(*) filter (where collected_at is not null) as parcels_collected,
  avg(extract(epoch from (collected_at - arrived_at)) / 86400.0)
    filter (where collected_at is not null) as avg_dwell_days,
  count(*) filter (where is_unregistered) as unregistered_count
from parcels
group by 1;

-- Refresh on a schedule via pg_cron, e.g. every hour:
-- select cron.schedule('refresh-analytics', '0 * * * *',
--   $$refresh materialized view concurrently analytics_daily$$);
```

## 3. Row Level Security (RLS)

RLS must be **enabled on every table**. Default posture: deny, then grant
narrowly.

```sql
alter table students enable row level security;
alter table parcel_requests enable row level security;
alter table parcels enable row level security;
alter table escalation_log enable row level security;
alter table capacity_config enable row level security;
```

Representative policies (exact role-mapping depends on how Supabase Auth
custom claims/roles are configured — adapt `auth.uid()` checks accordingly):

```sql
-- Learners can only see and create their own requests
create policy "students read own requests"
  on parcel_requests for select
  using (student_id = auth.uid());

create policy "students insert own requests"
  on parcel_requests for insert
  with check (student_id = auth.uid());

-- Guards (role = 'guard') can read/update all requests and parcels
create policy "guards full read on requests"
  on parcel_requests for select
  using (auth.jwt() ->> 'role' = 'guard' or auth.jwt() ->> 'role' = 'admin');

create policy "guards manage parcels"
  on parcels for all
  using (auth.jwt() ->> 'role' = 'guard' or auth.jwt() ->> 'role' = 'admin');

-- Learners can read parcels tied to their own request (to see OTP status),
-- but never the otp_code column directly — expose OTP only via an Edge
-- Function that checks ownership server-side, never a raw table select.
create policy "students read own parcel status"
  on parcels for select
  using (
    request_id in (select id from parcel_requests where student_id = auth.uid())
  );

-- Admin-only config table
create policy "admin manage capacity config"
  on capacity_config for all
  using (auth.jwt() ->> 'role' = 'admin');
```

## 4. Security Notes on OTP Storage

- **Never store the OTP in plaintext.** Store a hash (e.g., HMAC with a
  server-side secret) in `otp_code`. Verification happens inside an Edge
  Function that hashes the guard-submitted code and compares — the raw code
  is never queryable from the client, even by the owning student.
- `otp_attempts` should increment on every failed verification and lock out
  further attempts past a small threshold (see
  `05-business-rules-and-edge-cases.md`), reset only when the code is
  regenerated.

## 5. Triggers Worth Adding

- **Auto-set `status = 'ready_for_pickup'`** on `parcel_requests` when a
  linked `parcels` row is inserted with `is_unregistered = false`.
- **Auto-set `status = 'collected'`** on `parcel_requests` when
  `parcels.collected_at` is set.
- **Fire a `pg_notify`** (or call an Edge Function via `pg_net`) on parcel
  insert/collect so push notifications are sent from a database event, not
  from application code that might be skipped.

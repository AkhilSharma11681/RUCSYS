-- 0001_parcels_and_config.sql

create table parcel_requests (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references students(id) on delete cascade,
  platform            text not null,
  order_last4         text not null check (order_last4 ~ '^[0-9]{4}$'),
  expected_date       date not null,
  collection_type     collection_type not null default 'can_be_stored',
  status              request_status not null default 'pending',
  created_at          timestamptz not null default now()
);

create table parcels (
  id                  uuid primary key default gen_random_uuid(),
  request_id          uuid references parcel_requests(id) on delete set null,
  guard_id            uuid not null references guards(id),
  parcel_number       int not null,
  storage_location    text,
  is_unregistered     boolean not null default false,
  arrived_at          timestamptz not null default now(),
  notes               text,

  otp_code            text,
  otp_generated_at    timestamptz,
  otp_attempts         int not null default 0,

  collected_at        timestamptz,
  collected_by_note   text,

  created_at          timestamptz not null default now()
);

create table escalation_log (
  id            uuid primary key default gen_random_uuid(),
  parcel_id     uuid not null references parcels(id) on delete cascade,
  stage         escalation_stage not null,
  triggered_at  timestamptz not null default now()
);

create table capacity_config (
  id                          int primary key default 1 check (id = 1),
  max_capacity                int not null default 100,
  pause_new_requests_at_pct   int not null default 90,
  reminder_after_days         int not null default 3,
  notify_after_days           int not null default 5,
  call_after_days             int not null default 7,
  deadline_after_days         int not null default 10,
  updated_at                  timestamptz not null default now()
);

insert into capacity_config (id) values (1) on conflict (id) do nothing;

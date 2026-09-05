-- Initial Schema Migration for RUCSYS
-- Source of truth: docs/03-database-schema.md

-- 1. Create Enums
create type collection_type as enum ('can_be_stored', 'immediate');
create type request_status as enum ('pending', 'arrived', 'ready_for_pickup', 'collected', 'cancelled', 'overdue');
create type escalation_stage as enum ('reminder', 'notification', 'call', 'deadline_passed');

-- 2. Create Tables
create table students (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null unique check (email like '%@rishihood.edu.in' or email like '%@nst.rishihood.edu.in'),
  phone         text,
  hostel_room   text,
  created_at    timestamptz not null default now()
);

create table guards (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null unique,
  gate_number   text not null default 'Gate No. 2',
  created_at    timestamptz not null default now()
);

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

-- Seed initial single-row capacity config
insert into capacity_config (id) values (1) on conflict (id) do nothing;

-- 3. Create Indexes
create index idx_requests_student on parcel_requests(student_id);
create index idx_requests_status on parcel_requests(status);
create index idx_requests_order_last4 on parcel_requests(order_last4);
create index idx_requests_expected_date on parcel_requests(expected_date);

create unique index uniq_active_parcel_number on parcels(parcel_number) where collected_at is null;
create index idx_parcels_request on parcels(request_id);
create index idx_parcels_arrived_at on parcels(arrived_at);
create index idx_parcels_collected_at on parcels(collected_at);

create index idx_escalation_parcel on escalation_log(parcel_id);

-- 4. Materialized View for Analytics
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

-- 5. Row Level Security (RLS)
alter table students enable row level security;
alter table guards enable row level security;
alter table parcel_requests enable row level security;
alter table parcels enable row level security;
alter table escalation_log enable row level security;
alter table capacity_config enable row level security;

-- Policies for students
create policy "students read own profile"
  on students for select
  using (id = auth.uid());

create policy "students update own profile"
  on students for update
  using (id = auth.uid());

-- Policies for parcel_requests
create policy "students read own requests"
  on parcel_requests for select
  using (student_id = auth.uid());

create policy "students insert own requests"
  on parcel_requests for insert
  with check (student_id = auth.uid());

create policy "guards full read on requests"
  on parcel_requests for select
  using (auth.jwt() ->> 'role' = 'guard' or auth.jwt() ->> 'role' = 'admin');

create policy "guards update request status"
  on parcel_requests for update
  using (auth.jwt() ->> 'role' = 'guard' or auth.jwt() ->> 'role' = 'admin');

-- Policies for parcels
create policy "guards manage parcels"
  on parcels for all
  using (auth.jwt() ->> 'role' = 'guard' or auth.jwt() ->> 'role' = 'admin');

create policy "students read own parcel status"
  on parcels for select
  using (
    request_id in (select id from parcel_requests where student_id = auth.uid())
  );

-- Policies for escalation_log
create policy "guards manage escalation_log"
  on escalation_log for all
  using (auth.jwt() ->> 'role' = 'guard' or auth.jwt() ->> 'role' = 'admin');

-- Policies for capacity_config
create policy "anyone read capacity config"
  on capacity_config for select
  using (true);

create policy "admin manage capacity config"
  on capacity_config for all
  using (auth.jwt() ->> 'role' = 'admin');

-- 6. Triggers for Automatic Request Status Management
create or replace function handle_parcel_arrived()
returns trigger as $$
begin
  if NEW.request_id is not null then
    update parcel_requests
    set status = 'ready_for_pickup'
    where id = NEW.request_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_parcel_arrived
  after insert on parcels
  for each row
  execute function handle_parcel_arrived();

create or replace function handle_parcel_collected()
returns trigger as $$
begin
  if NEW.collected_at is not null and OLD.collected_at is null then
    if NEW.request_id is not null then
      update parcel_requests
      set status = 'collected'
      where id = NEW.request_id;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_parcel_collected
  after update on parcels
  for each row
  execute function handle_parcel_collected();

-- 0000_enums_and_users.sql
-- 1. Create Enums
create type collection_type as enum ('can_be_stored', 'immediate');
create type request_status as enum ('pending', 'arrived', 'ready_for_pickup', 'collected', 'cancelled', 'overdue');
create type escalation_stage as enum ('reminder', 'notification', 'call', 'deadline_passed');

-- 2. Create Core Identity Tables
create table students (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null unique check (email like '%@rishihood.edu.in' or email like '%@nst.rishihood.edu.in'),
  password_hash text not null,
  phone         text,
  hostel_room   text,
  created_at    timestamptz not null default now()
);

create table guards (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null unique,
  password_hash text not null,
  gate_number   text not null default 'Gate No. 2',
  created_at    timestamptz not null default now()
);

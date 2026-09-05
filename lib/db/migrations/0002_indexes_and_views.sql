-- 0002_indexes_and_views.sql

-- Indexes
create index idx_requests_student on parcel_requests(student_id);
create index idx_requests_status on parcel_requests(status);
create index idx_requests_order_last4 on parcel_requests(order_last4);
create index idx_requests_expected_date on parcel_requests(expected_date);

create unique index uniq_active_parcel_number on parcels(parcel_number) where collected_at is null;
create index idx_parcels_request on parcels(request_id);
create index idx_parcels_arrived_at on parcels(arrived_at);
create index idx_parcels_collected_at on parcels(collected_at);

create index idx_escalation_parcel on escalation_log(parcel_id);

-- Materialized View
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

-- Triggers for status management
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
$$ language plpgsql;

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
$$ language plpgsql;

create trigger on_parcel_collected
  after update on parcels
  for each row
  execute function handle_parcel_collected();

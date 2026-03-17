-- Customers table
create table customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text not null,
  address text not null,
  city text not null,
  state text default 'TX',
  zip text not null,
  lat double precision,
  lng double precision,
  service_cost numeric(8,2) not null,
  service_frequency text check (service_frequency in ('weekly', 'biweekly', 'monthly')),
  service_notes text,
  is_active boolean default true,
  stripe_customer_id text,
  stripe_payment_method_id text,
  payment_setup_token text unique,
  payment_setup_expires_at timestamptz,
  payment_confirmed_at timestamptz,
  updated_at timestamptz default now()
);

create index on customers (lat, lng);
create index on customers (is_active);

-- Jobs table
create table jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_id uuid references customers(id) on delete cascade,
  scheduled_date date not null,
  scheduled_order integer,
  status text default 'scheduled' check (status in (
    'scheduled', 'completed', 'billed', 'cancelled', 'rescheduled'
  )),
  amount_charged numeric(8,2),
  stripe_payment_intent_id text,
  billed_at timestamptz,
  completed_at timestamptz,
  completion_photo_url text,
  completion_notes text,
  cancelled_reason text,
  rescheduled_to date,
  is_recurring boolean default false,
  recurrence_source_id uuid references jobs(id)
);

create index on jobs (customer_id);
create index on jobs (scheduled_date);
create index on jobs (status);

-- Communications table
create table communications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_id uuid references customers(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  type text check (type in ('sms', 'email', 'payment_link')),
  direction text check (direction in ('outbound')),
  content text,
  status text check (status in ('sent', 'failed')),
  provider_message_id text
);

-- Photo gallery view
create view job_photos as
  select
    j.id as job_id,
    j.scheduled_date,
    j.completion_photo_url,
    j.completion_notes,
    c.id as customer_id,
    c.first_name || ' ' || c.last_name as customer_name,
    c.address
  from jobs j
  join customers c on c.id = j.customer_id
  where j.completion_photo_url is not null
  order by j.completed_at desc;

-- Row Level Security
alter table customers enable row level security;
alter table jobs enable row level security;
alter table communications enable row level security;

create policy "owners_full_access" on customers
  for all using (auth.role() = 'authenticated');

create policy "owners_full_access" on jobs
  for all using (auth.role() = 'authenticated');

create policy "owners_full_access" on communications
  for all using (auth.role() = 'authenticated');

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger customers_updated_at
  before update on customers
  for each row execute function update_updated_at();

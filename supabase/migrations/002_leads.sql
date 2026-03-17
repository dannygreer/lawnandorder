-- Leads table (potential customers from contact form or manual entry)
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Contact info
  first_name text not null,
  last_name text not null,
  email text,
  phone text,

  -- Property
  address text,
  city text,
  state text default 'TX',
  zip text,
  lot_size text check (lot_size in ('small', 'medium', 'large')),

  -- Lead management
  source text default 'website' check (source in ('website', 'manual', 'referral')),
  status text default 'new' check (status in ('new', 'contacted', 'estimate_scheduled', 'estimate_done', 'converted', 'lost')),
  notes text,
  estimated_cost numeric(8,2),

  -- Conversion
  converted_customer_id uuid references customers(id),
  converted_at timestamptz
);

create index on leads (status);
create index on leads (created_at);

-- RLS
alter table leads enable row level security;

create policy "owners_full_access" on leads
  for all using (auth.role() = 'authenticated');

-- Public insert for contact form (anon can insert but not read)
create policy "public_insert" on leads
  for insert with check (true);

-- Updated_at trigger
create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

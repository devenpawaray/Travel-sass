-- 2.1 TENANTS
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  settings_json jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- 2.2 USERS
create table users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  email text unique,
  role text check (role in ('admin','consultant','secretary','accountant')),
  created_at timestamp with time zone default now()
);

-- 2.3 PARTNERS
create table partners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  name text,
  risk_level text default 'medium',
  config_json jsonb default '{}'
);

-- 2.4 RAW IMPORTS
create table raw_imports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  source_type text,
  raw_payload jsonb,
  parsed_json jsonb,
  confidence_score float,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- 2.5 INVENTORY MASTER
create table inventory_master (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  partner_id uuid references partners(id),
  service_type text,
  base_price numeric,
  currency text,
  status text default 'draft',
  version int default 1,
  created_at timestamp with time zone default now()
);

-- 2.6 QUOTES
create table quotes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  inventory_id uuid references inventory_master(id),
  price numeric,
  profit_margin numeric,
  status text default 'created',
  created_at timestamp with time zone default now()
);

-- 2.7 BOOKINGS
create table bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  quote_id uuid references quotes(id),
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- 2.8 EVENTS (CRITICAL CORE)
create table events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  event_type text,
  payload jsonb,
  created_at timestamp with time zone default now()
);

-- 2.9 AUDIT LOGS
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  entity_type text,
  entity_id uuid,
  snapshot jsonb,
  created_at timestamp with time zone default now()
);

-- 2.10 APPROVAL QUEUE
create table approvals_queue (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  raw_import_id uuid references raw_imports(id),
  status text default 'pending',
  reviewer_id uuid,
  notes text
);

-- 2.11 SYSTEM CONFIG
create table system_config (
  tenant_id uuid primary key references tenants(id),
  commission_rules jsonb,
  alert_rules jsonb,
  timing_rules jsonb,
  risk_rules jsonb
);

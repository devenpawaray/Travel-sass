-- 1. DROP EVERYTHING
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. TENANTS
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT now()
);

-- 3. USERS
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  tenant_id UUID REFERENCES tenants(id),
  role TEXT CHECK (role IN ('admin','secretary','consultant','accountant')),
  created_at TIMESTAMP DEFAULT now()
);

-- 4. EVENTS
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT now()
);

-- 5. STATE STORE
CREATE TABLE system_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  service_id UUID,
  state TEXT NOT NULL,
  version INT DEFAULT 1,
  data JSONB,
  updated_at TIMESTAMP DEFAULT now()
);

-- 6. QUOTES
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  customer_name TEXT,
  package_id UUID,
  status TEXT,
  total_price NUMERIC,
  margin NUMERIC,
  snapshot JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- 7. BOOKINGS
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  quote_id UUID REFERENCES quotes(id),
  state TEXT,
  financial_snapshot JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- 8. APPROVAL QUEUE
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  source_type TEXT,
  raw_data JSONB,
  ai_data JSONB,
  confidence NUMERIC,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

-- 9. AUDIT LOG
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  before JSONB,
  after JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- 10. ALERTS
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  severity TEXT,
  type TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- 11. SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Note: In a real app, policies would use (tenant_id = (select tenant_id from users where id = auth.uid()))
-- For MVP, we'll keep it simple or use service_role for system actions.

-- Restore permissions for service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

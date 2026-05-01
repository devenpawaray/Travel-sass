-- 1. SAAS BILLING LAYER
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. PERFORMANCE INDEXES (CRITICAL FOR SaaS SCALE)
CREATE INDEX idx_events_tenant_type ON events(tenant_id, type);
CREATE INDEX idx_system_state_tenant_service ON system_state(tenant_id, service_id);
CREATE INDEX idx_quotes_tenant_status ON quotes(tenant_id, status);
CREATE INDEX idx_bookings_tenant_state ON bookings(tenant_id, state);
CREATE INDEX idx_approvals_tenant_status ON approvals(tenant_id, status);
CREATE INDEX idx_alerts_tenant_read ON alerts(tenant_id, read);

-- 3. ENABLE RLS ON SUBSCRIPTIONS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. GRANT PERMISSIONS
GRANT ALL ON TABLE subscriptions TO service_role;
GRANT ALL ON TABLE subscriptions TO authenticated;

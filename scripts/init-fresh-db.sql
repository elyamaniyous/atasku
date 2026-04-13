-- ============================================================
-- Atasku: Fresh Database Initialization
-- Run this in the SQL Editor of your NEW Supabase project
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANT & BILLING
-- ============================================================

CREATE TABLE organizations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  industry     TEXT DEFAULT 'POWER_PLANT',
  country      TEXT DEFAULT 'MA',
  timezone     TEXT DEFAULT 'Africa/Casablanca',
  locale       TEXT DEFAULT 'fr',
  logo_url     TEXT,

  -- Stripe / billing
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan                   TEXT DEFAULT 'FREE',
  plan_status            TEXT DEFAULT 'active',
  max_users              INT DEFAULT 3,
  max_equipment          INT DEFAULT 10,
  max_storage_mb         INT DEFAULT 500,

  onboarding_completed BOOLEAN DEFAULT false,
  trial_ends_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE org_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'TECHNICIAN',
  name        TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  invited_by  UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'TECHNICIAN',
  token      TEXT UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usage_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric            TEXT NOT NULL,
  value             INT NOT NULL,
  period_start      TIMESTAMPTZ NOT NULL,
  period_end        TIMESTAMPTZ NOT NULL,
  reported_to_stripe BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- EQUIPMENT & ASSETS
-- ============================================================

CREATE TABLE constructors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  models     TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE equipment (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code                  TEXT NOT NULL,
  designation           TEXT NOT NULL,
  brand                 TEXT,
  model                 TEXT,
  serial_number         TEXT,
  location              TEXT,
  site                  TEXT,
  workshop              TEXT,
  type                  TEXT NOT NULL DEFAULT 'NON_CAPOTE',
  group_name            TEXT NOT NULL DEFAULT 'ELECTROGEN',
  criticality           TEXT NOT NULL DEFAULT 'STANDARD',
  status                TEXT NOT NULL DEFAULT 'OPERATIONAL',
  commission_date       TIMESTAMPTZ,
  hours_counter         FLOAT NOT NULL DEFAULT 0,
  preventive_freq       TEXT,
  last_revision         TIMESTAMPTZ,
  next_revision         TIMESTAMPTZ,
  total_main_cost       FLOAT NOT NULL DEFAULT 0,
  rated_power_kw        FLOAT,
  fuel_type             TEXT,
  fuel_consumption_rate FLOAT,
  constructor_id        UUID REFERENCES constructors(id),
  qr_code               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

CREATE TABLE spare_parts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  reference    TEXT,
  equivalent1  TEXT,
  equivalent2  TEXT,
  quantity     INT NOT NULL DEFAULT 0,
  unit_cost    FLOAT DEFAULT 0,
  min_stock    INT DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONTRACTS
-- ============================================================

CREATE TABLE contracts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_name      TEXT NOT NULL,
  client_address   TEXT,
  type             TEXT NOT NULL,
  maintenance_type TEXT,
  sla_hours        INT NOT NULL DEFAULT 4,
  frequency        TEXT,
  start_date       TIMESTAMPTZ NOT NULL,
  end_date         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WORK ORDERS & INTERVENTIONS
-- ============================================================

CREATE TABLE work_orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code               TEXT NOT NULL,
  type               TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'NEW',
  priority           TEXT NOT NULL DEFAULT 'NORMAL',
  description        TEXT NOT NULL,
  cause              TEXT,
  estimated_duration FLOAT,
  actual_duration    FLOAT,
  parts_cost         FLOAT NOT NULL DEFAULT 0,
  labor_cost         FLOAT NOT NULL DEFAULT 0,
  cancel_reason      TEXT,
  sla_deadline       TIMESTAMPTZ,
  sla_breached_at    TIMESTAMPTZ,
  equipment_id       UUID NOT NULL REFERENCES equipment(id),
  technician_id      UUID REFERENCES auth.users(id),
  created_by_id      UUID NOT NULL REFERENCES auth.users(id),
  contract_id        UUID REFERENCES contracts(id),
  started_at         TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

CREATE TABLE ot_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  from_status   TEXT,
  to_status     TEXT NOT NULL,
  comment       TEXT,
  changed_by    UUID REFERENCES auth.users(id),
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE interventions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  equipment_id  UUID NOT NULL REFERENCES equipment(id),
  technician_id UUID NOT NULL REFERENCES auth.users(id),
  actions       TEXT NOT NULL,
  root_cause    TEXT,
  duration      FLOAT NOT NULL,
  parts_cost    FLOAT NOT NULL DEFAULT 0,
  labor_cost    FLOAT NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE part_usages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  reference       TEXT,
  quantity        INT NOT NULL,
  unit_cost       FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  url           TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ALERTS & NOTIFICATIONS
-- ============================================================

CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  message         TEXT NOT NULL,
  channels        TEXT[] DEFAULT '{push}',
  status          TEXT NOT NULL DEFAULT 'SENT',
  equipment_id    UUID REFERENCES equipment(id),
  recipient_id    UUID REFERENCES auth.users(id),
  whatsapp_msg_id TEXT,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at         TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ
);

-- ============================================================
-- ENERGY-SECTOR SPECIFIC
-- ============================================================

CREATE TABLE fuel_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id  UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  liters        FLOAT NOT NULL,
  cost          FLOAT NOT NULL DEFAULT 0,
  hours_at_fill FLOAT,
  recorded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meter_readings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  value        FLOAT NOT NULL,
  read_at      TIMESTAMPTZ NOT NULL,
  read_by      UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AI FEATURES
-- ============================================================

CREATE TABLE ai_predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id    UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  confidence      FLOAT NOT NULL,
  predicted_date  TIMESTAMPTZ,
  details         JSONB NOT NULL,
  model_version   TEXT NOT NULL,
  acknowledged    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_insights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  equipment_ids UUID[] DEFAULT '{}',
  severity      TEXT DEFAULT 'INFO',
  model_version TEXT NOT NULL,
  dismissed     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_equipment_org ON equipment(org_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_work_orders_org ON work_orders(org_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_equipment ON work_orders(equipment_id);
CREATE INDEX idx_ot_history_wo ON ot_status_history(work_order_id);
CREATE INDEX idx_interventions_wo ON interventions(work_order_id);
CREATE INDEX idx_interventions_equip ON interventions(equipment_id);
CREATE INDEX idx_alerts_org ON alerts(org_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_fuel_logs_equip ON fuel_logs(equipment_id);
CREATE INDEX idx_meter_readings_equip ON meter_readings(equipment_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);

-- ============================================================
-- RLS HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM org_members
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM org_members
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ORGANIZATIONS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON organizations FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "org_insert" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (id = get_user_org_id() AND get_user_role() = 'OWNER');
CREATE POLICY "org_delete" ON organizations FOR DELETE USING (id = get_user_org_id() AND get_user_role() = 'OWNER');

-- ORG_MEMBERS
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_select" ON org_members FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "org_members_insert" ON org_members FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "org_members_update" ON org_members FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "org_members_delete" ON org_members FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- INVITATIONS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invitations_select" ON invitations FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "invitations_insert" ON invitations FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "invitations_update" ON invitations FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "invitations_delete" ON invitations FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- USAGE_RECORDS
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_records_select" ON usage_records FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "usage_records_insert" ON usage_records FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "usage_records_update" ON usage_records FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "usage_records_delete" ON usage_records FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- AUDIT_LOGS (insert-only, no update/delete)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- CONSTRUCTORS
ALTER TABLE constructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "constructors_select" ON constructors FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "constructors_insert" ON constructors FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "constructors_update" ON constructors FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "constructors_delete" ON constructors FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- EQUIPMENT
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_select" ON equipment FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "equipment_insert" ON equipment FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "equipment_update" ON equipment FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "equipment_delete" ON equipment FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- SPARE_PARTS
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spare_parts_select" ON spare_parts FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "spare_parts_insert" ON spare_parts FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "spare_parts_update" ON spare_parts FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "spare_parts_delete" ON spare_parts FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- CONTRACTS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts_select" ON contracts FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "contracts_insert" ON contracts FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "contracts_update" ON contracts FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "contracts_delete" ON contracts FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- WORK_ORDERS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_orders_select" ON work_orders FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "work_orders_insert" ON work_orders FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER'));
CREATE POLICY "work_orders_update" ON work_orders FOR UPDATE USING (org_id = get_user_org_id() AND (get_user_role() IN ('OWNER', 'ADMIN') OR (get_user_role() = 'TECHNICIAN' AND technician_id = auth.uid()) OR get_user_role() = 'SITE_MANAGER'));
CREATE POLICY "work_orders_delete" ON work_orders FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- OT_STATUS_HISTORY
ALTER TABLE ot_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ot_status_history_select" ON ot_status_history FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "ot_status_history_insert" ON ot_status_history FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER'));
CREATE POLICY "ot_status_history_update" ON ot_status_history FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "ot_status_history_delete" ON ot_status_history FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- INTERVENTIONS
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interventions_select" ON interventions FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "interventions_insert" ON interventions FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER'));
CREATE POLICY "interventions_update" ON interventions FOR UPDATE USING (org_id = get_user_org_id() AND (get_user_role() IN ('OWNER', 'ADMIN') OR (get_user_role() = 'TECHNICIAN' AND technician_id = auth.uid())));
CREATE POLICY "interventions_delete" ON interventions FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- PART_USAGES
ALTER TABLE part_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "part_usages_select" ON part_usages FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "part_usages_insert" ON part_usages FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER'));
CREATE POLICY "part_usages_update" ON part_usages FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "part_usages_delete" ON part_usages FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- ATTACHMENTS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachments_select" ON attachments FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "attachments_insert" ON attachments FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER'));
CREATE POLICY "attachments_update" ON attachments FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "attachments_delete" ON attachments FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- ALERTS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_select" ON alerts FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "alerts_insert" ON alerts FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "alerts_update" ON alerts FOR UPDATE USING (org_id = get_user_org_id());
CREATE POLICY "alerts_delete" ON alerts FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- FUEL_LOGS
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fuel_logs_select" ON fuel_logs FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "fuel_logs_insert" ON fuel_logs FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER'));
CREATE POLICY "fuel_logs_update" ON fuel_logs FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "fuel_logs_delete" ON fuel_logs FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- METER_READINGS
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meter_readings_select" ON meter_readings FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "meter_readings_insert" ON meter_readings FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER'));
CREATE POLICY "meter_readings_update" ON meter_readings FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "meter_readings_delete" ON meter_readings FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- AI_PREDICTIONS
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_predictions_select" ON ai_predictions FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "ai_predictions_insert" ON ai_predictions FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "ai_predictions_update" ON ai_predictions FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "ai_predictions_delete" ON ai_predictions FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- AI_INSIGHTS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_insights_select" ON ai_insights FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "ai_insights_insert" ON ai_insights FOR INSERT WITH CHECK (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "ai_insights_update" ON ai_insights FOR UPDATE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));
CREATE POLICY "ai_insights_delete" ON ai_insights FOR DELETE USING (org_id = get_user_org_id() AND get_user_role() IN ('OWNER', 'ADMIN'));

-- ============================================================
-- DONE! Now update your env vars:
-- NEXT_PUBLIC_SUPABASE_URL=https://<NEW_PROJECT_REF>.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=<NEW_ANON_KEY>
-- SUPABASE_SERVICE_ROLE_KEY=<NEW_SERVICE_ROLE_KEY>
-- ============================================================

-- ============================================================
-- ProMaint Cloud: Safe Schema Migration (IF NOT EXISTS)
-- Shared Supabase project with NaviPact
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANT & BILLING (may already exist from NaviPact)
-- ============================================================

-- Add ProMaint-specific columns to organizations if they don't exist
DO $$ BEGIN
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'POWER_PLANT';
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'MA';
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Casablanca';
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr';
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'FREE';
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active';
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS max_users INT DEFAULT 3;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS max_equipment INT DEFAULT 10;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS max_storage_mb INT DEFAULT 500;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
EXCEPTION WHEN others THEN NULL;
END $$;

-- org_members (ProMaint version — separate from NaviPact's org_users)
CREATE TABLE IF NOT EXISTS org_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'TECHNICIAN',
  name          TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  invited_by    UUID REFERENCES auth.users(id),
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE IF NOT EXISTS invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'TECHNICIAN',
  token         TEXT UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  invited_by    UUID NOT NULL REFERENCES auth.users(id),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric        TEXT NOT NULL,
  value         INT NOT NULL,
  period_start  TIMESTAMPTZ NOT NULL,
  period_end    TIMESTAMPTZ NOT NULL,
  reported_to_stripe BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id),
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  old_values    JSONB,
  new_values    JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- EQUIPMENT & ASSETS
-- ============================================================

CREATE TABLE IF NOT EXISTS constructors (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  models    TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code              TEXT NOT NULL,
  designation       TEXT NOT NULL,
  brand             TEXT,
  model             TEXT,
  serial_number     TEXT,
  location          TEXT,
  site              TEXT,
  workshop          TEXT,
  type              TEXT NOT NULL DEFAULT 'NON_CAPOTE',
  group_name        TEXT NOT NULL DEFAULT 'ELECTROGEN',
  criticality       TEXT NOT NULL DEFAULT 'STANDARD',
  status            TEXT NOT NULL DEFAULT 'OPERATIONAL',
  commission_date   TIMESTAMPTZ,
  hours_counter     FLOAT NOT NULL DEFAULT 0,
  preventive_freq   TEXT,
  last_revision     TIMESTAMPTZ,
  next_revision     TIMESTAMPTZ,
  total_main_cost   FLOAT NOT NULL DEFAULT 0,
  rated_power_kw    FLOAT,
  fuel_type         TEXT,
  fuel_consumption_rate FLOAT,
  constructor_id    UUID,
  qr_code           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

CREATE TABLE IF NOT EXISTS spare_parts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id  UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  reference     TEXT,
  equivalent1   TEXT,
  equivalent2   TEXT,
  quantity      INT NOT NULL DEFAULT 0,
  unit_cost     FLOAT DEFAULT 0,
  min_stock     INT DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WORK ORDERS & INTERVENTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS contracts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_name       TEXT NOT NULL,
  client_address    TEXT,
  type              TEXT NOT NULL,
  maintenance_type  TEXT,
  sla_hours         INT NOT NULL DEFAULT 4,
  frequency         TEXT,
  start_date        TIMESTAMPTZ NOT NULL,
  end_date          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code              TEXT NOT NULL,
  type              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'NEW',
  priority          TEXT NOT NULL DEFAULT 'NORMAL',
  description       TEXT NOT NULL,
  cause             TEXT,
  estimated_duration FLOAT,
  actual_duration    FLOAT,
  parts_cost        FLOAT NOT NULL DEFAULT 0,
  labor_cost        FLOAT NOT NULL DEFAULT 0,
  cancel_reason     TEXT,
  sla_deadline      TIMESTAMPTZ,
  sla_breached_at   TIMESTAMPTZ,
  equipment_id      UUID NOT NULL REFERENCES equipment(id),
  technician_id     UUID REFERENCES auth.users(id),
  created_by_id     UUID NOT NULL REFERENCES auth.users(id),
  contract_id       UUID,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

CREATE TABLE IF NOT EXISTS ot_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  from_status   TEXT,
  to_status     TEXT NOT NULL,
  comment       TEXT,
  changed_by    UUID REFERENCES auth.users(id),
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interventions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  work_order_id   UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  equipment_id    UUID NOT NULL REFERENCES equipment(id),
  technician_id   UUID NOT NULL REFERENCES auth.users(id),
  actions         TEXT NOT NULL,
  root_cause      TEXT,
  duration        FLOAT NOT NULL,
  parts_cost      FLOAT NOT NULL DEFAULT 0,
  labor_cost      FLOAT NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS part_usages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  reference       TEXT,
  quantity        INT NOT NULL,
  unit_cost       FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attachments (
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

CREATE TABLE IF NOT EXISTS alerts (
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

CREATE TABLE IF NOT EXISTS fuel_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id    UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  liters          FLOAT NOT NULL,
  cost            FLOAT NOT NULL DEFAULT 0,
  hours_at_fill   FLOAT,
  recorded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meter_readings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id    UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  value           FLOAT NOT NULL,
  read_at         TIMESTAMPTZ NOT NULL,
  read_by         UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AI FEATURES
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_predictions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id      UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  prediction_type   TEXT NOT NULL,
  confidence        FLOAT NOT NULL,
  predicted_date    TIMESTAMPTZ,
  details           JSONB NOT NULL,
  model_version     TEXT NOT NULL,
  acknowledged      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  equipment_ids   UUID[] DEFAULT '{}',
  severity        TEXT DEFAULT 'INFO',
  model_version   TEXT NOT NULL,
  dismissed       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_org ON equipment(org_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_org ON work_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_work_orders_equipment ON work_orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_ot_history_wo ON ot_status_history(work_order_id);
CREATE INDEX IF NOT EXISTS idx_interventions_wo ON interventions(work_order_id);
CREATE INDEX IF NOT EXISTS idx_interventions_equip ON interventions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(org_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_equip ON fuel_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_equip ON meter_readings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(org_id);

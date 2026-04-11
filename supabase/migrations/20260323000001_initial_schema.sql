-- ============================================================
-- ProMaint Cloud: Initial Schema Migration
-- Multi-tenant CMMS for energy sector
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
  role        TEXT DEFAULT 'TECHNICIAN',
  name        TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  invited_by  UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(org_id, user_id)
);

CREATE TABLE invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT DEFAULT 'TECHNICIAN',
  token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usage_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric            TEXT,
  value             INT,
  period_start      TIMESTAMPTZ,
  period_end        TIMESTAMPTZ,
  reported_to_stripe BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT,
  entity_type TEXT,
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- EQUIPMENT
-- ============================================================

CREATE TABLE constructors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT,
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
  type                  TEXT DEFAULT 'NON_CAPOTE',
  group_name            TEXT DEFAULT 'ELECTROGEN',
  criticality           TEXT DEFAULT 'STANDARD',
  status                TEXT DEFAULT 'OPERATIONAL',
  commission_date       TIMESTAMPTZ,
  hours_counter         FLOAT DEFAULT 0,
  preventive_freq       TEXT,
  last_revision         TIMESTAMPTZ,
  next_revision         TIMESTAMPTZ,
  total_main_cost       FLOAT DEFAULT 0,
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
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  description  TEXT,
  reference    TEXT,
  equivalent1  TEXT,
  equivalent2  TEXT,
  quantity     INT DEFAULT 0,
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
  sla_hours        INT DEFAULT 4,
  frequency        TEXT,
  start_date       TIMESTAMPTZ NOT NULL,
  end_date         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WORK ORDERS
-- ============================================================

CREATE TABLE work_orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code               TEXT NOT NULL,
  type               TEXT NOT NULL,
  status             TEXT DEFAULT 'NEW',
  priority           TEXT DEFAULT 'NORMAL',
  description        TEXT NOT NULL,
  cause              TEXT,
  estimated_duration FLOAT,
  actual_duration    FLOAT,
  parts_cost         FLOAT DEFAULT 0,
  labor_cost         FLOAT DEFAULT 0,
  cancel_reason      TEXT,
  sla_deadline       TIMESTAMPTZ,
  sla_breached_at    TIMESTAMPTZ,
  equipment_id       UUID REFERENCES equipment(id),
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
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  equipment_id  UUID REFERENCES equipment(id),
  technician_id UUID NOT NULL REFERENCES auth.users(id),
  actions       TEXT NOT NULL,
  root_cause    TEXT,
  duration      FLOAT NOT NULL,
  parts_cost    FLOAT DEFAULT 0,
  labor_cost    FLOAT DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE part_usages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  intervention_id UUID REFERENCES interventions(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  reference       TEXT,
  quantity        INT NOT NULL,
  unit_cost       FLOAT DEFAULT 0
);

CREATE TABLE attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  url           TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ALERTS
-- ============================================================

CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  message         TEXT NOT NULL,
  channels        TEXT[] DEFAULT '{push}',
  status          TEXT DEFAULT 'SENT',
  equipment_id    UUID REFERENCES equipment(id),
  recipient_id    UUID REFERENCES auth.users(id),
  whatsapp_msg_id TEXT,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at         TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ
);

-- ============================================================
-- ENERGY-SECTOR
-- ============================================================

CREATE TABLE fuel_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id  UUID REFERENCES equipment(id),
  date          DATE NOT NULL,
  liters        FLOAT NOT NULL,
  cost          FLOAT DEFAULT 0,
  hours_at_fill FLOAT,
  recorded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meter_readings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id),
  type         TEXT NOT NULL,
  value        FLOAT NOT NULL,
  read_at      TIMESTAMPTZ NOT NULL,
  read_by      UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AI
-- ============================================================

CREATE TABLE ai_predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id    UUID REFERENCES equipment(id),
  prediction_type TEXT NOT NULL,
  confidence      FLOAT NOT NULL,
  predicted_date  TIMESTAMPTZ,
  details         JSONB NOT NULL,
  model_version   TEXT NOT NULL,
  acknowledged    BOOLEAN DEFAULT false,
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
  dismissed     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- org_id indexes on every table
CREATE INDEX idx_org_members_org_id       ON org_members(org_id);
CREATE INDEX idx_invitations_org_id       ON invitations(org_id);
CREATE INDEX idx_usage_records_org_id     ON usage_records(org_id);
CREATE INDEX idx_audit_logs_org_id        ON audit_logs(org_id);
CREATE INDEX idx_constructors_org_id      ON constructors(org_id);
CREATE INDEX idx_equipment_org_id         ON equipment(org_id);
CREATE INDEX idx_spare_parts_org_id       ON spare_parts(org_id);
CREATE INDEX idx_contracts_org_id         ON contracts(org_id);
CREATE INDEX idx_work_orders_org_id       ON work_orders(org_id);
CREATE INDEX idx_ot_status_history_org_id ON ot_status_history(org_id);
CREATE INDEX idx_interventions_org_id     ON interventions(org_id);
CREATE INDEX idx_part_usages_org_id       ON part_usages(org_id);
CREATE INDEX idx_attachments_org_id       ON attachments(org_id);
CREATE INDEX idx_alerts_org_id            ON alerts(org_id);
CREATE INDEX idx_fuel_logs_org_id         ON fuel_logs(org_id);
CREATE INDEX idx_meter_readings_org_id    ON meter_readings(org_id);
CREATE INDEX idx_ai_predictions_org_id    ON ai_predictions(org_id);
CREATE INDEX idx_ai_insights_org_id       ON ai_insights(org_id);

-- Additional useful indexes
CREATE INDEX idx_equipment_status         ON equipment(status);
CREATE INDEX idx_work_orders_status       ON work_orders(status, priority);
CREATE INDEX idx_alerts_status            ON alerts(status);
CREATE INDEX idx_org_members_user_id      ON org_members(user_id);

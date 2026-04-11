-- ============================================================
-- ProMaint Cloud: Row Level Security Policies
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS
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
-- ORGANIZATIONS
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id = get_user_org_id());

CREATE POLICY "org_insert" ON organizations FOR INSERT
  WITH CHECK (true); -- Anyone can create an org (during onboarding)

CREATE POLICY "org_update" ON organizations FOR UPDATE
  USING (id = get_user_org_id() AND get_user_role() = 'OWNER');

CREATE POLICY "org_delete" ON organizations FOR DELETE
  USING (id = get_user_org_id() AND get_user_role() = 'OWNER');

-- ============================================================
-- ORG_MEMBERS
-- ============================================================

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select" ON org_members FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "org_members_insert" ON org_members FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "org_members_update" ON org_members FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "org_members_delete" ON org_members FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- INVITATIONS
-- ============================================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_select" ON invitations FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "invitations_insert" ON invitations FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "invitations_update" ON invitations FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "invitations_delete" ON invitations FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- USAGE_RECORDS
-- ============================================================

ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_records_select" ON usage_records FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "usage_records_insert" ON usage_records FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "usage_records_update" ON usage_records FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "usage_records_delete" ON usage_records FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- AUDIT_LOGS (insert-only, no update/delete)
-- ============================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

-- No UPDATE or DELETE policies for audit_logs

-- ============================================================
-- CONSTRUCTORS
-- ============================================================

ALTER TABLE constructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "constructors_select" ON constructors FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "constructors_insert" ON constructors FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "constructors_update" ON constructors FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "constructors_delete" ON constructors FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- EQUIPMENT
-- ============================================================

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment_select" ON equipment FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "equipment_insert" ON equipment FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "equipment_update" ON equipment FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "equipment_delete" ON equipment FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- SPARE_PARTS
-- ============================================================

ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spare_parts_select" ON spare_parts FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "spare_parts_insert" ON spare_parts FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "spare_parts_update" ON spare_parts FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "spare_parts_delete" ON spare_parts FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- CONTRACTS
-- ============================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_select" ON contracts FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "contracts_insert" ON contracts FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "contracts_update" ON contracts FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "contracts_delete" ON contracts FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- WORK_ORDERS
-- ============================================================

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "work_orders_select" ON work_orders FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "work_orders_insert" ON work_orders FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER')
  );

CREATE POLICY "work_orders_update" ON work_orders FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND (
      get_user_role() IN ('OWNER', 'ADMIN')
      OR (get_user_role() = 'TECHNICIAN' AND technician_id = auth.uid())
      OR (get_user_role() = 'SITE_MANAGER')
    )
  );

CREATE POLICY "work_orders_delete" ON work_orders FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- OT_STATUS_HISTORY
-- ============================================================

ALTER TABLE ot_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ot_status_history_select" ON ot_status_history FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "ot_status_history_insert" ON ot_status_history FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER')
  );

CREATE POLICY "ot_status_history_update" ON ot_status_history FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "ot_status_history_delete" ON ot_status_history FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- INTERVENTIONS
-- ============================================================

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interventions_select" ON interventions FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "interventions_insert" ON interventions FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER')
  );

CREATE POLICY "interventions_update" ON interventions FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND (
      get_user_role() IN ('OWNER', 'ADMIN')
      OR (get_user_role() = 'TECHNICIAN' AND technician_id = auth.uid())
    )
  );

CREATE POLICY "interventions_delete" ON interventions FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- PART_USAGES
-- ============================================================

ALTER TABLE part_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "part_usages_select" ON part_usages FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "part_usages_insert" ON part_usages FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER')
  );

CREATE POLICY "part_usages_update" ON part_usages FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "part_usages_delete" ON part_usages FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- ATTACHMENTS
-- ============================================================

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attachments_select" ON attachments FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "attachments_insert" ON attachments FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER')
  );

CREATE POLICY "attachments_update" ON attachments FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "attachments_delete" ON attachments FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- ALERTS
-- ============================================================

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_select" ON alerts FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "alerts_insert" ON alerts FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- Any member can acknowledge (update read_at / acknowledged_at)
CREATE POLICY "alerts_update" ON alerts FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "alerts_delete" ON alerts FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- FUEL_LOGS
-- ============================================================

ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fuel_logs_select" ON fuel_logs FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "fuel_logs_insert" ON fuel_logs FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER')
  );

CREATE POLICY "fuel_logs_update" ON fuel_logs FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "fuel_logs_delete" ON fuel_logs FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- METER_READINGS
-- ============================================================

ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meter_readings_select" ON meter_readings FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "meter_readings_insert" ON meter_readings FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN', 'TECHNICIAN', 'SITE_MANAGER')
  );

CREATE POLICY "meter_readings_update" ON meter_readings FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "meter_readings_delete" ON meter_readings FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- AI_PREDICTIONS
-- ============================================================

ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_predictions_select" ON ai_predictions FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "ai_predictions_insert" ON ai_predictions FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "ai_predictions_update" ON ai_predictions FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "ai_predictions_delete" ON ai_predictions FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

-- ============================================================
-- AI_INSIGHTS
-- ============================================================

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_insights_select" ON ai_insights FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "ai_insights_insert" ON ai_insights FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "ai_insights_update" ON ai_insights FOR UPDATE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

CREATE POLICY "ai_insights_delete" ON ai_insights FOR DELETE
  USING (
    org_id = get_user_org_id()
    AND get_user_role() IN ('OWNER', 'ADMIN')
  );

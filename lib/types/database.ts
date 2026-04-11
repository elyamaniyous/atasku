// ============================================================
// ProMaint Cloud — Database TypeScript Types
// Hand-written to match supabase/migrations/00001_initial_schema.sql
// ============================================================

// ---- Enums / Union Types ----

export type OrgRole = 'OWNER' | 'ADMIN' | 'TECHNICIAN' | 'SITE_MANAGER' | 'READONLY'

export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE'

export type PlanStatus = 'active' | 'past_due' | 'canceled' | 'trialing'

export type OTStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export type Priority = 'URGENT' | 'NORMAL' | 'LOW'

export type EquipmentStatus = 'OPERATIONAL' | 'DEGRADED' | 'BROKEN' | 'IN_REVISION' | 'REVISION_DUE'

export type EquipmentType = 'CAPOTE' | 'NON_CAPOTE'

export type EquipmentGroup = 'ELECTROGEN' | 'TURBINE' | 'TRANSFORMER' | 'PUMP' | 'COMPRESSOR' | 'OTHER'

export type Criticality = 'CRITICAL' | 'STANDARD' | 'LOW'

export type AlertType = 'SLA_BREACH' | 'MAINTENANCE_DUE' | 'AI_PREDICTION' | 'STOCK_LOW' | 'SYSTEM'

export type AlertStatus = 'SENT' | 'DELIVERED' | 'READ' | 'ACKNOWLEDGED'

export type AlertChannel = 'push' | 'email' | 'whatsapp' | 'sms'

export type AIPredictionType = 'FAILURE' | 'MAINTENANCE' | 'DEGRADATION' | 'ANOMALY'

export type AIInsightSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export type ContractType = 'MAINTENANCE' | 'SERVICE' | 'SPARE_PARTS' | 'FULL_SERVICE'

export type WorkOrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'CONDITIONAL' | 'IMPROVEMENT'

export type MeterReadingType = 'HOURS' | 'KWH' | 'TEMPERATURE' | 'PRESSURE' | 'VIBRATION'

// ---- Table Types ----

export interface Organization {
  id: string
  name: string
  slug: string
  industry: string
  country: string
  timezone: string
  locale: string
  logo_url: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: Plan
  plan_status: PlanStatus
  max_users: number
  max_equipment: number
  max_storage_mb: number
  onboarding_completed: boolean
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface OrgMember {
  id: string
  org_id: string
  user_id: string
  role: OrgRole
  name: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  invited_by: string | null
  accepted_at: string | null
  created_at: string
}

export interface Invitation {
  id: string
  org_id: string
  email: string
  role: OrgRole
  token: string
  invited_by: string | null
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface UsageRecord {
  id: string
  org_id: string
  metric: string | null
  value: number | null
  period_start: string | null
  period_end: string | null
  reported_to_stripe: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  org_id: string
  user_id: string | null
  action: string | null
  entity_type: string | null
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface Constructor {
  id: string
  org_id: string
  name: string | null
  models: string[]
  created_at: string
}

export interface Equipment {
  id: string
  org_id: string
  code: string
  designation: string
  brand: string | null
  model: string | null
  serial_number: string | null
  location: string | null
  site: string | null
  workshop: string | null
  type: EquipmentType
  group_name: EquipmentGroup
  criticality: Criticality
  status: EquipmentStatus
  commission_date: string | null
  hours_counter: number
  preventive_freq: string | null
  last_revision: string | null
  next_revision: string | null
  total_main_cost: number
  rated_power_kw: number | null
  fuel_type: string | null
  fuel_consumption_rate: number | null
  constructor_id: string | null
  qr_code: string | null
  created_at: string
  updated_at: string
}

export interface SparePart {
  id: string
  org_id: string
  equipment_id: string | null
  description: string | null
  reference: string | null
  equivalent1: string | null
  equivalent2: string | null
  quantity: number
  unit_cost: number
  min_stock: number
  created_at: string
}

export interface Contract {
  id: string
  org_id: string
  client_name: string
  client_address: string | null
  type: ContractType
  maintenance_type: string | null
  sla_hours: number
  frequency: string | null
  start_date: string
  end_date: string | null
  created_at: string
}

export interface WorkOrder {
  id: string
  org_id: string
  code: string
  type: WorkOrderType
  status: OTStatus
  priority: Priority
  description: string
  cause: string | null
  estimated_duration: number | null
  actual_duration: number | null
  parts_cost: number
  labor_cost: number
  cancel_reason: string | null
  sla_deadline: string | null
  sla_breached_at: string | null
  equipment_id: string | null
  technician_id: string | null
  created_by_id: string
  contract_id: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface OTStatusHistory {
  id: string
  org_id: string
  work_order_id: string
  from_status: string | null
  to_status: OTStatus
  comment: string | null
  changed_by: string | null
  changed_at: string
}

export interface Intervention {
  id: string
  org_id: string
  work_order_id: string | null
  equipment_id: string | null
  technician_id: string
  actions: string
  root_cause: string | null
  duration: number
  parts_cost: number
  labor_cost: number
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface PartUsage {
  id: string
  org_id: string
  intervention_id: string | null
  description: string
  reference: string | null
  quantity: number
  unit_cost: number
}

export interface Attachment {
  id: string
  org_id: string
  work_order_id: string | null
  filename: string
  url: string
  mime_type: string
  size_bytes: number | null
  created_at: string
}

export interface Alert {
  id: string
  org_id: string
  type: AlertType
  message: string
  channels: AlertChannel[]
  status: AlertStatus
  equipment_id: string | null
  recipient_id: string | null
  whatsapp_msg_id: string | null
  sent_at: string
  read_at: string | null
  acknowledged_at: string | null
}

export interface FuelLog {
  id: string
  org_id: string
  equipment_id: string | null
  date: string
  liters: number
  cost: number
  hours_at_fill: number | null
  recorded_by: string | null
  created_at: string
}

export interface MeterReading {
  id: string
  org_id: string
  equipment_id: string | null
  type: MeterReadingType
  value: number
  read_at: string
  read_by: string | null
  created_at: string
}

export interface AIPrediction {
  id: string
  org_id: string
  equipment_id: string | null
  prediction_type: AIPredictionType
  confidence: number
  predicted_date: string | null
  details: Record<string, unknown>
  model_version: string
  acknowledged: boolean
  created_at: string
}

export interface AIInsight {
  id: string
  org_id: string
  type: string
  title: string
  content: string
  equipment_ids: string[]
  severity: AIInsightSeverity
  model_version: string
  dismissed: boolean
  created_at: string
}

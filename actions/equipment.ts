'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { z } from 'zod/v4'
import { isPlanLimitReached } from '@/lib/stripe/plans'
import type { PlanKey } from '@/lib/stripe/plans'
import type { Equipment, WorkOrder, SparePart, MeterReading } from '@/lib/types/database'

// ---- Schemas ----

const equipmentSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  designation: z.string().min(2, 'La désignation doit contenir au moins 2 caractères'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  location: z.string().optional(),
  site: z.string().optional(),
  workshop: z.string().optional(),
  type: z.enum(['CAPOTE', 'NON_CAPOTE']).default('NON_CAPOTE'),
  group_name: z.enum(['ELECTROGEN', 'TURBINE', 'TRANSFORMER', 'PUMP', 'COMPRESSOR', 'OTHER']).default('ELECTROGEN'),
  criticality: z.enum(['CRITICAL', 'STANDARD', 'LOW']).default('STANDARD'),
  commission_date: z.string().optional(),
  preventive_freq: z.string().optional(),
  rated_power_kw: z.coerce.number().optional(),
  fuel_type: z.string().optional(),
  fuel_consumption_rate: z.coerce.number().optional(),
})

// ---- Helpers ----

function cleanOptional(val: unknown): string | undefined {
  if (typeof val === 'string' && val.trim() !== '') return val.trim()
  return undefined
}

function cleanOptionalNumber(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined
  const n = Number(val)
  return isNaN(n) ? undefined : n
}

// ---- CRUD ----

export async function createEquipment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  const raw = {
    code: formData.get('code'),
    designation: formData.get('designation'),
    brand: cleanOptional(formData.get('brand')),
    model: cleanOptional(formData.get('model')),
    serial_number: cleanOptional(formData.get('serial_number')),
    location: cleanOptional(formData.get('location')),
    site: cleanOptional(formData.get('site')),
    workshop: cleanOptional(formData.get('workshop')),
    type: formData.get('type') || 'NON_CAPOTE',
    group_name: formData.get('group_name') || 'ELECTROGEN',
    criticality: formData.get('criticality') || 'STANDARD',
    commission_date: cleanOptional(formData.get('commission_date')),
    preventive_freq: cleanOptional(formData.get('preventive_freq')),
    rated_power_kw: cleanOptionalNumber(formData.get('rated_power_kw')),
    fuel_type: cleanOptional(formData.get('fuel_type')),
    fuel_consumption_rate: cleanOptionalNumber(formData.get('fuel_consumption_rate')),
  }

  const parsed = equipmentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Check plan limit
  const { count: eqCount } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', member.org_id)
  const { data: orgData } = await supabase
    .from('org_members')
    .select('organizations(plan)')
    .eq('user_id', user.id)
    .single()
  const plan = ((orgData?.organizations as unknown as { plan: string } | null)?.plan || 'FREE') as PlanKey
  if (isPlanLimitReached(plan, 'equipment', eqCount || 0)) {
    return { error: { code: ['Limite du plan atteinte. Passez au Pro pour ajouter plus d\'équipements.'] } }
  }

  // Build insert object, only including defined optional fields
  const insertData: Record<string, unknown> = {
    org_id: member.org_id,
    code: parsed.data.code,
    designation: parsed.data.designation,
    type: parsed.data.type,
    group_name: parsed.data.group_name,
    criticality: parsed.data.criticality,
  }

  if (parsed.data.brand) insertData.brand = parsed.data.brand
  if (parsed.data.model) insertData.model = parsed.data.model
  if (parsed.data.serial_number) insertData.serial_number = parsed.data.serial_number
  if (parsed.data.location) insertData.location = parsed.data.location
  if (parsed.data.site) insertData.site = parsed.data.site
  if (parsed.data.workshop) insertData.workshop = parsed.data.workshop
  if (parsed.data.commission_date) insertData.commission_date = parsed.data.commission_date
  if (parsed.data.preventive_freq) insertData.preventive_freq = parsed.data.preventive_freq
  if (parsed.data.rated_power_kw !== undefined) insertData.rated_power_kw = parsed.data.rated_power_kw
  if (parsed.data.fuel_type) insertData.fuel_type = parsed.data.fuel_type
  if (parsed.data.fuel_consumption_rate !== undefined) insertData.fuel_consumption_rate = parsed.data.fuel_consumption_rate

  const { error } = await supabase.from('equipment').insert(insertData)

  if (error) return { error: { code: [error.message] } }
  return { success: true }
}

export async function updateEquipment(id: string, formData: FormData): Promise<{ error?: Record<string, string[]>; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    code: formData.get('code'),
    designation: formData.get('designation'),
    brand: cleanOptional(formData.get('brand')),
    model: cleanOptional(formData.get('model')),
    serial_number: cleanOptional(formData.get('serial_number')),
    location: cleanOptional(formData.get('location')),
    site: cleanOptional(formData.get('site')),
    workshop: cleanOptional(formData.get('workshop')),
    type: formData.get('type') || 'NON_CAPOTE',
    group_name: formData.get('group_name') || 'ELECTROGEN',
    criticality: formData.get('criticality') || 'STANDARD',
    commission_date: cleanOptional(formData.get('commission_date')),
    preventive_freq: cleanOptional(formData.get('preventive_freq')),
    rated_power_kw: cleanOptionalNumber(formData.get('rated_power_kw')),
    fuel_type: cleanOptional(formData.get('fuel_type')),
    fuel_consumption_rate: cleanOptionalNumber(formData.get('fuel_consumption_rate')),
  }

  const parsed = equipmentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const updateData: Record<string, unknown> = {
    code: parsed.data.code,
    designation: parsed.data.designation,
    type: parsed.data.type,
    group_name: parsed.data.group_name,
    criticality: parsed.data.criticality,
    brand: parsed.data.brand ?? null,
    model: parsed.data.model ?? null,
    serial_number: parsed.data.serial_number ?? null,
    location: parsed.data.location ?? null,
    site: parsed.data.site ?? null,
    workshop: parsed.data.workshop ?? null,
    commission_date: parsed.data.commission_date ?? null,
    preventive_freq: parsed.data.preventive_freq ?? null,
    rated_power_kw: parsed.data.rated_power_kw ?? null,
    fuel_type: parsed.data.fuel_type ?? null,
    fuel_consumption_rate: parsed.data.fuel_consumption_rate ?? null,
  }

  const { error } = await supabase
    .from('equipment')
    .update(updateData)
    .eq('id', id)

  if (error) return { error: { code: [error.message] } }
  return { success: true }
}

export async function deleteEquipment(id: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check for active work orders
  const { count } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('equipment_id', id)
    .not('status', 'in', '("COMPLETED","CANCELLED")')

  if (count && count > 0) {
    return { error: 'Impossible de supprimer : cet équipement a des ordres de travail actifs.' }
  }

  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

// ---- Queries ----

export async function getEquipments(filters?: {
  status?: string
  criticality?: string
  group_name?: string
  search?: string
}): Promise<Equipment[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return []

  let query = supabase
    .from('equipment')
    .select('*')
    .eq('org_id', member.org_id)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.criticality) {
    query = query.eq('criticality', filters.criticality)
  }
  if (filters?.group_name) {
    query = query.eq('group_name', filters.group_name)
  }
  if (filters?.search) {
    const term = `%${filters.search}%`
    query = query.or(`code.ilike.${term},designation.ilike.${term},brand.ilike.${term},serial_number.ilike.${term}`)
  }

  // Order: CRITICAL first, then by designation
  const { data } = await query.order('criticality', { ascending: true }).order('designation', { ascending: true })

  return (data as Equipment[] | null) ?? []
}

export async function getEquipment(id: string): Promise<{
  equipment: Equipment
  workOrders: WorkOrder[]
  spareParts: SparePart[]
  meterReadings: MeterReading[]
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (!equipment) return null

  const [woRes, spRes, mrRes] = await Promise.all([
    supabase
      .from('work_orders')
      .select('*')
      .eq('equipment_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('spare_parts')
      .select('*')
      .eq('equipment_id', id),
    supabase
      .from('meter_readings')
      .select('*')
      .eq('equipment_id', id)
      .order('read_at', { ascending: false })
      .limit(20),
  ])

  return {
    equipment: equipment as Equipment,
    workOrders: (woRes.data as WorkOrder[] | null) ?? [],
    spareParts: (spRes.data as SparePart[] | null) ?? [],
    meterReadings: (mrRes.data as MeterReading[] | null) ?? [],
  }
}

export async function getEquipmentStats(): Promise<{
  total: number
  operational: number
  degraded: number
  broken: number
  inRevision: number
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { total: 0, operational: 0, degraded: 0, broken: 0, inRevision: 0 }

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return { total: 0, operational: 0, degraded: 0, broken: 0, inRevision: 0 }

  const { data } = await supabase
    .from('equipment')
    .select('status')
    .eq('org_id', member.org_id)

  if (!data) return { total: 0, operational: 0, degraded: 0, broken: 0, inRevision: 0 }

  return {
    total: data.length,
    operational: data.filter(e => e.status === 'OPERATIONAL').length,
    degraded: data.filter(e => e.status === 'DEGRADED').length,
    broken: data.filter(e => e.status === 'BROKEN').length,
    inRevision: data.filter(e => e.status === 'IN_REVISION' || e.status === 'REVISION_DUE').length,
  }
}

export async function updateEquipmentStatus(id: string, status: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('equipment')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getNextEquipmentCode(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'EQ-001'

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return 'EQ-001'

  const { data } = await supabase
    .from('equipment')
    .select('code')
    .eq('org_id', member.org_id)
    .order('code', { ascending: false })
    .limit(1)

  if (!data || data.length === 0) return 'EQ-001'

  const lastCode = data[0].code
  const match = lastCode.match(/^EQ-(\d+)$/)
  if (match) {
    const next = parseInt(match[1], 10) + 1
    return `EQ-${String(next).padStart(3, '0')}`
  }

  return `EQ-001`
}

// Keep legacy exports for backward compatibility
export async function getEquipmentList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return []

  const { data } = await supabase
    .from('equipment')
    .select('id, code, designation, group_name, criticality')
    .eq('org_id', member.org_id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getEquipmentCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return 0

  const { count } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', member.org_id)

  return count ?? 0
}

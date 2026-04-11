/**
 * Seed script for ProMaint Cloud demo data
 * Run: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🌱 Seeding ProMaint Cloud demo data...\n')

  // 1. Create demo users via Supabase Auth
  const users = [
    { email: 'guy.arnaud@energipro.ma', password: 'promaint2025', name: 'Guy Arnaud', role: 'OWNER' },
    { email: 'karim.benali@energipro.ma', password: 'promaint2025', name: 'Karim Benali', role: 'TECHNICIAN' },
    { email: 'sara.tahiri@energipro.ma', password: 'promaint2025', name: 'Sara Tahiri', role: 'TECHNICIAN' },
    { email: 'ahmed.mansouri@energipro.ma', password: 'promaint2025', name: 'Ahmed Mansouri', role: 'TECHNICIAN' },
    { email: 'fatima.zahra@energipro.ma', password: 'promaint2025', name: 'Fatima Zahra', role: 'SITE_MANAGER' },
  ]

  const createdUsers: { id: string; email: string; name: string; role: string }[] = []

  for (const u of users) {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(eu => eu.email === u.email)

    if (existing) {
      console.log(`  ✓ User ${u.email} already exists (${existing.id})`)
      createdUsers.push({ id: existing.id, email: u.email, name: u.name, role: u.role })
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name },
      })
      if (error) {
        console.error(`  ✗ Failed to create ${u.email}:`, error.message)
        continue
      }
      console.log(`  ✓ Created user ${u.email} (${data.user.id})`)
      createdUsers.push({ id: data.user.id, email: u.email, name: u.name, role: u.role })
    }
  }

  // 2. Create organization
  console.log('\n📁 Creating organization...')
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'energipro-demo')
    .single()

  let orgId: string
  if (existingOrg) {
    orgId = existingOrg.id
    console.log(`  ✓ Organization already exists (${orgId})`)
  } else {
    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        name: 'EnergiPro Demo',
        slug: 'energipro-demo',
        industry: 'POWER_PLANT',
        country: 'MA',
        timezone: 'Africa/Casablanca',
        locale: 'fr',
        plan: 'PRO',
        plan_status: 'trialing',
        max_users: 20,
        max_equipment: 100,
        max_storage_mb: 10240,
        onboarding_completed: true,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) { console.error('  ✗ Failed:', error.message); return }
    orgId = org!.id
    console.log(`  ✓ Created organization (${orgId})`)
  }

  // 3. Create org members
  console.log('\n👥 Creating org members...')
  for (const u of createdUsers) {
    const { error } = await supabase
      .from('org_members')
      .upsert({
        org_id: orgId,
        user_id: u.id,
        role: u.role,
        name: u.name,
        is_active: true,
        accepted_at: new Date().toISOString(),
      }, { onConflict: 'org_id,user_id' })

    if (error) console.error(`  ✗ Failed member ${u.name}:`, error.message)
    else console.log(`  ✓ ${u.name} (${u.role})`)
  }

  // 4. Create equipment
  console.log('\n⚙️ Creating equipment...')
  const equipmentData = [
    { code: 'GE-001', designation: 'Groupe Électrogène Principal', group_name: 'ELECTROGEN', criticality: 'CRITICAL', status: 'OPERATIONAL', brand: 'Caterpillar', model: 'C32', hours_counter: 4520, rated_power_kw: 1000, fuel_type: 'DIESEL', fuel_consumption_rate: 220, preventive_freq: '250h', last_revision: '2026-02-15', next_revision: '2026-04-01' },
    { code: 'GE-002', designation: 'Groupe Électrogène Secours', group_name: 'ELECTROGEN', criticality: 'IMPORTANT', status: 'OPERATIONAL', brand: 'Caterpillar', model: 'C18', hours_counter: 1200, rated_power_kw: 600, fuel_type: 'DIESEL', fuel_consumption_rate: 150, preventive_freq: '250h' },
    { code: 'CP-001', designation: 'Compresseur Air Principal', group_name: 'COMPRESSEUR', criticality: 'IMPORTANT', status: 'DEGRADED', brand: 'Atlas Copco', model: 'GA 90+', hours_counter: 8750, preventive_freq: 'mensuelle' },
    { code: 'PM-001', designation: 'Pompe d\'alimentation Eau', group_name: 'MOTO_POMPE', criticality: 'STANDARD', status: 'OPERATIONAL', brand: 'KSB', model: 'Omega 150', hours_counter: 3200 },
    { code: 'TR-001', designation: 'Transformateur HT/BT', group_name: 'TRANSFORMER', criticality: 'CRITICAL', status: 'OPERATIONAL', brand: 'Schneider', model: 'Trihal 1250kVA', rated_power_kw: 1250 },
    { code: 'PV-001', designation: 'Champ Solaire Zone A', group_name: 'SOLAR_PANEL', criticality: 'STANDARD', status: 'OPERATIONAL', rated_power_kw: 500, fuel_type: 'SOLAR' },
  ]

  const equipmentIds: Record<string, string> = {}
  for (const eq of equipmentData) {
    const { data: existing } = await supabase.from('equipment').select('id').eq('org_id', orgId).eq('code', eq.code).single()
    if (existing) {
      equipmentIds[eq.code] = existing.id
      console.log(`  ✓ ${eq.code} already exists`)
      continue
    }
    const { data, error } = await supabase
      .from('equipment')
      .insert({ org_id: orgId, ...eq })
      .select('id')
      .single()
    if (error) console.error(`  ✗ ${eq.code}:`, error.message)
    else { equipmentIds[eq.code] = data!.id; console.log(`  ✓ ${eq.code} — ${eq.designation}`) }
  }

  // 5. Create work orders
  console.log('\n📋 Creating work orders...')
  const owner = createdUsers.find(u => u.role === 'OWNER')!
  const techs = createdUsers.filter(u => u.role === 'TECHNICIAN')

  const workOrderData = [
    { code: 'INT-2026-001', type: 'CORRECTIVE', status: 'COMPLETED', priority: 'URGENT', description: 'Panne groupe électrogène — arrêt d\'urgence déclenché', equipment: 'GE-001', technician: techs[0], estimated_duration: 4, actual_duration: 3.5, started_at: '2026-03-10T08:00:00Z', completed_at: '2026-03-10T11:30:00Z' },
    { code: 'INT-2026-002', type: 'PREVENTIVE', status: 'COMPLETED', priority: 'NORMAL', description: 'Révision 250h — vidange, filtres, courroies', equipment: 'GE-002', technician: techs[1], estimated_duration: 6, actual_duration: 5, started_at: '2026-03-12T07:00:00Z', completed_at: '2026-03-12T12:00:00Z' },
    { code: 'INT-2026-003', type: 'CORRECTIVE', status: 'IN_PROGRESS', priority: 'URGENT', description: 'Fuite d\'huile compresseur — pression en baisse', equipment: 'CP-001', technician: techs[0], estimated_duration: 3, started_at: '2026-03-23T09:00:00Z' },
    { code: 'INT-2026-004', type: 'PREVENTIVE', status: 'ASSIGNED', priority: 'NORMAL', description: 'Maintenance préventive mensuelle compresseur', equipment: 'CP-001', technician: techs[2], estimated_duration: 4 },
    { code: 'INT-2026-005', type: 'CORRECTIVE', status: 'NEW', priority: 'URGENT', description: 'Vibrations anormales pompe alimentation eau', equipment: 'PM-001', technician: null, estimated_duration: 2 },
    { code: 'INT-2026-006', type: 'PREVENTIVE', status: 'NEW', priority: 'LOW', description: 'Inspection thermographique transformateur HT/BT', equipment: 'TR-001', technician: null, estimated_duration: 3 },
    { code: 'INT-2026-007', type: 'CORRECTIVE', status: 'ON_HOLD', priority: 'NORMAL', description: 'Nettoyage panneaux solaires — en attente pièces', equipment: 'PV-001', technician: techs[1], estimated_duration: 8, started_at: '2026-03-20T08:00:00Z' },
  ]

  for (const wo of workOrderData) {
    const { data: existing } = await supabase.from('work_orders').select('id').eq('org_id', orgId).eq('code', wo.code).single()
    if (existing) { console.log(`  ✓ ${wo.code} already exists`); continue }

    const { error } = await supabase.from('work_orders').insert({
      org_id: orgId,
      code: wo.code,
      type: wo.type,
      status: wo.status,
      priority: wo.priority,
      description: wo.description,
      equipment_id: equipmentIds[wo.equipment],
      technician_id: wo.technician?.id || null,
      created_by_id: owner.id,
      estimated_duration: wo.estimated_duration,
      actual_duration: wo.actual_duration || null,
      started_at: wo.started_at || null,
      completed_at: wo.completed_at || null,
    })
    if (error) console.error(`  ✗ ${wo.code}:`, error.message)
    else console.log(`  ✓ ${wo.code} — ${wo.status}`)
  }

  // 6. Create alerts
  console.log('\n🔔 Creating alerts...')
  const alertData = [
    { type: 'OT_UNASSIGNED', message: 'OT urgent INT-2026-005 non affecté depuis 2 heures', equipment: 'PM-001' },
    { type: 'HOURS_250', message: 'GE-001 — Compteur à 4520h, révision 5000h imminente', equipment: 'GE-001' },
    { type: 'PREVENTIVE_J7', message: 'GE-001 — Maintenance préventive dans 7 jours', equipment: 'GE-001' },
    { type: 'SLA_WARNING', message: 'INT-2026-003 — SLA de 4h bientôt dépassé', equipment: 'CP-001' },
  ]

  for (const alert of alertData) {
    const { error } = await supabase.from('alerts').insert({
      org_id: orgId,
      type: alert.type,
      message: alert.message,
      equipment_id: equipmentIds[alert.equipment],
      channels: ['push', 'email'],
    })
    if (error) console.error(`  ✗ Alert:`, error.message)
    else console.log(`  ✓ ${alert.type}: ${alert.message.slice(0, 50)}...`)
  }

  console.log('\n✅ Seed complete!\n')
  console.log('Login credentials:')
  console.log('  Email: guy.arnaud@energipro.ma')
  console.log('  Password: promaint2025')
  console.log('  Role: OWNER (full access)')
}

seed().catch(console.error)

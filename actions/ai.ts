'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { geminiModel, geminiModelJSON } from '@/lib/ai/gemini'
import {
  buildEquipmentHealthPrompt,
  buildRootCausePrompt,
  buildWeeklySummaryPrompt,
  buildChatPrompt,
} from '@/lib/ai/prompts'
import { PLANS, type PlanKey } from '@/lib/stripe/plans'

// ---- Auth helper ----

async function getAuthenticatedContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  return { supabase, user, orgId: member.org_id }
}

// ---- AI rate limit check ----

async function checkAIRateLimit(orgId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createClient()

  // Get org plan
  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single()

  const plan = (org?.plan || 'FREE') as PlanKey
  const limit = PLANS[plan].aiCallsPerWeek

  // Unlimited plans (-1)
  if (limit === -1) return { allowed: true, remaining: -1 }

  // Count AI calls this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('ai_insights')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('created_at', weekAgo)

  const used = count || 0
  const remaining = Math.max(0, limit - used)
  return { allowed: used < limit, remaining }
}

// ---- Types ----

interface AIInsightResult {
  equipment_id: string
  health_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  next_failure_estimate: number | null
  recommendations: string[]
  anomalies: string[]
}

interface RootCauseResult {
  probable_causes: { cause: string; probability: number; evidence: string }[]
  recommended_actions: string[]
  similar_past_interventions: {
    intervention_id: string
    actions: string
    root_cause: string | null
    relevance: string
  }[]
}

interface WeeklySummaryResult {
  summary: string
  highlights: string[]
  warnings: string[]
  recommendations: string[]
  kpi_analysis: {
    mttr_trend: 'IMPROVING' | 'STABLE' | 'DEGRADING'
    availability_trend: 'IMPROVING' | 'STABLE' | 'DEGRADING'
    workload_balance: 'BALANCED' | 'UNEVEN' | 'OVERLOADED'
  }
}

// ---- Exported types for UI components ----

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface EquipmentInsight {
  equipmentId: string
  equipmentName: string
  equipmentCode: string
  healthScore: number
  riskLevel: RiskLevel
  nextPredictedFailure: string | null
  recommendations: string[]
}

export interface AnomalyItem {
  id: string
  equipmentName: string
  equipmentCode: string
  severity: 'WARNING' | 'CRITICAL'
  description: string
}

export interface KpiTrend {
  label: string
  value: string
  unit?: string
  trend: 'up' | 'down' | 'stable'
  trendValue: string
}

export interface AIInsightsData {
  generatedAt: string
  equipment: EquipmentInsight[]
  anomalies: AnomalyItem[]
  weeklySummary: { highlights: string[]; warnings: string[]; recommendations: string[] }
  kpiTrends: KpiTrend[]
  error?: string
}

// ---- getAIInsights ----

export async function getAIInsights() {
  try {
    const { supabase, orgId } = await getAuthenticatedContext()

    // Check AI rate limit
    const rateLimit = await checkAIRateLimit(orgId)
    if (!rateLimit.allowed) {
      return {
        generatedAt: new Date().toISOString(),
        equipment: [],
        anomalies: [],
        weeklySummary: { highlights: [], warnings: [], recommendations: [] },
        kpiTrends: [],
        error: `Limite IA atteinte (${PLANS.FREE.aiCallsPerWeek}/semaine). Passez au plan Pro pour un accès illimité.`,
      }
    }

    // Fetch equipment with aggregated intervention data
    const [
      { data: equipment },
      { data: workOrders },
      { data: interventions },
    ] = await Promise.all([
      supabase
        .from('equipment')
        .select('id, code, designation, status, criticality, hours_counter, commission_date, last_revision, next_revision, total_main_cost, rated_power_kw')
        .eq('org_id', orgId),
      supabase
        .from('work_orders')
        .select('id, code, type, status, priority, description, cause, equipment_id, actual_duration, created_at, completed_at')
        .eq('org_id', orgId),
      supabase
        .from('interventions')
        .select('id, equipment_id, actions, root_cause, duration, started_at, completed_at')
        .eq('org_id', orgId),
    ])

    if (!equipment || equipment.length === 0) {
      return { success: true, insights: [], message: 'Aucun équipement trouvé.' }
    }

    // Build enriched equipment data for the prompt
    const enrichedEquipment = equipment.map(eq => {
      const eqWorkOrders = (workOrders || []).filter(wo => wo.equipment_id === eq.id)
      const eqInterventions = (interventions || []).filter(iv => iv.equipment_id === eq.id)
      const correctiveOTs = eqWorkOrders.filter(wo => wo.type === 'CORRECTIVE')
      const preventiveOTs = eqWorkOrders.filter(wo => wo.type === 'PREVENTIVE')
      const completedInterventions = eqInterventions.filter(iv => iv.completed_at)
      const avgRepairDuration = completedInterventions.length > 0
        ? completedInterventions.reduce((sum, iv) => sum + iv.duration, 0) / completedInterventions.length
        : null
      const lastIntervention = eqInterventions
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0]
      const recentCauses = eqInterventions
        .filter(iv => iv.root_cause)
        .slice(0, 10)
        .map(iv => iv.root_cause as string)

      return {
        id: eq.id,
        code: eq.code,
        designation: eq.designation,
        status: eq.status,
        criticality: eq.criticality,
        hours_counter: eq.hours_counter,
        commission_date: eq.commission_date,
        last_revision: eq.last_revision,
        next_revision: eq.next_revision,
        total_main_cost: eq.total_main_cost,
        rated_power_kw: eq.rated_power_kw,
        interventions_count: eqInterventions.length,
        corrective_count: correctiveOTs.length,
        preventive_count: preventiveOTs.length,
        avg_repair_duration: avgRepairDuration,
        last_intervention_date: lastIntervention?.started_at || null,
        recent_causes: recentCauses,
      }
    })

    const prompt = buildEquipmentHealthPrompt(enrichedEquipment)
    const result = await geminiModelJSON.generateContent(prompt)
    const responseText = result.response.text()
    const insights: AIInsightResult[] = JSON.parse(responseText)

    // Store each insight in the ai_insights table
    const insightRows = insights.map(insight => {
      const eq = equipment.find(e => e.id === insight.equipment_id)
      const severity = insight.risk_level === 'CRITICAL' ? 'CRITICAL'
        : insight.risk_level === 'HIGH' ? 'WARNING'
        : 'INFO'

      return {
        org_id: orgId,
        type: 'EQUIPMENT_HEALTH',
        title: `Santé de ${eq?.code || 'Équipement'}: ${insight.health_score}/100`,
        content: JSON.stringify(insight),
        equipment_ids: [insight.equipment_id],
        severity,
        model_version: 'gemini-2.0-flash',
      }
    })

    if (insightRows.length > 0) {
      await supabase.from('ai_insights').insert(insightRows)
    }

    return { success: true, insights }
  } catch (error) {
    console.error('[AI] getAIInsights error:', error)
    return {
      success: false,
      insights: [],
      error: 'Impossible de générer les insights IA. Veuillez réessayer.',
    }
  }
}

// ---- getEquipmentPrediction ----

export async function getEquipmentPrediction(equipmentId: string) {
  try {
    const { supabase, orgId } = await getAuthenticatedContext()

    const [
      { data: equipment },
      { data: workOrders },
      { data: interventions },
      { data: meterReadings },
    ] = await Promise.all([
      supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .eq('org_id', orgId)
        .single(),
      supabase
        .from('work_orders')
        .select('id, code, type, status, priority, description, cause, actual_duration, parts_cost, labor_cost, created_at, completed_at')
        .eq('org_id', orgId)
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('interventions')
        .select('id, actions, root_cause, duration, parts_cost, labor_cost, started_at, completed_at')
        .eq('org_id', orgId)
        .eq('equipment_id', equipmentId)
        .order('started_at', { ascending: false })
        .limit(50),
      supabase
        .from('meter_readings')
        .select('type, value, read_at')
        .eq('org_id', orgId)
        .eq('equipment_id', equipmentId)
        .order('read_at', { ascending: false })
        .limit(100),
    ])

    if (!equipment) {
      return { success: false, prediction: null, error: 'Équipement non trouvé.' }
    }

    const correctiveOTs = (workOrders || []).filter(wo => wo.type === 'CORRECTIVE')
    const completedInterventions = (interventions || []).filter(iv => iv.completed_at)
    const avgRepairDuration = completedInterventions.length > 0
      ? completedInterventions.reduce((sum, iv) => sum + iv.duration, 0) / completedInterventions.length
      : null
    const recentCauses = (interventions || [])
      .filter(iv => iv.root_cause)
      .slice(0, 10)
      .map(iv => iv.root_cause as string)

    const enrichedEquipment = [{
      id: equipment.id,
      code: equipment.code,
      designation: equipment.designation,
      status: equipment.status,
      criticality: equipment.criticality,
      hours_counter: equipment.hours_counter,
      commission_date: equipment.commission_date,
      last_revision: equipment.last_revision,
      next_revision: equipment.next_revision,
      total_main_cost: equipment.total_main_cost,
      rated_power_kw: equipment.rated_power_kw,
      interventions_count: (interventions || []).length,
      corrective_count: correctiveOTs.length,
      preventive_count: (workOrders || []).filter(wo => wo.type === 'PREVENTIVE').length,
      avg_repair_duration: avgRepairDuration,
      last_intervention_date: (interventions || [])[0]?.started_at || null,
      recent_causes: recentCauses,
    }]

    // Add meter readings context to the prompt
    const meterContext = (meterReadings || []).length > 0
      ? `\n\nRELEVÉS COMPTEURS RÉCENTS :\n${JSON.stringify(meterReadings, null, 2)}`
      : ''

    const prompt = buildEquipmentHealthPrompt(enrichedEquipment) + meterContext +
      '\n\nEn plus du diagnostic de santé, ajoute un champ "prediction" avec : predicted_failure_date (ISO string ou null), confidence (0-1), reasoning (string en français).'

    const result = await geminiModelJSON.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)
    const prediction = Array.isArray(parsed) ? parsed[0] : parsed

    // Store the prediction
    const predictionRow = {
      org_id: orgId,
      equipment_id: equipmentId,
      prediction_type: 'FAILURE' as const,
      confidence: prediction.prediction?.confidence ?? (prediction.health_score ? (100 - prediction.health_score) / 100 : 0.5),
      predicted_date: prediction.prediction?.predicted_failure_date || null,
      details: prediction,
      model_version: 'gemini-2.0-flash',
    }

    await supabase.from('ai_predictions').insert(predictionRow)

    return { success: true, prediction }
  } catch (error) {
    console.error('[AI] getEquipmentPrediction error:', error)
    return {
      success: false,
      prediction: null,
      error: 'Impossible de générer la prédiction. Veuillez réessayer.',
    }
  }
}

// ---- getRootCauseAnalysis ----

export async function getRootCauseAnalysis(workOrderId: string) {
  try {
    const { supabase, orgId } = await getAuthenticatedContext()

    // Fetch the work order
    const { data: workOrder } = await supabase
      .from('work_orders')
      .select('id, code, type, status, priority, description, cause, equipment_id, created_at')
      .eq('id', workOrderId)
      .eq('org_id', orgId)
      .single()

    if (!workOrder) {
      return { success: false, analysis: null, error: 'Ordre de travail non trouvé.' }
    }

    if (!workOrder.equipment_id) {
      return { success: false, analysis: null, error: 'Aucun équipement associé à cet OT.' }
    }

    // Fetch equipment details + past history on the same equipment
    const [
      { data: equipment },
      { data: pastInterventions },
      { data: pastWorkOrders },
    ] = await Promise.all([
      supabase
        .from('equipment')
        .select('id, code, designation, type, group_name, hours_counter, status, criticality')
        .eq('id', workOrder.equipment_id)
        .single(),
      supabase
        .from('interventions')
        .select('id, actions, root_cause, duration, parts_cost, labor_cost, started_at, completed_at')
        .eq('org_id', orgId)
        .eq('equipment_id', workOrder.equipment_id)
        .order('started_at', { ascending: false })
        .limit(30),
      supabase
        .from('work_orders')
        .select('id, code, type, status, priority, description, cause, estimated_duration, actual_duration, parts_cost, labor_cost, created_at, completed_at')
        .eq('org_id', orgId)
        .eq('equipment_id', workOrder.equipment_id)
        .neq('id', workOrderId)
        .order('created_at', { ascending: false })
        .limit(30),
    ])

    if (!equipment) {
      return { success: false, analysis: null, error: 'Équipement non trouvé.' }
    }

    const prompt = buildRootCausePrompt(
      {
        code: equipment.code,
        designation: equipment.designation,
        type: equipment.type || 'NON_CAPOTE',
        group_name: equipment.group_name || 'ELECTROGEN',
        hours_counter: equipment.hours_counter || 0,
      },
      {
        description: workOrder.description,
        cause: workOrder.cause,
      },
      (pastInterventions || []).map(iv => ({
        id: iv.id,
        actions: iv.actions,
        root_cause: iv.root_cause,
        duration: iv.duration,
        started_at: iv.started_at,
        completed_at: iv.completed_at,
        parts_cost: iv.parts_cost || 0,
        labor_cost: iv.labor_cost || 0,
      })),
      (pastWorkOrders || []).map(wo => ({
        id: wo.id,
        code: wo.code,
        type: wo.type,
        status: wo.status,
        priority: wo.priority,
        description: wo.description,
        cause: wo.cause,
        estimated_duration: wo.estimated_duration,
        actual_duration: wo.actual_duration,
        parts_cost: wo.parts_cost || 0,
        labor_cost: wo.labor_cost || 0,
        created_at: wo.created_at,
        completed_at: wo.completed_at,
      }))
    )

    const result = await geminiModelJSON.generateContent(prompt)
    const responseText = result.response.text()
    const analysis: RootCauseResult = JSON.parse(responseText)

    return { success: true, analysis }
  } catch (error) {
    console.error('[AI] getRootCauseAnalysis error:', error)
    return {
      success: false,
      analysis: null,
      error: "Impossible de générer l'analyse de cause racine. Veuillez réessayer.",
    }
  }
}

// ---- getWeeklySummary ----

export async function getWeeklySummary() {
  try {
    const { supabase, orgId } = await getAuthenticatedContext()

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Sunday
    weekEnd.setHours(23, 59, 59, 999)

    const weekStartISO = weekStart.toISOString()
    const weekEndISO = weekEnd.toISOString()

    // Fetch all relevant data for the week
    const [
      { data: weekWorkOrders },
      { data: allEquipment },
      { data: statusHistory },
      { data: members },
    ] = await Promise.all([
      supabase
        .from('work_orders')
        .select('id, code, type, status, priority, description, cause, equipment_id, technician_id, actual_duration, parts_cost, labor_cost, sla_breached_at, created_at, completed_at')
        .eq('org_id', orgId)
        .gte('created_at', weekStartISO)
        .lte('created_at', weekEndISO),
      supabase
        .from('equipment')
        .select('id, code, designation, status, next_revision')
        .eq('org_id', orgId),
      supabase
        .from('ot_status_history')
        .select('work_order_id, from_status, to_status, changed_at')
        .eq('org_id', orgId)
        .gte('changed_at', weekStartISO)
        .lte('changed_at', weekEndISO),
      supabase
        .from('org_members')
        .select('user_id, name, role')
        .eq('org_id', orgId)
        .in('role', ['TECHNICIAN', 'ADMIN', 'OWNER'])
        .eq('is_active', true),
    ])

    const ots = weekWorkOrders || []
    const completedOTs = ots.filter(wo => wo.status === 'COMPLETED' && wo.completed_at)
    const avgCompletionTime = completedOTs.length > 0
      ? completedOTs.reduce((sum, wo) => sum + (wo.actual_duration || 0), 0) / completedOTs.length
      : null

    // Equipment status changes are tracked at OT level, not equipment level directly
    const equipmentStatusChanges: { code: string; from: string; to: string }[] = []

    // Top failing equipment
    const failureCounts: Record<string, number> = {}
    for (const wo of ots.filter(o => o.type === 'CORRECTIVE')) {
      if (wo.equipment_id) {
        failureCounts[wo.equipment_id] = (failureCounts[wo.equipment_id] || 0) + 1
      }
    }
    const topFailing = Object.entries(failureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([eqId, count]) => {
        const eq = (allEquipment || []).find(e => e.id === eqId)
        return {
          code: eq?.code || 'N/A',
          designation: eq?.designation || 'N/A',
          failure_count: count,
        }
      })

    // Technician workloads
    const techWorkloads = (members || [])
      .filter(m => m.role === 'TECHNICIAN')
      .map(m => ({
        name: m.name,
        completed: ots.filter(wo => wo.technician_id === m.user_id && wo.status === 'COMPLETED').length,
        in_progress: ots.filter(wo => wo.technician_id === m.user_id && ['ASSIGNED', 'IN_PROGRESS'].includes(wo.status)).length,
      }))

    // SLA breaches
    const slaBreaches = ots.filter(wo => wo.sla_breached_at).length

    // Overdue revisions
    const overdue = (allEquipment || [])
      .filter(eq => eq.next_revision && new Date(eq.next_revision) < now)
      .map(eq => ({
        code: eq.code,
        designation: eq.designation,
        next_revision: eq.next_revision!,
      }))

    const summaryData = {
      week_start: weekStartISO.split('T')[0],
      week_end: weekEndISO.split('T')[0],
      total_ots_created: ots.length,
      total_ots_completed: completedOTs.length,
      total_ots_pending: ots.filter(wo => !['COMPLETED', 'CANCELLED'].includes(wo.status)).length,
      urgent_ots: ots.filter(wo => wo.priority === 'URGENT').length,
      corrective_count: ots.filter(wo => wo.type === 'CORRECTIVE').length,
      preventive_count: ots.filter(wo => wo.type === 'PREVENTIVE').length,
      avg_completion_time_hours: avgCompletionTime,
      equipment_status_changes: equipmentStatusChanges,
      top_failing_equipment: topFailing,
      total_parts_cost: ots.reduce((sum, wo) => sum + (wo.parts_cost || 0), 0),
      total_labor_cost: ots.reduce((sum, wo) => sum + (wo.labor_cost || 0), 0),
      technician_workloads: techWorkloads,
      sla_breaches: slaBreaches,
      overdue_revisions: overdue,
    }

    const prompt = buildWeeklySummaryPrompt(summaryData)
    const result = await geminiModelJSON.generateContent(prompt)
    const responseText = result.response.text()
    const summary: WeeklySummaryResult = JSON.parse(responseText)

    return { success: true, summary }
  } catch (error) {
    console.error('[AI] getWeeklySummary error:', error)
    return {
      success: false,
      summary: null,
      error: 'Impossible de générer le résumé hebdomadaire. Veuillez réessayer.',
    }
  }
}

// ---- chatWithAI ----

export async function chatWithAI(messages: { role: string; content: string }[]) {
  try {
    // Auth check — enforce login even for chat
    await getAuthenticatedContext()

    if (!messages || messages.length === 0) {
      return { success: false, response: '', error: 'Aucun message fourni.' }
    }

    // Build the full prompt with system context and conversation
    const prompt = buildChatPrompt(messages)

    const result = await geminiModel.generateContent(prompt)
    const responseText = result.response.text()

    return { success: true, response: responseText }
  } catch (error) {
    console.error('[AI] chatWithAI error:', error)
    return {
      success: false,
      response: '',
      error: "L'assistant IA est temporairement indisponible. Veuillez réessayer.",
    }
  }
}

// ---- getCachedInsights ----

export async function getCachedInsights(): Promise<AIInsightsData> {
  const empty: AIInsightsData = {
    generatedAt: new Date().toISOString(),
    equipment: [],
    anomalies: [],
    weeklySummary: { highlights: [], warnings: [], recommendations: [] },
    kpiTrends: [],
  }

  try {
    const { supabase, orgId } = await getAuthenticatedContext()

    // Fetch equipment list for name mapping
    const { data: equipmentList } = await supabase
      .from('equipment')
      .select('id, code, designation, status, hours_counter')
      .eq('org_id', orgId)

    const eqMap = new Map((equipmentList || []).map(e => [e.id, e]))

    if (!equipmentList || equipmentList.length === 0) {
      return empty
    }

    // Generate fresh AI insights
    let rawInsights: AIInsightResult[] = []
    try {
      const result = await getAIInsights()
      if (result.success && result.insights) {
        rawInsights = result.insights
      }
    } catch (err) {
      console.error('[AI] Gemini call failed, using fallback:', err)
    }

    // If Gemini failed, generate basic heuristic insights
    if (rawInsights.length === 0) {
      rawInsights = (equipmentList || []).map(eq => {
        const hoursScore = eq.hours_counter > 5000 ? 40 : eq.hours_counter > 2000 ? 65 : 85
        const statusBonus = eq.status === 'OPERATIONAL' ? 10 : eq.status === 'DEGRADED' ? -15 : -30
        const score = Math.max(0, Math.min(100, hoursScore + statusBonus))
        const risk = score >= 80 ? 'LOW' : score >= 50 ? 'MEDIUM' : score >= 30 ? 'HIGH' : 'CRITICAL'
        return {
          equipment_id: eq.id,
          health_score: score,
          risk_level: risk as AIInsightResult['risk_level'],
          next_failure_estimate: risk === 'LOW' ? null : Math.round((100 - score) * 1.5),
          recommendations: [
            score < 70 ? 'Planifier une inspection preventive' : 'Continuer la maintenance reguliere',
            eq.hours_counter > 3000 ? 'Verifier les composants d\'usure' : 'Compteur d\'heures normal',
          ],
          anomalies: eq.status === 'DEGRADED' ? ['Equipement en mode degrade'] : [],
        }
      })
    }

    // Map to EquipmentInsight shape
    const equipment: EquipmentInsight[] = rawInsights.map(insight => {
      const eq = eqMap.get(insight.equipment_id)
      const failureDays = insight.next_failure_estimate
      const failureDate = failureDays
        ? new Date(Date.now() + failureDays * 86400000).toISOString()
        : null
      return {
        equipmentId: insight.equipment_id,
        equipmentName: eq?.designation || 'Equipement inconnu',
        equipmentCode: eq?.code || 'N/A',
        healthScore: insight.health_score,
        riskLevel: insight.risk_level,
        nextPredictedFailure: failureDate,
        recommendations: insight.recommendations || [],
      }
    })

    // Extract anomalies
    const anomalies: AnomalyItem[] = rawInsights
      .flatMap(insight => {
        const eq = eqMap.get(insight.equipment_id)
        return (insight.anomalies || []).map((desc, i) => ({
          id: `${insight.equipment_id}-${i}`,
          equipmentName: eq?.designation || 'Equipement',
          equipmentCode: eq?.code || 'N/A',
          severity: (insight.risk_level === 'CRITICAL' ? 'CRITICAL' : 'WARNING') as AnomalyItem['severity'],
          description: desc,
        }))
      })

    // Fetch work order stats for KPI trends
    const { data: workOrders } = await supabase
      .from('work_orders')
      .select('status, actual_duration, priority, created_at, completed_at')
      .eq('org_id', orgId)

    const wos = workOrders || []
    const activeOTs = wos.filter(wo => !['COMPLETED', 'CANCELLED'].includes(wo.status)).length
    const completed = wos.filter(wo => wo.status === 'COMPLETED' && wo.actual_duration)
    const mttr = completed.length > 0
      ? (completed.reduce((s, wo) => s + (wo.actual_duration || 0), 0) / completed.length).toFixed(1)
      : '0'
    const operational = (equipmentList || []).filter(e => e.status === 'OPERATIONAL').length
    const availability = equipmentList.length > 0
      ? Math.round((operational / equipmentList.length) * 100)
      : 100

    const kpiTrends: KpiTrend[] = [
      { label: 'MTTR Moyen', value: mttr, unit: 'h', trend: 'stable', trendValue: 'stable' },
      { label: 'Disponibilite', value: `${availability}`, unit: '%', trend: availability >= 80 ? 'up' : 'down', trendValue: availability >= 80 ? 'Bon' : 'A surveiller' },
      { label: 'OT Actifs', value: `${activeOTs}`, trend: activeOTs > 5 ? 'down' : 'stable', trendValue: activeOTs > 5 ? 'Charge elevee' : 'Normal' },
    ]

    // Simple weekly summary (no second Gemini call to keep it fast)
    const weeklySummary = {
      highlights: equipment.filter(e => e.healthScore >= 80).map(e => `${e.equipmentName} en bonne sante (${e.healthScore}%)`).slice(0, 3),
      warnings: equipment.filter(e => e.healthScore < 50).map(e => `${e.equipmentName} necessite une attention immediate (${e.healthScore}%)`),
      recommendations: rawInsights.flatMap(i => i.recommendations).slice(0, 4),
    }

    return {
      generatedAt: new Date().toISOString(),
      equipment,
      anomalies,
      weeklySummary,
      kpiTrends,
    }
  } catch (error) {
    console.error('[AI] getCachedInsights error:', error)
    return { ...empty, error: 'Impossible de generer les insights IA.' }
  }
}

import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import {
  styles,
  PDFHeader,
  PDFFooter,
  PDFTable,
  formatCurrency,
  statusLabel,
  typeLabel,
} from './shared'

const MONTH_NAMES = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

export type MonthlyReportDocumentProps = {
  orgName: string
  month: number // 1-12
  year: number
  workOrders: {
    id: string
    code: string
    type: string
    status: string
    priority: string
    parts_cost: number
    labor_cost: number
    actual_duration: number | null
    started_at: string | null
    completed_at: string | null
    created_at: string
    technician_id: string | null
    equipment_id: string | null
    equipment: { code: string; designation: string } | null
  }[]
  equipment: {
    id: string
    code: string
    designation: string
    total_main_cost: number
    status: string
    hours_counter: number
  }[]
  members: {
    user_id: string
    name: string
    role: string
  }[]
}

export function MonthlyReportDocument({
  orgName,
  month,
  year,
  workOrders,
  equipment,
  members,
}: MonthlyReportDocumentProps) {
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`

  // --- KPI calculations ---
  const totalOTs = workOrders.length
  const completed = workOrders.filter((wo) => wo.status === 'COMPLETED')
  const completedCount = completed.length

  // MTTR: mean time to repair (hours) for completed OTs with actual_duration
  const durations = completed
    .map((wo) => wo.actual_duration)
    .filter((d): d is number => d != null && d > 0)
  const mttr = durations.length > 0
    ? (durations.reduce((s, d) => s + d, 0) / durations.length).toFixed(1)
    : '—'

  // Availability: completed / total (simplified)
  const availability = totalOTs > 0
    ? ((completedCount / totalOTs) * 100).toFixed(1)
    : '—'

  // Preventive rate
  const preventiveCount = workOrders.filter((wo) => wo.type === 'PREVENTIVE').length
  const preventiveRate = totalOTs > 0
    ? ((preventiveCount / totalOTs) * 100).toFixed(1)
    : '—'

  // --- Interventions by type ---
  const typeGroups: Record<string, number> = {}
  for (const wo of workOrders) {
    typeGroups[wo.type] = (typeGroups[wo.type] || 0) + 1
  }

  // --- Interventions by status ---
  const statusGroups: Record<string, number> = {}
  for (const wo of workOrders) {
    statusGroups[wo.status] = (statusGroups[wo.status] || 0) + 1
  }

  // --- Top 5 equipment by cost ---
  const equipCostMap: Record<string, { code: string; designation: string; cost: number }> = {}
  for (const wo of workOrders) {
    if (!wo.equipment_id) continue
    const cost = (wo.parts_cost || 0) + (wo.labor_cost || 0)
    if (!equipCostMap[wo.equipment_id]) {
      const eq = equipment.find((e) => e.id === wo.equipment_id)
      equipCostMap[wo.equipment_id] = {
        code: eq?.code || wo.equipment?.code || '—',
        designation: eq?.designation || wo.equipment?.designation || '—',
        cost: 0,
      }
    }
    equipCostMap[wo.equipment_id].cost += cost
  }
  const topEquip = Object.values(equipCostMap)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)

  // --- Team performance ---
  const techMap: Record<string, { name: string; completed: number; totalDuration: number }> = {}
  for (const wo of completed) {
    if (!wo.technician_id) continue
    if (!techMap[wo.technician_id]) {
      const m = members.find((mem) => mem.user_id === wo.technician_id)
      techMap[wo.technician_id] = {
        name: m?.name || 'Inconnu',
        completed: 0,
        totalDuration: 0,
      }
    }
    techMap[wo.technician_id].completed += 1
    techMap[wo.technician_id].totalDuration += wo.actual_duration || 0
  }
  const teamPerf = Object.values(techMap)
    .sort((a, b) => b.completed - a.completed)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          companyName={orgName}
          docTitle="RAPPORT MENSUEL DE MAINTENANCE"
          docRef={`RM-${year}-${String(month).padStart(2, '0')}`}
          date={monthLabel}
        />

        {/* Resume KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume des indicateurs (KPIs)</Text>
          <PDFTable
            headers={[
              { label: 'Indicateur', width: '50%' },
              { label: 'Valeur', width: '50%' },
            ]}
            rows={[
              ['Total OTs', totalOTs],
              ['OTs termines', completedCount],
              ['MTTR (temps moyen de reparation)', `${mttr}h`],
              ['Taux de disponibilite', `${availability}%`],
              ['Taux de preventif', `${preventiveRate}%`],
            ]}
          />
        </View>

        {/* Interventions par type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interventions par type</Text>
          <PDFTable
            headers={[
              { label: 'Type', width: '60%' },
              { label: 'Nombre', width: '40%' },
            ]}
            rows={Object.entries(typeGroups).map(([t, count]) => [
              typeLabel(t),
              count,
            ])}
          />
        </View>

        {/* Interventions par statut */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interventions par statut</Text>
          <PDFTable
            headers={[
              { label: 'Statut', width: '60%' },
              { label: 'Nombre', width: '40%' },
            ]}
            rows={Object.entries(statusGroups).map(([s, count]) => [
              statusLabel(s),
              count,
            ])}
          />
        </View>

        {/* Top 5 equipements par cout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 equipements par cout</Text>
          <PDFTable
            headers={[
              { label: 'Code', width: '20%' },
              { label: 'Designation', width: '50%' },
              { label: 'Cout total', width: '30%' },
            ]}
            rows={topEquip.map((e) => [e.code, e.designation, formatCurrency(e.cost)])}
          />
        </View>

        {/* Performance equipe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance equipe</Text>
          <PDFTable
            headers={[
              { label: 'Technicien', width: '40%' },
              { label: 'OTs termines', width: '30%' },
              { label: 'Duree moy.', width: '30%' },
            ]}
            rows={teamPerf.map((t) => [
              t.name,
              t.completed,
              t.completed > 0
                ? `${(t.totalDuration / t.completed).toFixed(1)}h`
                : '—',
            ])}
          />
        </View>

        <PDFFooter />
      </Page>
    </Document>
  )
}

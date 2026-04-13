'use client'

import { motion } from 'framer-motion'
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Cog,
} from 'lucide-react'
import { KPICard } from './kpi-card'
import { RecentOTTable } from './recent-ot-table'
import { TeamWorkload } from './team-workload'
import { QuickActions } from './quick-actions'
import { EquipmentStatusGrid } from './equipment-status-grid'

type DashboardData = {
  kpis: {
    activeOTs: number
    urgentOTs: number
    completedThisMonth: number
    mttr: number
    availability: number
    totalEquipment: number
  }
  recentOTs: Array<{
    id: string
    code: string
    status: string
    priority: string
    type: string
    description: string
    created_at: string
    equipment_code: string | null
    equipment_designation: string | null
  }>
  techWorkload: Array<{
    name: string
    role: string
    activeOTs: number
    totalHours: number
    capacity: number
  }>
  equipmentByStatus: {
    OPERATIONAL: number
    DEGRADED: number
    BROKEN: number
    IN_REVISION: number
    REVISION_DUE: number
  }
  equipmentGrid: Array<{
    id: string
    code: string
    designation: string
    status: string
  }>
  urgentUnassigned: number
}

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export function DashboardClient({
  userName,
  today,
  data,
}: {
  userName: string
  today: string
  data: DashboardData
}) {
  const { kpis } = data

  const kpiCards = [
    {
      icon: 'ClipboardList',
      value: kpis.activeOTs,
      label: 'OT actifs',
      color: 'blue',
      subtitle: data.urgentUnassigned > 0 ? `${data.urgentUnassigned} urgent${data.urgentUnassigned > 1 ? 's' : ''} non affecte${data.urgentUnassigned > 1 ? 's' : ''}` : undefined,
    },
    {
      icon: 'AlertTriangle',
      value: kpis.urgentOTs,
      label: 'Urgents',
      color: 'red',
    },
    {
      icon: 'CheckCircle',
      value: kpis.completedThisMonth,
      label: 'Termines ce mois',
      color: 'green',
    },
    {
      icon: 'Clock',
      value: kpis.mttr,
      label: 'MTTR moyen',
      suffix: 'h',
      color: 'orange',
    },
    {
      icon: 'Activity',
      value: kpis.availability,
      label: 'Disponibilite',
      suffix: '%',
      color: 'green',
    },
    {
      icon: 'Settings',
      value: kpis.totalEquipment,
      label: 'Equipements',
      color: 'blue',
    },
  ]

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome header */}
      <motion.div variants={fadeInUp}>
        <h1 className="font-heading text-2xl text-stone-900">
          Bonjour, {userName}
        </h1>
        <p className="mt-1 text-sm text-stone-500 capitalize">{today}</p>
      </motion.div>

      {/* KPI row */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {kpiCards.map((card) => (
          <motion.div key={card.label} variants={fadeInUp}>
            <KPICard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column (2/3) */}
        <motion.div
          variants={stagger}
          className="space-y-6 lg:col-span-2"
        >
          <motion.div variants={fadeInUp}>
            <RecentOTTable orders={data.recentOTs} />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <EquipmentStatusGrid
              byStatus={data.equipmentByStatus}
              equipmentGrid={data.equipmentGrid}
            />
          </motion.div>
        </motion.div>

        {/* Right column (1/3) */}
        <motion.div
          variants={stagger}
          className="space-y-6"
        >
          <motion.div variants={fadeInUp}>
            <TeamWorkload team={data.techWorkload} />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <QuickActions />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Clock,
  Activity,
  ShieldCheck,
  ClipboardList,
  FileText,
  Table,
  Lock,
} from 'lucide-react'
import { KPICard } from './kpi-card'
import { CorrectiveVsPreventiveChart } from './charts/corrective-vs-preventive'
import { MTTRTrendChart } from './charts/mttr-trend'
import { EquipmentAvailabilityChart } from './charts/equipment-availability'
import { CostDistributionChart } from './charts/cost-distribution'
import { cn } from '@/lib/utils'
import type { Period } from '@/actions/reports'

type ReportData = {
  kpis: {
    mttr: number
    availability: number
    preventiveRate: number
    totalOTs: number
    completedOTs: number
    correctiveCount: number
    preventiveCount: number
  }
  correctiveVsPreventive: Array<{
    month: string
    corrective: number
    preventive: number
  }>
  mttrTrend: Array<{ month: string; mttr: number }>
  equipAvailability: Array<{
    name: string
    designation: string
    availability: number
    cost: number
  }>
  costDistribution: Array<{ name: string; value: number }>
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Annee' },
]

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

function PeriodSelector({
  current,
}: {
  current: Period
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSelect(period: Period) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`/rapports?${params.toString()}`)
  }

  return (
    <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => handleSelect(p.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
            current === p.value
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-stone-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function ReportsClient({
  data,
  period,
  orgPlan,
}: {
  data: ReportData
  period: Period
  orgPlan: string
}) {
  const isPro = orgPlan === 'PRO' || orgPlan === 'ENTERPRISE'

  const kpiCards = [
    {
      icon: 'Clock',
      value: data.kpis.mttr,
      label: 'MTTR moyen',
      suffix: 'h',
      color: 'orange',
      subtitle: `${data.kpis.completedOTs} OT termines`,
    },
    {
      icon: 'Activity',
      value: data.kpis.availability,
      label: 'Disponibilite',
      suffix: '%',
      color: 'green',
    },
    {
      icon: 'Shield',
      value: data.kpis.preventiveRate,
      label: 'Taux preventif',
      suffix: '%',
      color: 'blue',
      subtitle: `${data.kpis.preventiveCount} preventifs / ${data.kpis.correctiveCount} correctifs`,
    },
    {
      icon: 'ClipboardList',
      value: data.kpis.totalOTs,
      label: 'Total OT',
      color: 'violet',
      subtitle: `${data.kpis.completedOTs} termines`,
    },
  ]

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-heading text-2xl text-stone-900">
            Rapports &amp; KPI
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Suivi de la performance de maintenance
          </p>
        </div>
        <PeriodSelector current={period} />
      </motion.div>

      {/* KPI row */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((card) => (
          <motion.div key={card.label} variants={fadeInUp}>
            <KPICard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <motion.div variants={fadeInUp}>
          <ChartCard
            title="Correctif vs Preventif"
            subtitle="Repartition mensuelle des OT par type"
          >
            <CorrectiveVsPreventiveChart
              data={data.correctiveVsPreventive}
            />
          </ChartCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ChartCard
            title="Tendance MTTR"
            subtitle="Temps moyen de reparation (heures)"
          >
            <MTTRTrendChart data={data.mttrTrend} />
          </ChartCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ChartCard
            title="Disponibilite par equipement"
            subtitle="Top 10 equipements par cout de maintenance"
          >
            <EquipmentAvailabilityChart data={data.equipAvailability} />
          </ChartCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ChartCard
            title="Repartition des couts"
            subtitle="Top 5 equipements par cout total"
          >
            <CostDistributionChart data={data.costDistribution} />
          </ChartCard>
        </motion.div>
      </motion.div>

      {/* Export buttons */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3">
        <button
          disabled={!isPro}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            isPro
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'cursor-not-allowed bg-stone-100 text-stone-400'
          )}
        >
          <FileText className="size-4" />
          Exporter PDF
          {!isPro && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">
              <Lock className="size-2.5" />
              Pro
            </span>
          )}
        </button>
        <button
          disabled={!isPro}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            isPro
              ? 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              : 'cursor-not-allowed bg-stone-100 text-stone-400'
          )}
        >
          <Table className="size-4" />
          Exporter Excel
          {!isPro && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">
              <Lock className="size-2.5" />
              Pro
            </span>
          )}
        </button>
      </motion.div>
    </motion.div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Brain,
  RefreshCw,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Zap,
  CheckCircle,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AIInsightsData, RiskLevel, EquipmentInsight } from '@/actions/ai'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  LOW: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Faible' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moyen' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Eleve' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critique' },
}

function HealthGauge({ score }: { score: number }) {
  const radius = 36
  const stroke = 6
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color =
    score >= 80
      ? 'stroke-emerald-500'
      : score >= 50
        ? 'stroke-amber-500'
        : 'stroke-red-500'
  const textColor =
    score >= 80
      ? 'text-emerald-600'
      : score >= 50
        ? 'text-amber-600'
        : 'text-red-600'

  return (
    <div className="relative flex items-center justify-center">
      <svg width={88} height={88} className="-rotate-90">
        <circle
          cx={44}
          cy={44}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-stone-200"
        />
        <motion.circle
          cx={44}
          cy={44}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={color}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className={`absolute text-lg font-bold ${textColor}`}>
        {score}%
      </span>
    </div>
  )
}

function EquipmentCard({ equipment }: { equipment: EquipmentInsight }) {
  const risk = RISK_COLORS[equipment.riskLevel]
  const failureDate = equipment.nextPredictedFailure
    ? formatDistanceToNow(new Date(equipment.nextPredictedFailure), { locale: fr, addSuffix: true })
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-4 text-stone-400" />
          <span className="truncate">{equipment.equipmentName}</span>
        </CardTitle>
        <CardAction>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${risk.bg} ${risk.text}`}>
            {risk.label}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <HealthGauge score={equipment.healthScore} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs text-stone-500">
              Code : <span className="font-mono font-medium text-stone-700">{equipment.equipmentCode}</span>
            </p>
            {failureDate && (
              <p className="text-xs text-stone-500">
                Panne prevue : <span className="font-medium text-stone-700">{failureDate}</span>
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          {equipment.recommendations.slice(0, 2).map((rec, i) => (
            <div key={i} className="flex gap-2 text-xs text-stone-600">
              <Lightbulb className="mt-0.5 size-3 shrink-0 text-blue-500" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-stone-100">
        <Brain className="size-8 text-stone-400" />
      </div>
      <h3 className="font-heading text-lg text-stone-900">Aucun equipement</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500">
        Ajoutez des equipements pour que l&apos;IA puisse generer des insights et des predictions.
      </p>
    </motion.div>
  )
}

export function InsightsClient({ data }: { data: AIInsightsData }) {
  const [insights, setInsights] = useState(data)
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/insights', { method: 'POST' })
        if (res.ok) {
          const fresh = await res.json()
          setInsights(fresh)
        }
      } catch {
        // silently fail — keep existing data
      }
    })
  }

  const generatedDate = insights.generatedAt ? new Date(insights.generatedAt) : null
  const timeAgo = generatedDate && !isNaN(generatedDate.getTime())
    ? formatDistanceToNow(generatedDate, { locale: fr, addSuffix: true })
    : 'à l\'instant'

  if (insights.equipment.length === 0) {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <Brain className="size-6 text-stone-400" />
          <h1 className="font-heading text-2xl text-stone-900">IA Insights</h1>
        </motion.div>
        <EmptyState />
      </motion.div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Brain className="size-6 text-stone-400" />
          <div>
            <h1 className="font-heading text-2xl text-stone-900">IA Insights</h1>
            <p className="text-sm text-stone-500">Derniere analyse : {timeAgo}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw className={`size-4 ${isPending ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </motion.div>

      {/* Anomalies */}
      {insights.anomalies.length > 0 && (
        <motion.div variants={stagger} className="space-y-3">
          <motion.div variants={fadeInUp} className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            <h2 className="font-heading text-base font-medium text-stone-900">
              Anomalies detectees ({insights.anomalies.length})
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {insights.anomalies.map((anomaly) => (
              <motion.div key={anomaly.id} variants={fadeInUp}>
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="flex items-start gap-3 pt-4">
                    <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      anomaly.severity === 'CRITICAL' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <AlertTriangle className={`size-4 ${
                        anomaly.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-900">
                          {anomaly.equipmentName}
                        </p>
                        <Badge variant={anomaly.severity === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs font-mono text-stone-500">{anomaly.equipmentCode}</p>
                      <p className="mt-1 text-xs text-stone-600">{anomaly.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Equipment Health Grid */}
      <motion.div variants={stagger} className="space-y-3">
        <motion.div variants={fadeInUp} className="flex items-center gap-2">
          <Activity className="size-4 text-blue-500" />
          <h2 className="font-heading text-base font-medium text-stone-900">
            Sante des equipements
          </h2>
        </motion.div>
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {insights.equipment.map((eq) => (
            <motion.div key={eq.equipmentId} variants={fadeInUp}>
              <EquipmentCard equipment={eq} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Weekly Summary + KPI Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Summary (2/3) */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                Resume hebdomadaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Highlights */}
              {insights.weeklySummary.highlights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    Points positifs
                  </p>
                  {insights.weeklySummary.highlights.map((item, i) => (
                    <div key={i} className="flex gap-2 text-sm text-stone-700">
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {insights.weeklySummary.warnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    Alertes
                  </p>
                  {insights.weeklySummary.warnings.map((item, i) => (
                    <div key={i} className="flex gap-2 text-sm text-stone-700">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {insights.weeklySummary.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    Recommandations
                  </p>
                  {insights.weeklySummary.recommendations.map((item, i) => (
                    <div key={i} className="flex gap-2 text-sm text-stone-700">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI Trends (1/3) */}
        <motion.div variants={stagger} className="space-y-4">
          <motion.div variants={fadeInUp} className="flex items-center gap-2">
            <Shield className="size-4 text-violet-500" />
            <h2 className="font-heading text-base font-medium text-stone-900">
              Tendances KPI
            </h2>
          </motion.div>
          {insights.kpiTrends.map((kpi) => (
            <motion.div key={kpi.label} variants={fadeInUp}>
              <Card size="sm">
                <CardContent className="flex items-center justify-between pt-3">
                  <div>
                    <p className="text-xs text-stone-500">{kpi.label}</p>
                    <p className="text-lg font-bold text-stone-900">
                      {kpi.value}
                      {kpi.unit && <span className="text-sm font-normal text-stone-400">{kpi.unit}</span>}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    kpi.trend === 'up'
                      ? 'bg-emerald-100 text-emerald-700'
                      : kpi.trend === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-stone-100 text-stone-600'
                  }`}>
                    {kpi.trend === 'up' && <TrendingUp className="size-3" />}
                    {kpi.trend === 'down' && <TrendingDown className="size-3" />}
                    {kpi.trend === 'stable' && <Minus className="size-3" />}
                    {kpi.trendValue}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

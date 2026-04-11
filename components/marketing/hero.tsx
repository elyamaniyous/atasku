'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react'

function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.8 + delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function MockDashboard() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main dashboard card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Activity className="size-4 text-zinc-950" />
            </div>
            <span className="font-semibold text-zinc-200 text-sm">
              Tableau de bord
            </span>
          </div>
          <span className="text-xs text-zinc-500">Temps r&eacute;el</span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'MTTR', value: '2.4h', color: 'text-green-400', icon: Clock },
            { label: 'OT actifs', value: '12', color: 'text-cyan-400', icon: Wrench },
            { label: 'Dispo.', value: '94%', color: 'text-amber-400', icon: BarChart3 },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl bg-zinc-800/50 p-3 text-center"
            >
              <kpi.icon className={`size-4 mx-auto mb-1 ${kpi.color}`} />
              <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] text-zinc-500 font-medium">
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mini task list */}
        <div className="space-y-2">
          {[
            {
              text: 'R\u00e9vision turbine #3',
              status: 'En cours',
              color: 'bg-cyan-500/10 text-cyan-400',
            },
            {
              text: 'Calibrage compteur A7',
              status: 'Planifi\u00e9',
              color: 'bg-amber-500/10 text-amber-400',
            },
            {
              text: 'Inspection panneau solaire',
              status: 'Termin\u00e9',
              color: 'bg-green-500/10 text-green-400',
            },
          ].map((task) => (
            <div
              key={task.text}
              className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2"
            >
              <span className="text-xs font-medium text-zinc-300">
                {task.text}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${task.color}`}
              >
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating AI insight card */}
      <FloatingCard
        className="absolute -top-4 -right-4 sm:-right-8 z-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 px-4 py-3 max-w-48"
        delay={0.2}
      >
        <div className="flex items-center gap-2 mb-1">
          <Zap className="size-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            IA Pr&eacute;dictive
          </span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">
          Risque de panne d&eacute;tect&eacute; sur Groupe #2 dans 48h
        </p>
      </FloatingCard>

      {/* Floating offline badge */}
      <FloatingCard
        className="absolute -bottom-3 -left-3 sm:-left-6 z-10 flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/40 px-4 py-2.5"
        delay={0.4}
      >
        <CheckCircle2 className="size-5 text-green-400" />
        <div>
          <div className="text-xs font-semibold text-zinc-200">
            Mode hors-ligne
          </div>
          <div className="text-[10px] text-zinc-500">Sync. automatique</div>
        </div>
      </FloatingCard>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 pt-28 sm:pt-36 pb-20 sm:pb-28">
      {/* Animated dot grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #27272A 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-amber-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                <Sparkles className="size-3" />
                Propuls&eacute; par l&apos;IA
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]"
            >
              G&eacute;rez votre maintenance avec intelligence
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg text-zinc-400 max-w-lg"
            >
              La plateforme GMAO nouvelle g&eacute;n&eacute;ration. IA
              pr&eacute;dictive, mode hors-ligne, alertes WhatsApp.
              Con&ccedil;ue pour l&apos;industrie en Afrique.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/signup"
                className="inline-flex items-center rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:-translate-y-0.5"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center rounded-xl border border-zinc-700 px-7 py-3.5 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-500 hover:text-white hover:-translate-y-0.5"
              >
                Voir la d&eacute;mo
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-5 text-xs text-zinc-500"
            >
              14 jours d&apos;essai Pro gratuit &bull; Aucune carte requise
            </motion.p>
          </div>

          {/* Right: mock dashboard */}
          <div className="relative lg:pl-8">
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  )
}

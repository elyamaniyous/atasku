'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, WifiOff, Shield, Play, Wifi } from 'lucide-react'
import { AtaskuIcon } from './logo'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function FloatingCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.8 + delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#1C1917 1px, transparent 1px), linear-gradient(90deg, #1C1917 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left */}
          <div>
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              <span className="text-xs font-semibold text-red-700 tracking-wide uppercase">Essai gratuit 14 jours</span>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              La maintenance
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">intelligente</span>
                <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-red-600/15 -skew-x-3" />
              </span>
              {' '}pour
              <br />
              l&apos;industrie
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
              className="mt-6 max-w-lg text-lg leading-relaxed text-stone-500">
              Atasku est la plateforme GMAO qui combine intelligence artificielle,
              mode hors-ligne et interface intuitive pour transformer la gestion
              de maintenance de votre parc industriel.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/30 active:scale-[0.98]">
                Commencer gratuitement
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button className="group inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-3.5 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:shadow-md">
                <Play className="size-4 text-red-600" />
                Voir la demo
              </button>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="mt-8 flex items-center gap-6 text-xs text-stone-400">
              <span className="flex items-center gap-1.5"><Shield className="size-3.5" /> Sans carte bancaire</span>
              <span className="flex items-center gap-1.5"><Zap className="size-3.5" /> Setup en 5 min</span>
              <span className="flex items-center gap-1.5"><WifiOff className="size-3.5" /> Mode hors-ligne</span>
            </motion.div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 40, rotateY: -5 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
              className="relative rounded-2xl border border-stone-200/80 bg-white p-1 shadow-2xl shadow-stone-900/10"
            >
              <div className="flex items-center gap-2 rounded-t-xl bg-stone-50 px-4 py-2.5 border-b border-stone-100">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-400" />
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[10px] text-stone-400 border border-stone-100">
                  <Wifi className="size-2.5" /> atasku.com/dashboard
                </div>
              </div>
              <div className="rounded-b-xl bg-[#F7F4F0] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AtaskuIcon size={20} />
                    <span className="text-xs font-bold text-stone-800">Tableau de bord</span>
                  </div>
                  <div className="rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">+ Nouvelle DI</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'OT actifs', value: '12', color: 'border-l-blue-500' },
                    { label: 'Urgents', value: '3', color: 'border-l-red-500' },
                    { label: 'Dispo.', value: '94%', color: 'border-l-emerald-500' },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-lg border border-stone-200 bg-white p-2 border-l-2 ${kpi.color}`}>
                      <div className="font-mono text-lg font-bold text-stone-900">{kpi.value}</div>
                      <div className="text-[9px] text-stone-500">{kpi.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-2">
                  <div className="text-[9px] font-semibold text-stone-700 mb-1.5">Ordres recents</div>
                  {[
                    { code: 'INT-001', eq: 'GE-001', status: 'En cours', color: 'bg-orange-100 text-orange-700' },
                    { code: 'INT-002', eq: 'CP-001', status: 'Termine', color: 'bg-emerald-100 text-emerald-700' },
                    { code: 'INT-003', eq: 'PM-001', status: 'Urgent', color: 'bg-red-100 text-red-700' },
                  ].map((row) => (
                    <div key={row.code} className="flex items-center justify-between py-1 border-t border-stone-50">
                      <span className="font-mono text-[9px] text-stone-600">{row.code}</span>
                      <span className="text-[8px] text-stone-400">{row.eq}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${row.color}`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <FloatingCard delay={0.2} className="absolute -left-8 top-1/3 z-10 rounded-xl border border-stone-200 bg-white p-3 shadow-xl shadow-stone-900/5">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                  <Zap className="size-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-stone-800">IA Prediction</div>
                  <div className="text-[9px] text-stone-500">Panne dans 12j</div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.4} className="absolute -right-4 bottom-20 z-10 rounded-xl border border-stone-200 bg-white p-3 shadow-xl shadow-stone-900/5">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-50">
                  <WifiOff className="size-4 text-red-600" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-stone-800">Mode hors-ligne</div>
                  <div className="text-[9px] text-emerald-600 font-medium">Synchronise</div>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </section>
  )
}

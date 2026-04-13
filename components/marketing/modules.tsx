'use client'

import { motion } from 'framer-motion'
import {
  ClipboardList, Wrench, Settings, Calendar, Bell, BarChart3,
  Brain, Users, CreditCard, FileText, WifiOff, Shield,
} from 'lucide-react'

const modules = [
  { icon: ClipboardList, name: 'Ordres de travail', desc: 'Kanban + Liste + Detail', tier: 'Gratuit' },
  { icon: Wrench, name: 'Maintenance', desc: 'Correctif + Preventif + Historique', tier: 'Gratuit' },
  { icon: Settings, name: 'Actifs', desc: 'Parc equipements complet', tier: 'Gratuit' },
  { icon: Calendar, name: 'Planning', desc: 'Calendrier + Charge equipe', tier: 'Gratuit' },
  { icon: Bell, name: 'Alertes', desc: 'Push + Email + SLA', tier: 'Gratuit' },
  { icon: BarChart3, name: 'Rapports', desc: 'KPI + Graphiques + Export', tier: 'Gratuit' },
  { icon: Brain, name: 'IA Insights', desc: 'Predictions + Diagnostic', tier: 'Pro' },
  { icon: FileText, name: 'PDF', desc: 'DI + BT + RS + Rapport', tier: 'Pro' },
  { icon: WifiOff, name: 'Hors-ligne', desc: 'IndexedDB + Sync auto', tier: 'Pro' },
  { icon: Users, name: 'Equipe', desc: 'Roles + Invitations', tier: 'Gratuit' },
  { icon: CreditCard, name: 'Facturation', desc: 'Stripe + Plans + Usage', tier: 'Gratuit' },
  { icon: Shield, name: 'Audit', desc: 'Journal d\'audit complet', tier: 'Entreprise' },
]

export function Modules() {
  return (
    <section id="modules" className="relative py-24 lg:py-32 bg-stone-900">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-xs font-bold tracking-widest text-red-400 uppercase">Modules</span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            12 modules, une seule plateforme
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-400">
            De la gestion des OT a l&apos;intelligence artificielle, chaque module
            est concu pour travailler ensemble.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-4 transition-all hover:border-stone-700 hover:bg-stone-800/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stone-800 group-hover:bg-red-600/20 transition-colors">
                <m.icon className="size-5 text-stone-400 group-hover:text-red-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">{m.name}</span>
                  {m.tier !== 'Gratuit' && (
                    <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-bold ${
                      m.tier === 'Pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-violet-500/20 text-violet-400'
                    }`}>
                      {m.tier}
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-500 truncate">{m.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

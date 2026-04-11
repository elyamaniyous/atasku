'use client'

import { motion } from 'framer-motion'
import {
  ClipboardList,
  Settings,
  Database,
  CalendarDays,
  Bell,
  BarChart3,
} from 'lucide-react'

const modules = [
  {
    icon: ClipboardList,
    title: 'Ordres de Travail',
    description: 'Kanban visuel, suivi du cycle de vie complet',
  },
  {
    icon: Settings,
    title: 'Maintenance',
    description: 'Préventive et corrective, planification automatique',
  },
  {
    icon: Database,
    title: 'Actifs',
    description: 'Inventaire complet, QR codes, historique',
  },
  {
    icon: CalendarDays,
    title: 'Planning',
    description: 'Calendrier interactif, gestion de charge',
  },
  {
    icon: Bell,
    title: 'Alertes',
    description: 'Notifications temps réel, WhatsApp, SMS',
  },
  {
    icon: BarChart3,
    title: 'Rapports',
    description: 'KPIs (MTTR, MTBF), export PDF/Excel',
  },
]

export function Modules() {
  return (
    <section id="modules" className="bg-zinc-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
            6 modules, une seule plateforme
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer votre maintenance
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-16">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-300"
            >
              <div className="size-11 rounded-xl flex items-center justify-center mb-4 bg-zinc-800 group-hover:bg-amber-500/10 transition-colors">
                <mod.icon className="size-5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="font-bold text-white mb-1.5">{mod.title}</h3>
              <p className="text-sm text-zinc-500">{mod.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-5 py-2 text-sm font-semibold text-amber-400">
            Tous inclus dans le plan gratuit
          </span>
        </motion.div>
      </div>
    </section>
  )
}

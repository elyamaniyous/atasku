'use client'

import { motion } from 'framer-motion'
import {
  Kanban, BarChart3, Bell, Brain, Calendar, Wrench,
} from 'lucide-react'

const features = [
  {
    icon: Kanban,
    title: 'Kanban & Liste',
    description: 'Visualisez vos ordres de travail en vue Kanban drag-and-drop ou en tableau filtrable. Changez le statut en un glissement.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Brain,
    title: 'IA Predictive',
    description: 'Gemini analyse vos equipements et predit les pannes avant qu\'elles ne surviennent. Recommandations automatiques.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Wrench,
    title: 'Preventif & Correctif',
    description: 'Planifiez les revisions preventives et gerez les pannes correctives dans un seul flux de travail unifie.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Rapports & KPI',
    description: 'MTTR, MTBF, disponibilite, taux preventif. Graphiques interactifs avec export PDF automatique.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Bell,
    title: 'Alertes Intelligentes',
    description: 'SLA, compteur heures, revisions proches. Notifications push, email et bientot WhatsApp.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Calendar,
    title: 'Planning Equipe',
    description: 'Calendrier semaine/mois avec charge de travail par technicien. Affectez les interventions en un clic.',
    color: 'bg-amber-50 text-amber-600',
  },
]

export function Features() {
  return (
    <section id="fonctionnalites" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-xs font-bold tracking-widest text-red-600 uppercase">Fonctionnalites</span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
            Tout ce qu&apos;il faut pour gerer
            <br className="hidden sm:block" />
            votre maintenance
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-500">
            Une suite complete d&apos;outils concus pour les equipes de maintenance industrielle
            en Afrique francophone et en Europe.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl border border-stone-200/60 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-1"
            >
              <div className={`flex size-11 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{f.description}</p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-red-600 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

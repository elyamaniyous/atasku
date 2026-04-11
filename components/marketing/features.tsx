'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, Globe } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'IA Prédictive',
    description:
      'Anticipez les pannes avant qu\u2019elles ne surviennent. Notre IA analyse vos données pour prédire les défaillances.',
    color: 'bg-amber-50 text-amber-600',
    ring: 'ring-amber-50',
  },
  {
    icon: Zap,
    title: 'Spécialiste Énergie',
    description:
      'Conçu pour les centrales, le solaire, l\u2019éolien. Suivi carburant, compteurs, KPIs énergétiques.',
    color: 'bg-cyan-50 text-cyan-600',
    ring: 'ring-cyan-50',
  },
  {
    icon: Globe,
    title: 'Fait pour l\u2019Afrique',
    description:
      'Mode hors-ligne, alertes WhatsApp, interface mobile. En français et arabe.',
    color: 'bg-emerald-50 text-emerald-600',
    ring: 'ring-emerald-50',
  },
]

export function Features() {
  return (
    <section id="fonctionnalites" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-zinc-900">
            Pourquoi Atasku ?
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
            Trois avantages compétitifs uniques
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 mt-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-2xl bg-white border border-zinc-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`size-14 rounded-xl flex items-center justify-center mb-6 ${feature.color} ring-8 ${feature.ring}`}
              >
                <feature.icon className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

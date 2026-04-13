'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp, MessageSquare, Shield, Sparkles } from 'lucide-react'

const aiFeatures = [
  {
    icon: Brain,
    title: 'Diagnostic Intelligent',
    desc: 'L\'IA analyse l\'historique de vos pannes et identifie les causes racines recurrentes.',
  },
  {
    icon: TrendingUp,
    title: 'Predictions de Pannes',
    desc: 'Anticipez les defaillances avant qu\'elles ne surviennent grace aux modeles predictifs.',
  },
  {
    icon: Zap,
    title: 'Score de Sante',
    desc: 'Chaque equipement recoit un score de sante en temps reel avec recommandations.',
  },
  {
    icon: MessageSquare,
    title: 'Assistant Chatbot',
    desc: 'Posez vos questions en francais. L\'IA vous guide sur les procedures et diagnostics.',
  },
]

export function AiSection() {
  return (
    <section id="ia" className="py-24 lg:py-32 bg-gradient-to-b from-[#FAFAF8] to-red-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1">
              <Sparkles className="size-3.5 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Propulse par Gemini</span>
            </div>

            <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
              L&apos;intelligence artificielle
              <br />
              au service de vos
              <br />
              <span className="text-red-600">equipements</span>
            </h2>

            <p className="mt-4 max-w-lg text-stone-500 leading-relaxed">
              Atasku utilise Google Gemini pour analyser votre parc, detecter les anomalies,
              predire les pannes et recommander les actions de maintenance optimales.
            </p>

            <div className="mt-8 flex items-center gap-4 text-sm text-stone-400">
              <span className="flex items-center gap-1.5"><Shield className="size-4" /> Donnees securisees</span>
              <span className="flex items-center gap-1.5"><Zap className="size-4" /> Analyse en &lt;5s</span>
            </div>
          </motion.div>

          {/* Right — feature cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {aiFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-stone-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50">
                  <f.icon className="size-5 text-violet-600" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

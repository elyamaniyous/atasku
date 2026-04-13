'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Sparkles, Rocket } from 'lucide-react'

const betaFeatures = [
  'Ordres de travail illimites',
  'Kanban + Liste + Detail',
  'Maintenance corrective & preventive',
  'Gestion du parc equipements',
  'Planning & charge d\'equipe',
  'Alertes intelligentes (push + email)',
  'Rapports & KPI avec graphiques',
  'IA Insights & Assistant chatbot',
  'Generation PDF (DI, BT, RS)',
  'Mode hors-ligne',
  'Jusqu\'a 20 utilisateurs',
  'Jusqu\'a 100 equipements',
]

export function PricingSection() {
  return (
    <section id="tarifs" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
            <Rocket className="size-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Beta Testing</span>
          </div>

          <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
            Gratuit pendant la beta
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-500 text-lg">
            Atasku est actuellement en <b className="text-stone-700">beta testing</b>. Toutes les fonctionnalites
            sont accessibles gratuitement. Aucune carte bancaire requise.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          {/* Single beta card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-red-600 bg-white shadow-xl shadow-red-600/5">
            {/* Top banner */}
            <div className="bg-red-600 px-6 py-3 text-center">
              <span className="text-sm font-bold text-white tracking-wide uppercase">
                Acces Beta Complet — 100% Gratuit
              </span>
            </div>

            <div className="p-8">
              {/* Price */}
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-heading text-6xl font-bold text-stone-900">0</span>
                <span className="text-2xl font-semibold text-stone-400">MAD</span>
                <span className="text-sm text-stone-400">/ mois</span>
              </div>
              <p className="mt-2 text-center text-sm text-stone-500">
                Pendant toute la duree de la beta
              </p>

              {/* CTA */}
              <div className="mt-6 flex justify-center">
                <Link
                  href="/signup"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 hover:shadow-xl active:scale-[0.98]"
                >
                  Rejoindre la beta gratuitement
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Features grid */}
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {betaFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 py-1">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-stone-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <div className="mt-8 rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-800">
                  <Sparkles className="size-4" />
                  Offre beta limitee
                </div>
                <p className="mt-1 text-xs text-amber-700">
                  Les premiers utilisateurs beta beneficieront d&apos;un tarif preferentiel
                  a vie lors du lancement officiel.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

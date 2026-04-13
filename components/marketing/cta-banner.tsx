'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'

export function CtaBanner() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-stone-900 px-8 py-16 sm:px-16 sm:py-20"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/10 to-transparent" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-red-600/10 blur-[80px]" />

          <div className="relative flex flex-col items-center text-center">
            {/* Stars */}
            <div className="mb-6 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Pret a transformer votre
              <br />
              <span className="text-red-400">maintenance ?</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-stone-400 text-lg">
              Rejoignez les equipes industrielles qui utilisent Atasku pour reduire
              les temps d&apos;arret et optimiser la performance de leurs equipements.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 hover:shadow-xl hover:shadow-red-600/30 active:scale-[0.98]"
              >
                Demarrer l&apos;essai gratuit
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-stone-700 px-8 py-4 text-base font-medium text-stone-300 transition-all hover:border-stone-500 hover:text-white"
              >
                Voir les tarifs
              </Link>
            </div>

            <p className="mt-6 text-sm text-stone-500">
              14 jours gratuits &bull; Sans carte bancaire &bull; Annulez a tout moment
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

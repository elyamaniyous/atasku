'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32">
      {/* Amber gradient orb */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-amber-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-heading font-bold text-3xl sm:text-4xl text-white"
        >
          Prêt à digitaliser votre maintenance ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-lg text-zinc-400"
        >
          Rejoignez les entreprises qui modernisent leur GMAO avec Atasku
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Link
            href="/signup"
            className="inline-flex items-center bg-amber-500 text-zinc-950 font-semibold px-8 py-4 rounded-xl text-base hover:bg-amber-400 shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all duration-300"
          >
            Commencer gratuitement
          </Link>
          <p className="mt-4 text-sm text-zinc-500">
            14 jours Pro gratuit
          </p>
        </motion.div>
      </div>
    </section>
  )
}

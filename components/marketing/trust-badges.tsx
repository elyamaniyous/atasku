'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '500+', label: '\u00c9quipements g\u00e9r\u00e9s' },
  { value: '99.9%', label: 'Disponibilit\u00e9' },
  { value: '50%', label: 'R\u00e9duction MTTR' },
  { value: '24/7', label: 'Support & monitoring' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function TrustBadges() {
  return (
    <section className="bg-zinc-950 border-t border-zinc-800/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <div className="text-3xl font-heading font-bold text-amber-400">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

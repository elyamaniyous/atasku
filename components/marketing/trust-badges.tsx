'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Wifi, WifiOff, Globe, Smartphone, FileText } from 'lucide-react'

const badges = [
  { icon: ShieldCheck, label: 'Conforme RGPD' },
  { icon: WifiOff, label: 'Mode hors-ligne' },
  { icon: Globe, label: 'Multi-sites' },
  { icon: Smartphone, label: 'Mobile-first' },
  { icon: FileText, label: 'PDF automatises' },
  { icon: Wifi, label: 'Sync temps reel' },
]

export function TrustBadges() {
  return (
    <section className="relative border-y border-stone-200/60 bg-white/50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {badges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-stone-400">
              <Icon className="size-4" />
              <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

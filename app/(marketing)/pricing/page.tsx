import type { Metadata } from 'next'
import { PricingTable } from '@/components/marketing/pricing-table'
import { PricingFaq } from '@/components/marketing/pricing-faq'

export const metadata: Metadata = {
  title: 'Tarifs — Atasku',
  description:
    'Plans gratuit, Pro et Entreprise. Commencez gratuitement, passez au Pro quand vous êtes prêt.',
}

export default function PricingPage() {
  return (
    <div className="pt-28 pb-20 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white font-bold">
            Tarifs simples et transparents
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
            Commencez gratuitement, passez au Pro quand vous êtes prêt
          </p>
        </div>

        <PricingTable />

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h3 className="font-heading text-2xl sm:text-3xl text-white text-center mb-10 font-bold">
            Questions fréquentes
          </h3>
          <PricingFaq />
        </div>
      </div>
    </div>
  )
}

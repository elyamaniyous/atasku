import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/hero'
import { TrustBadges } from '@/components/marketing/trust-badges'
import { Features } from '@/components/marketing/features'
import { Modules } from '@/components/marketing/modules'
import { CtaBanner } from '@/components/marketing/cta-banner'

export const metadata: Metadata = {
  title: 'Atasku — La GMAO intelligente pour l\u2019industrie',
  description:
    'Gérez votre maintenance avec l\u2019IA. Mode hors-ligne, alertes WhatsApp, interface mobile. Essai gratuit 14 jours.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <Features />
      <Modules />
      <CtaBanner />
    </>
  )
}

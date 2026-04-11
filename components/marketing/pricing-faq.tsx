'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqItems = [
  {
    question: 'Puis-je utiliser Atasku gratuitement ?',
    answer:
      'Oui, le plan Gratuit est disponible sans limite de temps. Il inclut 3 utilisateurs, 10 \u00e9quipements et tous les 6 modules.',
  },
  {
    question: 'Comment fonctionne l\u2019essai Pro de 14 jours ?',
    answer:
      'En cr\u00e9ant votre compte, vous b\u00e9n\u00e9ficiez automatiquement de 14 jours d\u2019acc\u00e8s complet au plan Pro. Aucune carte bancaire requise.',
  },
  {
    question: 'Le mode hors-ligne fonctionne-t-il vraiment ?',
    answer:
      'Absolument. Vos techniciens peuvent cr\u00e9er et mettre \u00e0 jour des ordres de travail sans connexion. Sync automatique au retour.',
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      'Cartes bancaires (Visa, Mastercard), virements, et paiement mobile (Orange Money, M-Pesa).',
  },
  {
    question: 'Puis-je changer de plan \u00e0 tout moment ?',
    answer:
      'Oui, passez du Gratuit au Pro \u00e0 tout moment. Facturation au prorata.',
  },
  {
    question: 'Mes donn\u00e9es sont-elles s\u00e9curis\u00e9es ?',
    answer:
      'Chiffrement AES-256 au repos, TLS 1.3 en transit. Le plan Entreprise offre audit de conformit\u00e9 et h\u00e9bergement d\u00e9di\u00e9.',
  },
]

export function PricingFaq() {
  return (
    <Accordion className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800 overflow-hidden">
      {faqItems.map((item, i) => (
        <AccordionItem key={i} value={String(i)} className="border-none">
          <AccordionTrigger className="px-6 py-4 text-sm font-semibold text-zinc-200 hover:no-underline hover:bg-zinc-800/50">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <p className="text-zinc-400 leading-relaxed">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

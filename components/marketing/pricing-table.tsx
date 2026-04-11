'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Minus } from 'lucide-react'

const plans = [
  {
    name: 'Gratuit',
    description: 'Pour d\u00e9couvrir la plateforme',
    price: '0',
    priceSuffix: '',
    cta: 'Commencer',
    ctaHref: '/signup',
    highlighted: false,
    features: [
      '3 utilisateurs',
      '10 \u00e9quipements',
      '6 modules inclus',
      '1 insight IA / semaine',
      '500 Mo stockage',
      'Support communautaire',
    ],
  },
  {
    name: 'Pro',
    description: 'Pour les \u00e9quipes en croissance',
    price: '29',
    priceSuffix: '/utilisateur/mois',
    cta: 'Essai gratuit 14 jours',
    ctaHref: '/signup',
    highlighted: true,
    badge: 'Le plus populaire',
    features: [
      'Jusqu\u2019\u00e0 20 utilisateurs',
      '100 \u00e9quipements',
      'IA illimit\u00e9e',
      'Alertes WhatsApp & SMS',
      'PDF personnalis\u00e9 (logo)',
      'Sync. hors-ligne',
      '10 Go stockage',
      'Support prioritaire',
    ],
  },
  {
    name: 'Entreprise',
    description: 'Pour les grandes organisations',
    price: 'Sur mesure',
    priceSuffix: '',
    cta: 'Nous contacter',
    ctaHref: 'mailto:contact@atasku.com',
    highlighted: false,
    features: [
      'Utilisateurs illimit\u00e9s',
      '\u00c9quipements illimit\u00e9s',
      'API & int\u00e9grations',
      'SSO (SAML/OIDC)',
      'Audit & conformit\u00e9',
      'Mod\u00e8les IA personnalis\u00e9s',
      'Stockage illimit\u00e9',
      'Support d\u00e9di\u00e9 24/7',
    ],
  },
]

const comparisonFeatures = [
  { name: 'Utilisateurs', free: '3', pro: '20', enterprise: 'Illimit\u00e9' },
  { name: '\u00c9quipements', free: '10', pro: '100', enterprise: 'Illimit\u00e9' },
  { name: 'Modules', free: '6', pro: '6', enterprise: '6 + custom' },
  { name: 'Insights IA', free: '1/semaine', pro: 'Illimit\u00e9', enterprise: 'Illimit\u00e9 + custom' },
  { name: 'Stockage', free: '500 Mo', pro: '10 Go', enterprise: 'Illimit\u00e9' },
  { name: 'Mode hors-ligne', free: false, pro: true, enterprise: true },
  { name: 'WhatsApp/SMS', free: false, pro: true, enterprise: true },
  { name: 'PDF personnalis\u00e9', free: false, pro: true, enterprise: true },
  { name: 'API', free: false, pro: false, enterprise: true },
  { name: 'SSO', free: false, pro: false, enterprise: true },
  { name: 'Audit', free: false, pro: false, enterprise: true },
  { name: 'Support', free: 'Communautaire', pro: 'Prioritaire', enterprise: 'D\u00e9di\u00e9 24/7' },
]

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="size-4 text-emerald-400 mx-auto" />
    ) : (
      <Minus className="size-4 text-zinc-600 mx-auto" />
    )
  }
  return <span className="text-sm text-zinc-400">{value}</span>
}

export function PricingTable() {
  return (
    <div>
      {/* Plan cards */}
      <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-2xl border p-8 flex flex-col ${
              plan.highlighted
                ? 'bg-zinc-900 border-amber-500/30 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20'
                : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
            </div>

            <div className="mb-6">
              {plan.price === 'Sur mesure' ? (
                <span className="text-3xl font-bold text-white">{plan.price}</span>
              ) : (
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  {plan.priceSuffix && (
                    <span className="text-sm text-zinc-500 mb-1">{plan.priceSuffix}</span>
                  )}
                </div>
              )}
            </div>

            <ul className="mb-8 space-y-3 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-400">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.ctaHref}
              className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all ${
                plan.highlighted
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                  : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="mt-20 max-w-4xl mx-auto"
      >
        <h3 className="font-heading font-bold text-2xl text-white text-center mb-8">
          Comparaison d\u00e9taill\u00e9e
        </h3>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-800/50">
                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                  Fonctionnalit\u00e9
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-300 text-center">
                  Gratuit
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-amber-400 text-center">
                  Pro
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-300 text-center">
                  Entreprise
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr
                  key={row.name}
                  className={`border-b border-zinc-800/50 ${
                    i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800/20'
                  }`}
                >
                  <td className="px-6 py-3.5 text-sm font-medium text-zinc-300">
                    {row.name}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <ComparisonCell value={row.free} />
                  </td>
                  <td className="px-6 py-3.5 text-center bg-amber-500/5">
                    <ComparisonCell value={row.pro} />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <ComparisonCell value={row.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

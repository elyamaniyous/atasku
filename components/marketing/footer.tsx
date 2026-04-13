import Link from 'next/link'
import { AtaskuLogo } from './logo'

const footerColumns = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalites', href: '/home#fonctionnalites' },
      { label: 'Modules', href: '/home#modules' },
      { label: 'Tarifs', href: '/pricing' },
      { label: 'Securite', href: '#' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Guide demarrage', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'A propos', href: '#' },
      { label: 'Carrieres', href: '#' },
      { label: 'Partenaires', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Mentions legales', href: '#' },
      { label: 'Confidentialite', href: '#' },
      { label: 'CGU', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <AtaskuLogo size="small" className="text-stone-900" />
            <p className="mt-3 text-sm text-stone-500 max-w-xs">
              La GMAO intelligente pour l&apos;industrie.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-stone-800 mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-stone-400 transition-colors hover:text-stone-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            &copy; 2026 Atasku. Tous droits reserves.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a key={social} href="#" className="text-xs text-stone-400 transition-colors hover:text-stone-600">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'

const footerColumns = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalit\u00e9s', href: '/home#fonctionnalites' },
      { label: 'Modules', href: '/home#modules' },
      { label: 'Tarifs', href: '/pricing' },
      { label: 'S\u00e9curit\u00e9', href: '#' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Guide d\u00e9marrage', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: '\u00c0 propos', href: '#' },
      { label: 'Carri\u00e8res', href: '#' },
      { label: 'Partenaires', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'L\u00e9gal',
    links: [
      { label: 'Mentions l\u00e9gales', href: '#' },
      { label: 'Confidentialit\u00e9', href: '#' },
      { label: 'CGU', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <span className="font-heading font-bold text-xl text-white">Atasku</span>
            <p className="mt-3 text-sm text-zinc-500 max-w-xs">
              La GMAO intelligente pour l&apos;industrie.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            &copy; 2026 Atasku. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Cog,
  Bell,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MobileNavProps = {
  onOpenMenu: () => void
  unreadAlerts?: number
}

const TABS = [
  { label: 'Accueil', href: '/', icon: LayoutDashboard },
  { label: 'OTs', href: '/ordres', icon: ClipboardList },
  { label: 'Actifs', href: '/actifs', icon: Cog },
  { label: 'Alertes', href: '/alertes', icon: Bell, badgeKey: 'alerts' },
] as const

export function MobileNav({ onOpenMenu, unreadAlerts = 0 }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-stone-200 bg-white md:hidden">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 px-3 py-1',
              isActive ? 'text-red-600' : 'text-stone-500'
            )}
          >
            <div className="relative">
              <Icon className="size-5" />
              {'badgeKey' in tab && unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
                  {unreadAlerts > 99 ? '99+' : unreadAlerts}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        )
      })}

      {/* Menu tab */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-stone-500"
      >
        <Menu className="size-5" />
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </nav>
  )
}

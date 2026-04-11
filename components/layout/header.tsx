'use client'

import { usePathname } from 'next/navigation'
import { Menu, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/layout/user-nav'
import { DIFormDialog } from '@/components/forms/di-form'
import { NotificationDropdown } from '@/components/alerts/notification-dropdown'
import { PAGE_TITLES } from '@/lib/constants'

type HeaderProps = {
  user: { name: string; email: string; role: string }
  onOpenMobileSidebar: () => void
  unreadAlerts?: number
}

export function Header({
  user,
  onOpenMobileSidebar,
  unreadAlerts = 0,
}: HeaderProps) {
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname] ?? 'Atasku'

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="flex size-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="font-heading text-lg font-semibold text-stone-900 md:text-xl">
          {pageTitle}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search - hidden on mobile */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-stone-500 md:inline-flex"
        >
          <Search className="size-3.5" />
          <span className="text-xs">Rechercher...</span>
          <kbd className="pointer-events-none ml-2 hidden rounded border border-stone-200 bg-stone-100 px-1.5 py-0.5 text-[10px] font-mono text-stone-500 lg:inline-block">
            Cmd+K
          </kbd>
        </Button>

        {/* New DI button - hidden on mobile */}
        <DIFormDialog>
          <Button
            size="sm"
            className="hidden bg-red-600 text-white hover:bg-red-700 md:inline-flex"
          >
            <Plus className="size-3.5" />
            <span>Nouvelle DI</span>
          </Button>
        </DIFormDialog>

        {/* Notifications */}
        <NotificationDropdown initialCount={unreadAlerts} />

        {/* User dropdown */}
        <UserNav user={user} />
      </div>
    </header>
  )
}

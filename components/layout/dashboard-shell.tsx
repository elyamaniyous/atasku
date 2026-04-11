'use client'

import { useState } from 'react'
import type { UserContext } from '@/lib/auth-utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AlertBanner } from '@/components/layout/alert-banner'
import { MobileNav } from '@/components/layout/mobile-nav'
import { OfflineIndicator } from '@/components/layout/offline-indicator'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

type DashboardShellProps = {
  userContext: UserContext
  urgentCount: number
  urgentEquipment: string[]
  unreadAlerts?: number
  children: React.ReactNode
}

export function DashboardShell({
  userContext,
  urgentCount,
  urgentEquipment,
  unreadAlerts = 0,
  children,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const sidebarUser = {
    name: userContext.user.name,
    email: userContext.user.email,
    role: userContext.role,
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#F7F4F0]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar
          user={sidebarUser}
          orgPlan={userContext.orgPlan}
          orgName={userContext.orgName}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      >
        <SheetContent side="left" showCloseButton={false} className="w-[280px] p-0">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation principale de l&apos;application
          </SheetDescription>
          <Sidebar
            user={sidebarUser}
            orgPlan={userContext.orgPlan}
            orgName={userContext.orgName}
            collapsed={false}
            onToggle={() => setMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Offline indicator */}
        <OfflineIndicator />

        {/* Alert banner */}
        {urgentCount > 0 && (
          <AlertBanner
            urgentCount={urgentCount}
            equipmentNames={urgentEquipment}
          />
        )}

        {/* Header */}
        <Header
          user={sidebarUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          unreadAlerts={unreadAlerts}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav
        onOpenMenu={() => setMobileSidebarOpen(true)}
        unreadAlerts={unreadAlerts}
      />
    </div>
  )
}

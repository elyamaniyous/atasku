'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS, type NavItem, type NavSection } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type SidebarProps = {
  user: { name: string; email: string; role: string }
  orgPlan: string
  orgName: string
  collapsed: boolean
  onToggle: () => void
}

const PLAN_LEVELS: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
}

function hasPlanAccess(orgPlan: string, required?: 'PRO' | 'ENTERPRISE') {
  if (!required) return true
  return (PLAN_LEVELS[orgPlan] ?? 0) >= (PLAN_LEVELS[required] ?? 0)
}

function hasRoleAccess(userRole: string, required?: string[]) {
  if (!required || required.length === 0) return true
  return required.includes(userRole)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Generate a consistent color from a name string
function getAvatarColor(name: string) {
  const colors = [
    'bg-red-600',
    'bg-orange-500',
    'bg-emerald-600',
    'bg-blue-600',
    'bg-violet-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function SidebarNavItem({
  item,
  collapsed,
  orgPlan,
  userRole,
  pathname,
}: {
  item: NavItem
  collapsed: boolean
  orgPlan: string
  userRole: string
  pathname: string
}) {
  const [childrenOpen, setChildrenOpen] = useState(false)
  const isActive =
    pathname === item.href ||
    (item.children?.some((c) => pathname === c.href) ?? false)
  const hasAccess = hasPlanAccess(orgPlan, item.planRequired)
  const hasRole = hasRoleAccess(userRole, item.roleRequired)

  if (!hasRole) return null

  const Icon = item.icon

  const content = (
    <div>
      <Link
        href={hasAccess ? item.href : '#'}
        onClick={(e) => {
          if (!hasAccess) e.preventDefault()
          if (item.children && !collapsed) {
            e.preventDefault()
            setChildrenOpen((prev) => !prev)
          }
        }}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-red-600 text-white'
            : 'text-stone-300 hover:bg-stone-800 hover:text-white',
          !hasAccess && 'opacity-60 cursor-not-allowed'
        )}
      >
        <Icon className="size-5 shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
            >
              <span>{item.label}</span>
              <span className="flex items-center gap-1.5">
                {!hasAccess && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/20 px-1.5 py-0.5 text-[10px] text-violet-400">
                    <Lock className="size-2.5" />
                    Pro
                  </span>
                )}
                {item.badge && hasAccess && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">
                    0
                  </span>
                )}
                {item.children && (
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform duration-200',
                      childrenOpen && 'rotate-180'
                    )}
                  />
                )}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Sub-items */}
      <AnimatePresence>
        {!collapsed && item.children && childrenOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-1 space-y-0.5 border-l border-stone-700 pl-3">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block rounded-md px-2 py-1.5 text-sm transition-colors',
                    pathname === child.href
                      ? 'text-white font-medium'
                      : 'text-stone-400 hover:text-stone-200'
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />}>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}

function SidebarSection({
  section,
  collapsed,
  orgPlan,
  userRole,
  pathname,
}: {
  section: NavSection
  collapsed: boolean
  orgPlan: string
  userRole: string
  pathname: string
}) {
  if (section.planRequired && !hasPlanAccess(orgPlan, section.planRequired)) {
    // Still show the section but items will show lock icons
  }

  // Filter items that user has role access to
  const visibleItems = section.items.filter((item) =>
    hasRoleAccess(userRole, item.roleRequired)
  )
  if (visibleItems.length === 0) return null

  return (
    <div className="mb-2">
      <AnimatePresence>
        {!collapsed && (
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
          >
            {section.section}
          </motion.h3>
        )}
      </AnimatePresence>
      <div className="space-y-0.5">
        {visibleItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            orgPlan={orgPlan}
            userRole={userRole}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  )
}

export function Sidebar({
  user,
  orgPlan,
  orgName,
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex h-full flex-col bg-stone-950 text-stone-300"
      >
        {/* Logo + Toggle */}
        <div className="flex h-16 items-center justify-between px-3">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            {collapsed ? (
              <span className="flex size-9 items-center justify-center rounded-lg bg-stone-800 font-heading text-lg font-bold text-white">
                P
              </span>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <span className="font-heading text-xl text-white font-bold">
                  Atasku
                </span>
              </motion.div>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="flex size-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
            aria-label={collapsed ? 'Ouvrir le menu' : 'Replier le menu'}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-2">
          <nav className="space-y-1">
            {NAV_SECTIONS.map((section) => (
              <SidebarSection
                key={section.section}
                section={section}
                collapsed={collapsed}
                orgPlan={orgPlan}
                userRole={user.role}
                pathname={pathname}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* User section at bottom */}
        <div className="border-t border-stone-800 p-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                getAvatarColor(user.name)
              )}
            >
              {getInitials(user.name)}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="min-w-0 overflow-hidden"
                >
                  <p className="truncate text-sm font-medium text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    {user.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}

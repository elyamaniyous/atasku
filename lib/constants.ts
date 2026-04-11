import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Cog,
  Calendar,
  Bell,
  BarChart3,
  Brain,
  MessageSquare,
  Users,
  CreditCard,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string // key to fetch dynamic count
  planRequired?: 'PRO' | 'ENTERPRISE'
  roleRequired?: string[]
  children?: { label: string; href: string }[]
}

export type NavSection = {
  section: string
  planRequired?: 'PRO' | 'ENTERPRISE'
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    section: 'Principal',
    items: [
      { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Operations',
    items: [
      {
        label: 'Ordres de travail',
        href: '/ordres',
        icon: ClipboardList,
        badge: 'activeOTs',
      },
      {
        label: 'Maintenance',
        href: '/maintenance/corrective',
        icon: Wrench,
        children: [
          { label: 'Corrective', href: '/maintenance/corrective' },
          { label: 'Preventive', href: '/maintenance/preventive' },
          { label: 'Historique', href: '/maintenance/historique' },
        ],
      },
      { label: 'Actifs', href: '/actifs', icon: Cog },
      { label: 'Planning', href: '/planning', icon: Calendar },
    ],
  },
  {
    section: 'Suivi',
    items: [
      {
        label: 'Alertes',
        href: '/alertes',
        icon: Bell,
        badge: 'unreadAlerts',
      },
      { label: 'Rapports', href: '/rapports', icon: BarChart3 },
    ],
  },
  {
    section: 'Intelligence',
    planRequired: 'PRO',
    items: [
      {
        label: 'IA Insights',
        href: '/ai/insights',
        icon: Brain,
        planRequired: 'PRO',
      },
      {
        label: 'Assistant IA',
        href: '/ai/chat',
        icon: MessageSquare,
        planRequired: 'PRO',
      },
    ],
  },
  {
    section: 'Administration',
    items: [
      {
        label: 'Equipe',
        href: '/admin/team',
        icon: Users,
        roleRequired: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Facturation',
        href: '/admin/billing',
        icon: CreditCard,
        roleRequired: ['OWNER'],
      },
      {
        label: 'Parametres',
        href: '/admin/settings',
        icon: Settings,
        roleRequired: ['OWNER', 'ADMIN'],
      },
    ],
  },
]

/** Map from pathname to page title */
export const PAGE_TITLES: Record<string, string> = {
  '/': 'Tableau de bord',
  '/ordres': 'Ordres de travail',
  '/ordres/liste': 'Ordres de travail — Liste',
  '/maintenance/corrective': 'Maintenance corrective',
  '/maintenance/preventive': 'Maintenance preventive',
  '/maintenance/historique': 'Historique maintenance',
  '/actifs': 'Actifs',
  '/planning': 'Planning',
  '/alertes': 'Alertes',
  '/rapports': 'Rapports',
  '/ai/insights': 'IA Insights',
  '/ai/chat': 'Assistant IA',
  '/admin/team': 'Equipe',
  '/admin/billing': 'Facturation',
  '/admin/settings': 'Parametres',
}

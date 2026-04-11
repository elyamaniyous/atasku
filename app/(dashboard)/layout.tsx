import { getCurrentUser } from '@/lib/auth-utils'
import { getUrgentUnassignedOTs, getUnreadAlertCount } from '@/actions/alerts'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userContext = await getCurrentUser()

  // Fetch urgent OT count for alert banner
  const urgentData = await getUrgentUnassignedOTs()
  const unreadCount = await getUnreadAlertCount()

  return (
    <DashboardShell
      userContext={userContext}
      urgentCount={urgentData.count}
      urgentEquipment={urgentData.equipmentNames}
      unreadAlerts={unreadCount}
    >
      {children}
    </DashboardShell>
  )
}

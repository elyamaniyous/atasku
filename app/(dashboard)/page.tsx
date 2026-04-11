import { getCurrentUser } from '@/lib/auth-utils'
import { getDashboardData } from '@/actions/dashboard'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const { user } = await getCurrentUser()
  const data = await getDashboardData()

  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <DashboardClient
      userName={user.name}
      today={today}
      data={data}
    />
  )
}

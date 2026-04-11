import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Guard: redirect to dashboard if user already completed onboarding
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, organizations(onboarding_completed)')
    .eq('user_id', user.id)
    .single()

  if (
    member?.organizations &&
    typeof member.organizations === 'object' &&
    'onboarding_completed' in member.organizations &&
    (member.organizations as { onboarding_completed: boolean }).onboarding_completed
  ) {
    redirect('/')
  }

  return (
    <div className="-mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full max-w-lg">
      {children}
    </div>
  )
}

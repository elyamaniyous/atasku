import { getCurrentUser, requireRole } from '@/lib/auth-utils'
import { getOrganization } from '@/actions/org'
import { OrgSettingsForm } from '@/components/admin/org-settings-form'
import { DeleteOrgSection } from './delete-org-section'

export default async function SettingsPage() {
  const ctx = await getCurrentUser()
  requireRole(ctx.role, 'OWNER', 'ADMIN')

  const org = await getOrganization()

  if (!org) {
    return (
      <div className="py-16 text-center text-stone-500">
        Organisation introuvable.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-stone-900">Paramètres</h1>
        <p className="mt-1 text-sm text-stone-500">
          Gérez les informations de votre organisation.
        </p>
      </div>

      {/* Org info form */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="mb-4 font-heading text-lg text-stone-900">
          Informations de l&apos;organisation
        </h2>
        <OrgSettingsForm
          org={{
            name: (org as unknown as Record<string, unknown>).name as string,
            industry: (org as unknown as Record<string, unknown>).industry as string,
            country: (org as unknown as Record<string, unknown>).country as string,
            timezone: (org as unknown as Record<string, unknown>).timezone as string,
            locale: ((org as unknown as Record<string, unknown>).locale as string) || 'fr',
          }}
        />
      </section>

      {/* Danger zone — OWNER only */}
      {ctx.role === 'OWNER' && <DeleteOrgSection orgName={ctx.orgName} />}
    </div>
  )
}

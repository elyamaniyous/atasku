'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StepIndicator } from '@/components/onboarding/step-indicator'
import { createInvitation, getInvitations } from '@/actions/invitation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus, Mail, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'TECHNICIAN', label: 'Technicien' },
  { value: 'SITE_MANAGER', label: 'Responsable site' },
  { value: 'READONLY', label: 'Lecture seule' },
]

type InvitationItem = {
  id: string
  email: string
  role: string
  created_at: string
}

export default function TeamPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [invitations, setInvitations] = useState<InvitationItem[]>([])
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null)
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    getInvitations().then((data) => setInvitations(data as InvitationItem[]))
  }, [])

  function handleInvite(formData: FormData) {
    setIsInviting(true)
    setErrors(null)
    startTransition(async () => {
      const result = await createInvitation(formData)
      if (result?.error) {
        setErrors(result.error as Record<string, string[]>)
        setIsInviting(false)
        return
      }
      const list = await getInvitations()
      setInvitations(list as InvitationItem[])
      setIsInviting(false)
      const form = document.getElementById('invite-form') as HTMLFormElement
      form?.reset()
    })
  }

  const roleLabel = (value: string) =>
    ROLE_OPTIONS.find((r) => r.value === value)?.label ?? value

  return (
    <div>
      <StepIndicator currentStep={3} />

      <h2 className="font-heading text-2xl text-stone-800">
        Invitez votre équipe
      </h2>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Ajoutez des techniciens et responsables (optionnel)
      </p>

      {/* Invite form */}
      <form id="invite-form" action={handleInvite} className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/50 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="technicien@entreprise.com"
            className="h-9"
            required
            aria-invalid={!!errors?.email}
          />
          {errors?.email && (
            <p className="text-xs text-red-600">{errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Rôle</Label>
          <select
            id="role"
            name="role"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue="TECHNICIAN"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {errors?.role && (
            <p className="text-xs text-red-600">{errors.role[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          variant="outline"
          className="w-full"
          disabled={isPending || isInviting}
        >
          {isInviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Inviter
            </>
          )}
        </Button>
      </form>

      {/* Invitations list */}
      {invitations.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-stone-500">
            {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} envoyée{invitations.length !== 1 ? 's' : ''}
          </p>
          <AnimatePresence mode="popLayout">
            {invitations.map((inv) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100">
                    <Mail className="h-4 w-4 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {inv.email}
                    </p>
                    <p className="text-xs text-stone-400">
                      {roleLabel(inv.role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-400">
                  <Clock className="h-3 w-3" />
                  En attente
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 space-y-3">
        <Button
          size="lg"
          className="w-full bg-red-600 text-white hover:bg-red-700"
          onClick={() => router.push('/onboarding/done')}
        >
          Terminer
        </Button>
        <div className="text-center">
          <Link
            href="/onboarding/done"
            className="text-sm text-stone-400 hover:text-stone-600"
          >
            Passer cette étape
          </Link>
        </div>
      </div>
    </div>
  )
}

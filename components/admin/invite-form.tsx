'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createInvitation } from '@/actions/invitation'
import { cancelInvitation } from '@/actions/members'
import { Send, X, AlertTriangle, Clock } from 'lucide-react'
import type { OrgRole } from '@/lib/types/database'

type PendingInvitation = {
  id: string
  email: string
  role: OrgRole
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  TECHNICIAN: 'Technicien',
  SITE_MANAGER: 'Responsable site',
  READONLY: 'Lecture seule',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
  TECHNICIAN: 'bg-orange-100 text-orange-700 border-orange-200',
  SITE_MANAGER: 'bg-green-100 text-green-700 border-green-200',
  READONLY: 'bg-stone-100 text-stone-600 border-stone-200',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

export function InviteForm({
  invitations,
  activeCount,
  maxUsers,
  planName,
}: {
  invitations: PendingInvitation[]
  activeCount: number
  maxUsers: number
  planName: string
}) {
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<string>('TECHNICIAN')
  const atLimit = maxUsers !== -1 && activeCount >= maxUsers
  const nearLimit = maxUsers !== -1 && activeCount >= maxUsers - 2

  function handleSubmit(formData: FormData) {
    formData.set('role', role)
    startTransition(async () => {
      const result = await createInvitation(formData)
      if (result?.error) {
        const err = result.error as Record<string, string[]> | string
        const msg =
          typeof err === 'object'
            ? Object.values(err).flat().join(', ')
            : String(err)
        toast.error(msg)
      } else {
        toast.success('Invitation envoyée')
      }
    })
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await cancelInvitation(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Invitation annulée')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Plan limit warning */}
      {nearLimit && !atLimit && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            {activeCount}/{maxUsers} utilisateurs. Vous approchez de la limite du plan{' '}
            {planName}.
          </span>
        </div>
      )}
      {atLimit && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Limite de {maxUsers} utilisateurs atteinte pour le plan {planName}. Passez
            au plan supérieur pour inviter plus de membres.
          </span>
        </div>
      )}

      {/* Invite form */}
      <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label
            htmlFor="invite-email"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Adresse email
          </label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="collegue@entreprise.com"
            required
            disabled={atLimit || isPending}
          />
        </div>
        <div className="w-[180px]">
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Rôle
          </label>
          <Select defaultValue="TECHNICIAN" onValueChange={(v) => v && setRole(v)}>
            <SelectTrigger className="w-full" disabled={atLimit || isPending}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrateur</SelectItem>
              <SelectItem value="TECHNICIAN">Technicien</SelectItem>
              <SelectItem value="SITE_MANAGER">Responsable site</SelectItem>
              <SelectItem value="READONLY">Lecture seule</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={atLimit || isPending}>
          <Send className="size-4" />
          Inviter
        </Button>
      </form>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-stone-700">
            Invitations en attente ({invitations.length})
          </h3>
          <div className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-stone-100">
                    <Clock className="size-4 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{inv.email}</p>
                    <p className="text-xs text-stone-500">
                      Envoyé {timeAgo(inv.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`border ${ROLE_COLORS[inv.role] || 'bg-stone-100 text-stone-600'}`}
                  >
                    {ROLE_LABELS[inv.role] || inv.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(inv.id)}
                    disabled={isPending}
                  >
                    <X className="size-4 text-stone-400" />
                    <span className="sr-only">Annuler</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

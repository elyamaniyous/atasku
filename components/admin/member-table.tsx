'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { updateMemberRole, deactivateMember, reactivateMember } from '@/actions/members'
import { UserX, UserCheck, ShieldAlert } from 'lucide-react'
import type { OrgRole } from '@/lib/types/database'

type Member = {
  id: string
  user_id: string
  name: string
  role: OrgRole
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  accepted_at: string | null
  created_at: string
}

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Administrateur',
  TECHNICIAN: 'Technicien',
  SITE_MANAGER: 'Responsable site',
  READONLY: 'Lecture seule',
}

const ROLE_COLORS: Record<OrgRole, string> = {
  OWNER: 'bg-red-100 text-red-700 border-red-200',
  ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
  TECHNICIAN: 'bg-orange-100 text-orange-700 border-orange-200',
  SITE_MANAGER: 'bg-green-100 text-green-700 border-green-200',
  READONLY: 'bg-stone-100 text-stone-600 border-stone-200',
}

const ASSIGNABLE_ROLES: OrgRole[] = ['ADMIN', 'TECHNICIAN', 'SITE_MANAGER', 'READONLY']

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-pink-500',
]

function hashColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function MemberTable({
  members,
  currentUserId,
  callerRole,
}: {
  members: Member[]
  currentUserId: string
  callerRole: OrgRole
}) {
  const isOwner = callerRole === 'OWNER'

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]">Membre</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Rejoint le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.user_id === currentUserId}
              isOwner={isOwner}
            />
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-stone-500">
                Aucun membre trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function MemberRow({
  member,
  isCurrentUser,
  isOwner,
}: {
  member: Member
  isCurrentUser: boolean
  isOwner: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  function handleRoleChange(newRole: string | null) {
    if (!newRole) return
    startTransition(async () => {
      const result = await updateMemberRole(member.id, newRole)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Rôle mis à jour pour ${member.name}`)
      }
    })
  }

  function handleDeactivate() {
    startTransition(async () => {
      const result = await deactivateMember(member.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${member.name} a été désactivé`)
        setDeactivateOpen(false)
      }
    })
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateMember(member.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${member.name} a été réactivé`)
      }
    })
  }

  const joinedDate = member.accepted_at
    ? new Date(member.accepted_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'En attente'

  return (
    <TableRow className={!member.is_active ? 'opacity-60' : undefined}>
      {/* Avatar + Name */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${hashColor(member.name)}`}
          >
            {getInitials(member.name)}
          </div>
          <div>
            <p className="font-medium text-stone-900">
              {member.name}
              {isCurrentUser && (
                <span className="ml-1.5 text-xs font-normal text-stone-400">(vous)</span>
              )}
            </p>
            {member.phone && (
              <p className="text-xs text-stone-500">{member.phone}</p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Role */}
      <TableCell>
        {isOwner && !isCurrentUser && member.role !== 'OWNER' ? (
          <Select defaultValue={member.role} onValueChange={handleRoleChange}>
            <SelectTrigger size="sm" className="w-[160px]" disabled={isPending}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge
            className={`border ${ROLE_COLORS[member.role as OrgRole]}`}
          >
            {ROLE_LABELS[member.role as OrgRole]}
          </Badge>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        {member.is_active ? (
          <Badge className="border border-green-200 bg-green-100 text-green-700">
            Actif
          </Badge>
        ) : (
          <Badge className="border border-red-200 bg-red-100 text-red-700">
            Inactif
          </Badge>
        )}
      </TableCell>

      {/* Joined date */}
      <TableCell className="text-stone-600">{joinedDate}</TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        {isCurrentUser || member.role === 'OWNER' ? null : member.is_active ? (
          <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="sm" disabled={isPending}>
                  <UserX className="size-4 text-red-500" />
                  <span className="sr-only">Désactiver</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Désactiver {member.name} ?</DialogTitle>
                <DialogDescription>
                  Ce membre ne pourra plus accéder à la plateforme. Vous pourrez le
                  réactiver ultérieurement.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Annuler
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDeactivate}
                  disabled={isPending}
                >
                  <ShieldAlert className="size-4" />
                  Désactiver
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReactivate}
            disabled={isPending}
          >
            <UserCheck className="size-4 text-green-600" />
            <span className="sr-only">Réactiver</span>
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

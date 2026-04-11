'use client'

import { useEffect, useState, useTransition } from 'react'
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
import { getAuditLogs } from '@/actions/audit'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react'

type AuditLog = {
  id: string
  user_id: string | null
  user_name: string
  action: string | null
  entity_type: string | null
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  LOGIN: 'Connexion',
  EXPORT: 'Export',
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700 border-green-200',
  UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  LOGIN: 'bg-violet-100 text-violet-700 border-violet-200',
  EXPORT: 'bg-orange-100 text-orange-700 border-orange-200',
}

const ENTITY_LABELS: Record<string, string> = {
  work_order: 'Ordre de travail',
  equipment: 'Équipement',
  member: 'Membre',
  organization: 'Organisation',
  invitation: 'Invitation',
  spare_part: 'Pièce de rechange',
  contract: 'Contrat',
  intervention: 'Intervention',
}

const PAGE_SIZE = 20

export function AuditLogClient() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isPending, startTransition] = useTransition()
  const [actionFilter, setActionFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    startTransition(async () => {
      const data = await getAuditLogs({
        action: actionFilter || undefined,
        entity_type: entityFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })
      setLogs(data as AuditLog[])
    })
  }, [actionFilter, entityFilter, page])

  function handleFilterChange(type: 'action' | 'entity', value: string | null) {
    setPage(0)
    const v = value || ''
    if (type === 'action') setActionFilter(v === 'ALL' ? '' : v)
    else setEntityFilter(v === 'ALL' ? '' : v)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-stone-900">
          Journal d&apos;Audit
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Historique de toutes les actions effectuées dans votre organisation.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select defaultValue="ALL" onValueChange={(v) => handleFilterChange('action', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type d'action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes les actions</SelectItem>
            <SelectItem value="CREATE">Création</SelectItem>
            <SelectItem value="UPDATE">Modification</SelectItem>
            <SelectItem value="DELETE">Suppression</SelectItem>
            <SelectItem value="LOGIN">Connexion</SelectItem>
            <SelectItem value="EXPORT">Export</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="ALL" onValueChange={(v) => handleFilterChange('entity', v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Type d'entité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes les entités</SelectItem>
            <SelectItem value="work_order">Ordre de travail</SelectItem>
            <SelectItem value="equipment">Équipement</SelectItem>
            <SelectItem value="member">Membre</SelectItem>
            <SelectItem value="organization">Organisation</SelectItem>
            <SelectItem value="invitation">Invitation</SelectItem>
            <SelectItem value="spare_part">Pièce de rechange</SelectItem>
            <SelectItem value="contract">Contrat</SelectItem>
            <SelectItem value="intervention">Intervention</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-stone-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[160px]">Date</TableHead>
              <TableHead className="w-[160px]">Utilisateur</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
              <TableHead>Entité</TableHead>
              <TableHead className="w-[60px]">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <AuditRow
                key={log.id}
                log={log}
                isExpanded={expandedId === log.id}
                onToggle={() =>
                  setExpandedId(expandedId === log.id ? null : log.id)
                }
              />
            ))}
            {logs.length === 0 && !isPending && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="size-8 text-stone-300" />
                    <p className="mt-2 text-sm text-stone-500">
                      Aucune entrée trouvée
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {isPending && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-stone-500">
                  Chargement...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">
          Page {page + 1}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || isPending}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={logs.length < PAGE_SIZE || isPending}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function AuditRow({
  log,
  isExpanded,
  onToggle,
}: {
  log: AuditLog
  isExpanded: boolean
  onToggle: () => void
}) {
  const dateStr = new Date(log.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const hasDetails =
    (log.old_values && Object.keys(log.old_values).length > 0) ||
    (log.new_values && Object.keys(log.new_values).length > 0)

  return (
    <>
      <TableRow>
        <TableCell className="font-mono text-xs text-stone-600">
          {dateStr}
        </TableCell>
        <TableCell className="text-stone-900">{log.user_name}</TableCell>
        <TableCell>
          <Badge
            className={`border ${ACTION_COLORS[log.action || ''] || 'bg-stone-100 text-stone-600 border-stone-200'}`}
          >
            {ACTION_LABELS[log.action || ''] || log.action || '-'}
          </Badge>
        </TableCell>
        <TableCell className="text-stone-600">
          {ENTITY_LABELS[log.entity_type || ''] || log.entity_type || '-'}
          {log.entity_id && (
            <span className="ml-1 font-mono text-xs text-stone-400">
              #{log.entity_id.slice(0, 8)}
            </span>
          )}
        </TableCell>
        <TableCell>
          {hasDetails && (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          )}
        </TableCell>
      </TableRow>
      {isExpanded && hasDetails && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="bg-stone-50 px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {log.old_values && Object.keys(log.old_values).length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-red-600">
                    Anciennes valeurs
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-lg bg-white p-3 font-mono text-xs text-stone-700">
                    {JSON.stringify(log.old_values, null, 2)}
                  </pre>
                </div>
              )}
              {log.new_values && Object.keys(log.new_values).length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-green-600">
                    Nouvelles valeurs
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-lg bg-white p-3 font-mono text-xs text-stone-700">
                    {JSON.stringify(log.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

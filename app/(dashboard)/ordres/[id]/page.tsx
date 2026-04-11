import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ChevronRight,
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Paperclip,
  History,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-utils'
import { getWorkOrder, getTechnicians } from '@/actions/ot'
import { OTStatusBadge, PriorityBadge, TypeBadge } from '@/components/ot/ot-badges'
import { OTStatusTimeline } from '@/components/ot/ot-status-timeline'
import { OTActionButtons } from '@/components/ot/ot-action-buttons'
import { OTPDFExport } from '@/components/ot/ot-pdf-export'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OTStatus, OTStatusHistory, Intervention, Attachment } from '@/lib/types/database'

type Props = {
  params: Promise<{ id: string }>
}

export default async function WorkOrderDetailPage({ params }: Props) {
  const { id } = await params
  const [{ role, user }, workOrder, technicians] = await Promise.all([
    getCurrentUser(),
    getWorkOrder(id),
    getTechnicians(),
  ])

  if (!workOrder) notFound()

  const equipment = workOrder.equipment as { code: string; designation: string; status: string } | null
  const statusHistory = (workOrder.status_history ?? []) as OTStatusHistory[]
  const interventions = (workOrder.interventions ?? []) as Intervention[]
  const attachments = (workOrder.attachments ?? []) as Attachment[]

  // Resolve technician name
  const techName = workOrder.technician_id
    ? technicians.find(t => t.user_id === workOrder.technician_id)?.name ?? null
    : null

  const totalCost = (workOrder.parts_cost || 0) + (workOrder.labor_cost || 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-stone-500">
        <Link href="/ordres" className="hover:text-stone-700 transition-colors">
          Ordres
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-mono font-medium text-stone-700">{workOrder.code}</span>
      </nav>

      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold text-stone-900">
            {workOrder.code}
          </h1>
          <OTStatusBadge status={workOrder.status as OTStatus} />
          <PriorityBadge priority={workOrder.priority} />
          <TypeBadge type={workOrder.type} />
        </div>

        <div className="flex items-center gap-2">
          <OTPDFExport workOrderId={workOrder.id} />
          <OTActionButtons
            workOrderId={workOrder.id}
            currentStatus={workOrder.status as OTStatus}
            role={role}
            userId={user.id}
            technicianId={workOrder.technician_id}
            technicians={technicians}
          />
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6">
        <OTStatusTimeline
          currentStatus={workOrder.status as OTStatus}
          statusHistory={statusHistory}
        />
      </div>

      {/* Info section — 2-column grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-heading text-sm font-semibold text-stone-900 uppercase tracking-wider">
            Informations
          </h2>

          <InfoRow label="Équipement">
            {equipment ? (
              <Link
                href={`/actifs/${workOrder.equipment_id}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                <span className="font-mono text-xs">{equipment.code}</span>{' '}
                — {equipment.designation}
              </Link>
            ) : (
              <span className="text-sm text-stone-400">—</span>
            )}
          </InfoRow>

          <InfoRow label="Description">
            <p className="text-sm text-stone-700 whitespace-pre-wrap">
              {workOrder.description}
            </p>
          </InfoRow>

          {workOrder.cause && (
            <InfoRow label="Cause">
              <p className="text-sm text-stone-700 whitespace-pre-wrap">
                {workOrder.cause}
              </p>
            </InfoRow>
          )}

          <InfoRow label="Technicien">
            <span className={techName ? 'text-sm text-stone-700' : 'text-sm text-stone-400'}>
              {techName ?? 'Non affecté'}
            </span>
          </InfoRow>

          {workOrder.contract_id && (
            <InfoRow label="Contrat">
              <span className="text-sm text-stone-600">{workOrder.contract_id}</span>
            </InfoRow>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-heading text-sm font-semibold text-stone-900 uppercase tracking-wider">
            Durées & Coûts
          </h2>

          <InfoRow label="Durée estimée" icon={<Clock className="size-3.5 text-stone-400" />}>
            <span className="font-mono text-sm text-stone-700">
              {workOrder.estimated_duration ? `${workOrder.estimated_duration}h` : '—'}
            </span>
          </InfoRow>

          <InfoRow label="Durée réelle" icon={<Clock className="size-3.5 text-stone-400" />}>
            <span className="font-mono text-sm text-stone-700">
              {workOrder.actual_duration ? `${workOrder.actual_duration}h` : '—'}
            </span>
          </InfoRow>

          <InfoRow label="Coût pièces" icon={<DollarSign className="size-3.5 text-stone-400" />}>
            <span className="font-mono text-sm text-stone-700">
              {workOrder.parts_cost ? `${workOrder.parts_cost.toLocaleString('fr-FR')} €` : '—'}
            </span>
          </InfoRow>

          <InfoRow label="Coût main-d'œuvre" icon={<DollarSign className="size-3.5 text-stone-400" />}>
            <span className="font-mono text-sm text-stone-700">
              {workOrder.labor_cost ? `${workOrder.labor_cost.toLocaleString('fr-FR')} €` : '—'}
            </span>
          </InfoRow>

          <InfoRow label="Coût total" icon={<DollarSign className="size-3.5 text-stone-400" />}>
            <span className="font-mono text-sm font-semibold text-stone-900">
              {totalCost > 0 ? `${totalCost.toLocaleString('fr-FR')} €` : '—'}
            </span>
          </InfoRow>

          <div className="border-t border-stone-100 pt-3">
            <h2 className="font-heading text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">
              Dates
            </h2>

            <InfoRow label="Créé le" icon={<Calendar className="size-3.5 text-stone-400" />}>
              <span className="text-sm text-stone-700">
                {format(new Date(workOrder.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            </InfoRow>

            {workOrder.started_at && (
              <InfoRow label="Démarré le" icon={<Calendar className="size-3.5 text-stone-400" />}>
                <span className="text-sm text-stone-700">
                  {format(new Date(workOrder.started_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </InfoRow>
            )}

            {workOrder.completed_at && (
              <InfoRow label="Terminé le" icon={<Calendar className="size-3.5 text-stone-400" />}>
                <span className="text-sm text-stone-700">
                  {format(new Date(workOrder.completed_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </InfoRow>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">
            <History className="size-3.5" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="interventions">
            <Wrench className="size-3.5" />
            Interventions
          </TabsTrigger>
          <TabsTrigger value="attachments">
            <Paperclip className="size-3.5" />
            Pièces jointes
          </TabsTrigger>
        </TabsList>

        {/* History tab */}
        <TabsContent value="history">
          <div className="rounded-lg border border-stone-200 bg-white">
            {statusHistory.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-stone-400">
                Aucun historique disponible.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Transition</TableHead>
                    <TableHead className="text-xs">Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-stone-600">
                        {format(new Date(entry.changed_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          {entry.from_status ? (
                            <>
                              <OTStatusBadge status={entry.from_status as OTStatus} />
                              <span className="text-stone-400">→</span>
                              <OTStatusBadge status={entry.to_status as OTStatus} />
                            </>
                          ) : (
                            <OTStatusBadge status={entry.to_status as OTStatus} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {entry.comment || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Interventions tab */}
        <TabsContent value="interventions">
          <div className="rounded-lg border border-stone-200 bg-white">
            {interventions.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-stone-400">
                Aucune intervention enregistrée.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                    <TableHead className="text-xs">Durée</TableHead>
                    <TableHead className="text-xs">Cause racine</TableHead>
                    <TableHead className="text-xs">Coût</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.map((intervention) => (
                    <TableRow key={intervention.id}>
                      <TableCell className="text-sm text-stone-600">
                        {format(new Date(intervention.started_at), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-stone-700 truncate">
                          {intervention.actions}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-stone-600">
                        {intervention.duration}h
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {intervention.root_cause || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-stone-600">
                        {((intervention.parts_cost || 0) + (intervention.labor_cost || 0)).toLocaleString('fr-FR')} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Attachments tab */}
        <TabsContent value="attachments">
          <div className="rounded-lg border border-stone-200 bg-white">
            {attachments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-8 text-stone-400">
                <FileText className="size-8" />
                <span className="text-sm">Aucune pièce jointe.</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Fichier</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Taille</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attachments.map((attachment) => (
                    <TableRow key={attachment.id}>
                      <TableCell>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {attachment.filename}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {attachment.mime_type}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-stone-500">
                        {attachment.size_bytes
                          ? `${(attachment.size_bytes / 1024).toFixed(1)} KB`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-stone-600">
                        {format(new Date(attachment.created_at), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---- Helper component ----

function InfoRow({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

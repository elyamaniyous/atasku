'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { StatusBadge, CriticalityBadge, STATUS_CONFIG } from '@/components/equipment/status-badge'
import { EquipmentFormDialog } from '@/components/forms/equipment-form'
import { updateEquipmentStatus, deleteEquipment } from '@/actions/equipment'
import type {
  Equipment,
  WorkOrder,
  SparePart,
  MeterReading,
  EquipmentStatus,
  OrgRole,
} from '@/lib/types/database'

// ---- Labels ----

const GROUP_LABELS: Record<string, string> = {
  ELECTROGEN: 'Électrogène',
  TURBINE: 'Turbine',
  TRANSFORMER: 'Transformateur',
  PUMP: 'Moto-pompe',
  COMPRESSOR: 'Compresseur',
  OTHER: 'Autre',
}

const TYPE_LABELS: Record<string, string> = {
  CAPOTE: 'Capoté',
  NON_CAPOTE: 'Non capoté',
}

const OT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nouveau', color: 'bg-stone-100 text-stone-700' },
  ASSIGNED: { label: 'Assigné', color: 'bg-blue-50 text-blue-700' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-amber-50 text-amber-700' },
  ON_HOLD: { label: 'En attente', color: 'bg-orange-50 text-orange-700' },
  COMPLETED: { label: 'Terminé', color: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Annulé', color: 'bg-red-50 text-red-600' },
}

const OT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  CORRECTIVE: { label: 'Corrective', color: 'bg-red-50 text-red-700' },
  PREVENTIVE: { label: 'Préventive', color: 'bg-blue-50 text-blue-700' },
  CONDITIONAL: { label: 'Conditionnelle', color: 'bg-purple-50 text-purple-700' },
  IMPROVEMENT: { label: 'Amélioration', color: 'bg-emerald-50 text-emerald-700' },
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  URGENT: { label: 'Urgent', color: 'bg-red-50 text-red-700' },
  NORMAL: { label: 'Normal', color: 'bg-stone-100 text-stone-700' },
  LOW: { label: 'Faible', color: 'bg-stone-50 text-stone-500' },
}

const METER_TYPE_LABELS: Record<string, string> = {
  HOURS: 'Heures',
  KWH: 'kWh',
  TEMPERATURE: 'Température',
  PRESSURE: 'Pression',
  VIBRATION: 'Vibration',
}

// ---- Helpers ----

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr })
  } catch {
    return dateStr
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value)
}

// ---- Field display ----

function DetailField({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-stone-400 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-0.5 text-sm font-medium text-stone-900 ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </dd>
    </div>
  )
}

// ---- Main Component ----

type Props = {
  equipment: Equipment
  workOrders: WorkOrder[]
  spareParts: SparePart[]
  meterReadings: MeterReading[]
  role: OrgRole
}

export function EquipmentDetail({ equipment, workOrders, spareParts, meterReadings, role }: Props) {
  const router = useRouter()
  const canManage = role === 'OWNER' || role === 'ADMIN'

  // Status change handler
  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return
    const result = await updateEquipmentStatus(equipment.id, newStatus)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Statut mis à jour')
      router.refresh()
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!confirm('Supprimer cet équipement ? Cette action est irréversible.')) return
    const result = await deleteEquipment(equipment.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Équipement supprimé')
      router.push('/actifs')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="font-heading text-2xl text-stone-900">
              {equipment.designation}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-sm text-stone-400">{equipment.code}</span>
              <StatusBadge status={equipment.status} />
              <CriticalityBadge criticality={equipment.criticality} />
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {/* Status dropdown */}
            <Select
              value={equipment.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_CONFIG) as EquipmentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <EquipmentFormDialog mode="edit" equipment={equipment}>
              <Button variant="outline" size="sm">
                <Pencil className="size-3.5" />
                Modifier
              </Button>
            </EquipmentFormDialog>

            <Button variant="destructive" size="icon-sm" onClick={handleDelete}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="specs">
        <TabsList variant="line">
          <TabsTrigger value="specs">Spécifications</TabsTrigger>
          <TabsTrigger value="workorders">Historique OT</TabsTrigger>
          <TabsTrigger value="spareparts">Pièces de rechange</TabsTrigger>
          <TabsTrigger value="readings">Relevés</TabsTrigger>
        </TabsList>

        {/* Specifications Tab */}
        <TabsContent value="specs">
          <div className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Code" value={equipment.code} mono />
              <DetailField label="Désignation" value={equipment.designation} />
              <DetailField label="Marque" value={equipment.brand} />
              <DetailField label="Modèle" value={equipment.model} />
              <DetailField label="N° série" value={equipment.serial_number} mono />
              <DetailField label="Emplacement" value={equipment.location} />
              <DetailField label="Site" value={equipment.site} />
              <DetailField label="Atelier" value={equipment.workshop} />
              <DetailField label="Type" value={TYPE_LABELS[equipment.type] ?? equipment.type} />
              <DetailField label="Groupe" value={GROUP_LABELS[equipment.group_name] ?? equipment.group_name} />
              <DetailField label="Criticité" value={equipment.criticality} />
              <DetailField label="Date mise en service" value={formatDate(equipment.commission_date)} />
              <DetailField label="Compteur heures" value={`${equipment.hours_counter}h`} mono />
              <DetailField label="Fréquence préventive" value={equipment.preventive_freq} />
              <DetailField label="Dernière révision" value={formatDate(equipment.last_revision)} />
              <DetailField label="Prochaine révision" value={formatDate(equipment.next_revision)} />
              <DetailField label="Puissance nominale" value={equipment.rated_power_kw ? `${equipment.rated_power_kw} kW` : null} mono />
              <DetailField label="Type carburant" value={equipment.fuel_type} />
              <DetailField label="Consommation" value={equipment.fuel_consumption_rate ? `${equipment.fuel_consumption_rate} L/h` : null} mono />
              <DetailField label="Coût total maintenance" value={formatCurrency(equipment.total_main_cost)} mono />
            </dl>
          </div>
        </TabsContent>

        {/* Work Orders Tab */}
        <TabsContent value="workorders">
          <div className="mt-4 rounded-xl border border-stone-200 bg-white">
            {workOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-mono text-sm">{wo.code}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OT_TYPE_LABELS[wo.type]?.color ?? ''}`}>
                          {OT_TYPE_LABELS[wo.type]?.label ?? wo.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OT_STATUS_LABELS[wo.status]?.color ?? ''}`}>
                          {OT_STATUS_LABELS[wo.status]?.label ?? wo.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_LABELS[wo.priority]?.color ?? ''}`}>
                          {PRIORITY_LABELS[wo.priority]?.label ?? wo.priority}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {formatDate(wo.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-sm text-stone-400">
                Aucun ordre de travail pour cet équipement.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Spare Parts Tab */}
        <TabsContent value="spareparts">
          <div className="mt-4 rounded-xl border border-stone-200 bg-white">
            {spareParts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Coût unitaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spareParts.map((sp) => (
                    <TableRow key={sp.id}>
                      <TableCell className="text-sm">{sp.description ?? '—'}</TableCell>
                      <TableCell className="font-mono text-sm">{sp.reference ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{sp.quantity}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(sp.unit_cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-sm text-stone-400">
                Aucune pièce de rechange enregistrée.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Meter Readings Tab */}
        <TabsContent value="readings">
          <div className="mt-4 rounded-xl border border-stone-200 bg-white">
            {meterReadings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Valeur</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meterReadings.map((mr) => (
                    <TableRow key={mr.id}>
                      <TableCell className="text-sm">
                        {METER_TYPE_LABELS[mr.type] ?? mr.type}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {mr.value}
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {formatDate(mr.read_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-sm text-stone-400">
                Aucun relevé enregistré.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

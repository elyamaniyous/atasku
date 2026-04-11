'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { OTStatusBadge, PriorityBadge, TypeBadge } from '@/components/ot/ot-badges'
import type { OTStatus, Priority, WorkOrderType } from '@/lib/types/database'

export type OTTableRow = {
  id: string
  code: string
  equipment_designation: string | null
  equipment_code: string | null
  type: WorkOrderType
  priority: Priority
  status: OTStatus
  technician_name: string | null
  created_at: string
  estimated_duration: number | null
}

const columnHelper = createColumnHelper<OTTableRow>()

const columns = [
  columnHelper.accessor('code', {
    header: 'Code',
    cell: (info) => (
      <span className="font-mono text-xs font-medium text-stone-700">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('equipment_designation', {
    header: 'Équipement',
    cell: (info) => (
      <span className="text-sm text-stone-700">
        {info.getValue() ?? <span className="text-stone-400">—</span>}
      </span>
    ),
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell: (info) => <TypeBadge type={info.getValue()} />,
  }),
  columnHelper.accessor('priority', {
    header: 'Priorité',
    cell: (info) => <PriorityBadge priority={info.getValue()} />,
  }),
  columnHelper.accessor('status', {
    header: 'Statut',
    cell: (info) => <OTStatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('technician_name', {
    header: 'Technicien',
    cell: (info) => {
      const name = info.getValue()
      return name ? (
        <span className="text-sm text-stone-700">{name}</span>
      ) : (
        <span className="text-sm text-stone-400">Non affecté</span>
      )
    },
  }),
  columnHelper.accessor('created_at', {
    header: 'Créé le',
    cell: (info) => (
      <span className="text-sm text-stone-600">
        {format(new Date(info.getValue()), 'dd MMM yyyy', { locale: fr })}
      </span>
    ),
  }),
  columnHelper.accessor('estimated_duration', {
    header: 'Durée est.',
    cell: (info) => {
      const hours = info.getValue()
      return hours ? (
        <span className="font-mono text-xs text-stone-600">{hours}h</span>
      ) : (
        <span className="text-stone-400">—</span>
      )
    },
  }),
]

const PAGE_SIZES = [10, 25, 50]

export function OTTable({ data }: { data: OTTableRow[] }) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageSize, setPageSize] = useState(10)

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-stone-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none text-xs font-semibold text-stone-500 uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="size-3 text-stone-400" />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-stone-500">
                  Aucun ordre de travail trouvé.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-stone-50"
                  onClick={() => router.push(`/ordres/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span>Afficher</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value)
              setPageSize(newSize)
              table.setPageSize(newSize)
            }}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>par page</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">
            Page {table.getState().pagination.pageIndex + 1} sur{' '}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

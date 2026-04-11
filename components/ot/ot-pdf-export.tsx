'use client'

import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type PDFType = 'di' | 'bt' | 'rs'

const PDF_OPTIONS: { type: PDFType; label: string; description: string }[] = [
  {
    type: 'di',
    label: "Demande d'Intervention (DI)",
    description: 'Formulaire de demande initiale',
  },
  {
    type: 'bt',
    label: 'Bon de Travail (BT)',
    description: 'Document de travail complet',
  },
  {
    type: 'rs',
    label: 'Rapport de Service (RS)',
    description: "Rapport d'intervention",
  },
]

export function OTPDFExport({ workOrderId }: { workOrderId: string }) {
  const [loading, setLoading] = useState<PDFType | null>(null)

  async function handleDownload(type: PDFType) {
    setLoading(type)
    try {
      const url = `/api/pdf/${type}?workOrderId=${workOrderId}`
      // Use fetch to get the PDF blob, then trigger download
      const res = await fetch(url)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Erreur lors de la generation du PDF')
      }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${type.toUpperCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('PDF download error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <FileText className="size-4 mr-1.5" />
            Exporter PDF
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Exporter en PDF</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PDF_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.type}
            disabled={loading !== null}
            onSelect={() => handleDownload(opt.type)}
          >
            <div className="flex items-center gap-2">
              {loading === opt.type ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-stone-500">{opt.description}</div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

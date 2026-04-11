import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import {
  styles,
  PDFHeader,
  PDFFooter,
  PDFField,
  PDFTable,
  PDFSignatures,
  formatDateTimeFR,
  formatCurrency,
  priorityLabel,
  statusLabel,
  typeLabel,
} from './shared'

export type BTDocumentProps = {
  wo: {
    code: string
    type: string
    status: string
    priority: string
    description: string
    cause: string | null
    estimated_duration: number | null
    actual_duration: number | null
    parts_cost: number
    labor_cost: number
    created_at: string
    started_at: string | null
    completed_at: string | null
    equipment: {
      code: string
      designation: string
      location?: string | null
      brand?: string | null
      model?: string | null
      status?: string
    } | null
  }
  orgName: string
  techName: string
  creatorName: string
  interventions: {
    part_usages?: {
      description: string
      reference: string | null
      quantity: number
      unit_cost: number
    }[]
  }[]
}

export function BTDocument({ wo, orgName, techName, creatorName, interventions }: BTDocumentProps) {
  // Gather all parts from interventions
  const allParts = interventions.flatMap(
    (i) => (i.part_usages || []).map((p) => ({
      description: p.description,
      reference: p.reference || '—',
      quantity: p.quantity,
      unitCost: p.unit_cost,
      total: p.quantity * p.unit_cost,
    }))
  )

  const totalCost = wo.parts_cost + wo.labor_cost

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          companyName={orgName}
          docTitle="BON DE TRAVAIL"
          docRef={wo.code}
          date={formatDateTimeFR(wo.created_at)}
        />

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <PDFField label="Code" value={wo.code} />
          <PDFField label="Type" value={typeLabel(wo.type)} />
          <PDFField label="Priorite" value={priorityLabel(wo.priority)} />
          <PDFField label="Statut" value={statusLabel(wo.status)} />
          <PDFField label="Date de creation" value={formatDateTimeFR(wo.created_at)} />
          <PDFField label="Date de debut" value={formatDateTimeFR(wo.started_at)} />
          <PDFField label="Date de fin" value={formatDateTimeFR(wo.completed_at)} />
        </View>

        {/* Equipement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipement</Text>
          <PDFField label="Code" value={wo.equipment?.code} />
          <PDFField label="Designation" value={wo.equipment?.designation} />
          <PDFField label="Localisation" value={wo.equipment?.location} />
          <PDFField label="Marque" value={wo.equipment?.brand} />
          <PDFField label="Modele" value={wo.equipment?.model} />
        </View>

        {/* Affectation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affectation</Text>
          <PDFField label="Technicien" value={techName} />
          <PDFField
            label="Duree estimee"
            value={wo.estimated_duration ? `${wo.estimated_duration}h` : null}
          />
          <PDFField
            label="Duree reelle"
            value={wo.actual_duration ? `${wo.actual_duration}h` : null}
          />
        </View>

        {/* Description des travaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description des travaux</Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 9, color: '#78716C', marginBottom: 4 }}>
              Description :
            </Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
              {wo.description}
            </Text>
          </View>
          {wo.cause && (
            <View>
              <Text style={{ fontSize: 9, color: '#78716C', marginBottom: 4 }}>
                Cause :
              </Text>
              <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                {wo.cause}
              </Text>
            </View>
          )}
        </View>

        {/* Pieces necessaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pieces necessaires</Text>
          <PDFTable
            headers={[
              { label: 'Description', width: '35%' },
              { label: 'Reference', width: '20%' },
              { label: 'Quantite', width: '15%' },
              { label: 'Cout unit.', width: '15%' },
              { label: 'Total', width: '15%' },
            ]}
            rows={allParts.map((p) => [
              p.description,
              p.reference,
              p.quantity,
              formatCurrency(p.unitCost),
              formatCurrency(p.total),
            ])}
          />
        </View>

        {/* Couts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Couts</Text>
          <PDFField label="Cout pieces" value={formatCurrency(wo.parts_cost)} />
          <PDFField label="Cout main-d'oeuvre" value={formatCurrency(wo.labor_cost)} />
          <View style={[styles.fieldRow, { borderTopWidth: 1, borderColor: '#E7E5E4', paddingTop: 4, marginTop: 4 }]}>
            <Text style={[styles.fieldLabel, { fontFamily: 'Helvetica-Bold' }]}>TOTAL</Text>
            <Text style={[styles.fieldValue, { fontSize: 12, color: '#DC2626' }]}>
              {formatCurrency(totalCost)}
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <PDFSignatures labels={['Demandeur', 'Technicien', 'Responsable']} />

        <PDFFooter />
      </Page>
    </Document>
  )
}

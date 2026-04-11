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
} from './shared'

export type RSDocumentProps = {
  wo: {
    code: string
    created_at: string
    equipment: {
      code: string
      designation: string
    } | null
  }
  orgName: string
  techName: string
  interventions: {
    id: string
    actions: string
    root_cause: string | null
    duration: number
    parts_cost: number
    labor_cost: number
    started_at: string
    completed_at: string | null
    part_usages?: {
      description: string
      reference: string | null
      quantity: number
      unit_cost: number
    }[]
  }[]
}

export function RSDocument({ wo, orgName, techName, interventions }: RSDocumentProps) {
  // Aggregate parts from all interventions
  const allParts = interventions.flatMap(
    (i) =>
      (i.part_usages || []).map((p) => ({
        description: p.description,
        reference: p.reference || '—',
        quantity: p.quantity,
        unitCost: p.unit_cost,
        total: p.quantity * p.unit_cost,
      }))
  )

  const totalPartsCost = interventions.reduce((sum, i) => sum + (i.parts_cost || 0), 0)
  const totalLaborCost = interventions.reduce((sum, i) => sum + (i.labor_cost || 0), 0)
  const totalDuration = interventions.reduce((sum, i) => sum + (i.duration || 0), 0)
  const totalCost = totalPartsCost + totalLaborCost

  // Combine actions / root causes
  const allActions = interventions.map((i) => i.actions).filter(Boolean).join('\n\n')
  const rootCauses = interventions
    .map((i) => i.root_cause)
    .filter(Boolean)
    .join('\n')

  const firstIntervention = interventions[0]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          companyName={orgName}
          docTitle="RAPPORT DE SERVICE"
          docRef={`RS-${wo.code}`}
          date={formatDateTimeFR(firstIntervention?.started_at || wo.created_at)}
        />

        {/* Intervention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intervention</Text>
          <PDFField label="Reference OT" value={wo.code} />
          <PDFField
            label="Date d'intervention"
            value={formatDateTimeFR(firstIntervention?.started_at)}
          />
          <PDFField label="Duree totale" value={`${totalDuration}h`} />
          <PDFField label="Technicien" value={techName} />
        </View>

        {/* Equipement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipement</Text>
          <PDFField label="Code" value={wo.equipment?.code} />
          <PDFField label="Designation" value={wo.equipment?.designation} />
        </View>

        {/* Actions effectuees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions effectuees</Text>
          {allActions ? (
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{allActions}</Text>
          ) : (
            <Text style={{ fontSize: 10, color: '#A8A29E' }}>
              Aucune action renseignee.
            </Text>
          )}
        </View>

        {/* Cause racine */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cause racine</Text>
          {rootCauses ? (
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{rootCauses}</Text>
          ) : (
            <Text style={{ fontSize: 10, color: '#A8A29E' }}>
              Non determinee.
            </Text>
          )}
        </View>

        {/* Pieces utilisees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pieces utilisees</Text>
          <PDFTable
            headers={[
              { label: 'Description', width: '30%' },
              { label: 'Reference', width: '20%' },
              { label: 'Qte', width: '10%' },
              { label: 'Cout unit.', width: '20%' },
              { label: 'Total', width: '20%' },
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
          <PDFField label="Cout pieces" value={formatCurrency(totalPartsCost)} />
          <PDFField label="Cout main-d'oeuvre" value={formatCurrency(totalLaborCost)} />
          <View
            style={[
              styles.fieldRow,
              {
                borderTopWidth: 1,
                borderColor: '#E7E5E4',
                paddingTop: 4,
                marginTop: 4,
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { fontFamily: 'Helvetica-Bold' }]}>
              TOTAL
            </Text>
            <Text style={[styles.fieldValue, { fontSize: 12, color: '#DC2626' }]}>
              {formatCurrency(totalCost)}
            </Text>
          </View>
        </View>

        {/* Recommandations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#E7E5E4',
              borderRadius: 4,
              minHeight: 60,
              padding: 8,
            }}
          >
            <Text style={{ fontSize: 9, color: '#A8A29E' }}>
              (A remplir manuellement)
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <PDFSignatures labels={['Technicien', 'Client', 'Responsable']} />

        <PDFFooter />
      </Page>
    </Document>
  )
}

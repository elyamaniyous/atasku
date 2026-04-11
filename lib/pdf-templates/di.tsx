import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import {
  styles,
  PDFHeader,
  PDFFooter,
  PDFField,
  PDFSignatures,
  formatDateTimeFR,
  priorityLabel,
  typeLabel,
} from './shared'

export type DIDocumentProps = {
  wo: {
    code: string
    type: string
    priority: string
    description: string
    cause: string | null
    created_at: string
    equipment: {
      code: string
      designation: string
      location?: string | null
      status?: string
    } | null
  }
  orgName: string
  creatorName: string
  creatorRole: string
}

export function DIDocument({ wo, orgName, creatorName, creatorRole }: DIDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          companyName={orgName}
          docTitle="DEMANDE D'INTERVENTION"
          docRef={wo.code}
          date={formatDateTimeFR(wo.created_at)}
        />

        {/* Demandeur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demandeur</Text>
          <PDFField label="Nom" value={creatorName} />
          <PDFField label="Fonction" value={creatorRole || '—'} />
          <PDFField label="Date de la demande" value={formatDateTimeFR(wo.created_at)} />
        </View>

        {/* Equipement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipement</Text>
          <PDFField label="Code" value={wo.equipment?.code} />
          <PDFField label="Designation" value={wo.equipment?.designation} />
          <PDFField label="Localisation" value={wo.equipment?.location} />
          <PDFField label="Etat" value={wo.equipment?.status} />
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details de la demande</Text>
          <PDFField label="Type" value={typeLabel(wo.type)} />
          <PDFField label="Priorite" value={priorityLabel(wo.priority)} />
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 9, color: '#78716C', marginBottom: 4 }}>
              Description du probleme :
            </Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
              {wo.description}
            </Text>
          </View>
          {wo.cause && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 9, color: '#78716C', marginBottom: 4 }}>
                Cause presumee :
              </Text>
              <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                {wo.cause}
              </Text>
            </View>
          )}
        </View>

        {/* Signatures */}
        <PDFSignatures labels={['Demandeur', 'Responsable maintenance']} />

        <PDFFooter />
      </Page>
    </Document>
  )
}

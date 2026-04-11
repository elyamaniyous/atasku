import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'

// ---- Shared styles ----

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderColor: '#DC2626',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerLeft: {},
  headerRight: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#292524',
  },
  docTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#DC2626',
    marginTop: 4,
  },
  docRef: {
    fontSize: 9,
    color: '#78716C',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderColor: '#E7E5E4',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#78716C',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#292524',
    borderBottomWidth: 1,
    borderColor: '#E7E5E4',
    paddingBottom: 4,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldLabel: {
    width: 140,
    fontSize: 9,
    color: '#78716C',
  },
  fieldValue: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7F4F0',
    borderBottomWidth: 1,
    borderColor: '#E7E5E4',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#292524',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#F5F5F4',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
  },
  signatureLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '30%',
    borderTopWidth: 1,
    borderColor: '#292524',
    paddingTop: 4,
    textAlign: 'center',
    fontSize: 9,
  },
})

// ---- Shared components ----

export function PDFHeader({
  companyName,
  docTitle,
  docRef,
  date,
}: {
  companyName: string
  docTitle: string
  docRef: string
  date: string
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.docTitle}>{docTitle}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.docRef}>{docRef}</Text>
        <Text style={{ fontSize: 9, color: '#78716C', marginTop: 2 }}>
          {date}
        </Text>
      </View>
    </View>
  )
}

export function PDFFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text>Atasku — GMAO</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
      <Text>
        {`Imprime le ${new Date().toLocaleDateString('fr-FR')}`}
      </Text>
    </View>
  )
}

export function PDFField({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {value != null && value !== '' ? String(value) : '—'}
      </Text>
    </View>
  )
}

export function PDFTable({
  headers,
  rows,
}: {
  headers: { label: string; width: string }[]
  rows: (string | number)[][]
}) {
  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {headers.map((h, i) => (
          <Text
            key={i}
            style={[styles.tableHeaderCell, { width: h.width }]}
          >
            {h.label}
          </Text>
        ))}
      </View>
      {/* Rows */}
      {rows.length === 0 ? (
        <View style={[styles.tableRow, { justifyContent: 'center' }]}>
          <Text style={[styles.tableCell, { color: '#A8A29E' }]}>
            Aucune donnee
          </Text>
        </View>
      ) : (
        rows.map((row, ri) => (
          <View key={ri} style={styles.tableRow}>
            {row.map((cell, ci) => (
              <Text
                key={ci}
                style={[styles.tableCell, { width: headers[ci]?.width }]}
              >
                {cell != null ? String(cell) : '—'}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  )
}

export function PDFSignatures({ labels }: { labels: string[] }) {
  return (
    <View style={styles.signatureLine}>
      {labels.map((label, i) => (
        <View key={i} style={styles.signatureBox}>
          <Text style={{ marginBottom: 30 }}>{label}</Text>
          <Text style={{ fontSize: 8, color: '#78716C' }}>
            Date : ___/___/______
          </Text>
          <Text style={{ fontSize: 8, color: '#78716C', marginTop: 4 }}>
            Signature :
          </Text>
        </View>
      ))}
    </View>
  )
}

// ---- Helper to format dates in FR ----

export function formatDateFR(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function formatDateTimeFR(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
}

// ---- Translate helpers ----

const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  NORMAL: 'Normal',
  LOW: 'Faible',
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouveau',
  ASSIGNED: 'Affecte',
  IN_PROGRESS: 'En cours',
  ON_HOLD: 'En attente',
  COMPLETED: 'Termine',
  CANCELLED: 'Annule',
}

const TYPE_LABELS: Record<string, string> = {
  CORRECTIVE: 'Correctif',
  PREVENTIVE: 'Preventif',
  CONDITIONAL: 'Conditionnel',
  IMPROVEMENT: 'Amelioration',
}

export function priorityLabel(p: string): string {
  return PRIORITY_LABELS[p] || p
}

export function statusLabel(s: string): string {
  return STATUS_LABELS[s] || s
}

export function typeLabel(t: string): string {
  return TYPE_LABELS[t] || t
}

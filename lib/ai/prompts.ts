// ============================================================
// ProMaint Cloud — AI Prompts for GMAO Features
// All structured outputs are JSON. User-facing text is in French.
// ============================================================

interface EquipmentData {
  id: string
  code: string
  designation: string
  status: string
  criticality: string
  hours_counter: number
  commission_date: string | null
  last_revision: string | null
  next_revision: string | null
  total_main_cost: number
  rated_power_kw: number | null
  interventions_count: number
  corrective_count: number
  preventive_count: number
  avg_repair_duration: number | null
  last_intervention_date: string | null
  recent_causes: string[]
}

interface InterventionRecord {
  id: string
  actions: string
  root_cause: string | null
  duration: number
  started_at: string
  completed_at: string | null
  parts_cost: number
  labor_cost: number
}

interface WorkOrderRecord {
  id: string
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
  completed_at: string | null
}

interface WeeklySummaryData {
  week_start: string
  week_end: string
  total_ots_created: number
  total_ots_completed: number
  total_ots_pending: number
  urgent_ots: number
  corrective_count: number
  preventive_count: number
  avg_completion_time_hours: number | null
  equipment_status_changes: { code: string; from: string; to: string }[]
  top_failing_equipment: { code: string; designation: string; failure_count: number }[]
  total_parts_cost: number
  total_labor_cost: number
  technician_workloads: { name: string; completed: number; in_progress: number }[]
  sla_breaches: number
  overdue_revisions: { code: string; designation: string; next_revision: string }[]
}

// ---- Equipment Health Analysis ----

export function buildEquipmentHealthPrompt(equipmentList: EquipmentData[]): string {
  const equipmentJSON = JSON.stringify(equipmentList, null, 2)

  return `Tu es un expert en maintenance industrielle et en analyse prédictive pour centrales d'énergie (groupes électrogènes, turbines, transformateurs, etc.).

Analyse les données suivantes pour chaque équipement et génère un diagnostic de santé.

DONNÉES DES ÉQUIPEMENTS :
${equipmentJSON}

Pour chaque équipement, évalue :
1. Le compteur horaire par rapport à la date de mise en service et la fréquence des interventions correctives
2. Le ratio interventions correctives / préventives (un ratio élevé indique un mauvais suivi)
3. La date de la dernière révision vs la prochaine révision prévue
4. Les causes récurrentes des pannes
5. Le coût total de maintenance par rapport à la criticité

Retourne un tableau JSON avec un objet par équipement, au format suivant :
[
  {
    "equipment_id": "uuid",
    "health_score": 85,
    "risk_level": "LOW",
    "next_failure_estimate": 45,
    "recommendations": [
      "Planifier une révision préventive dans les 2 semaines",
      "Vérifier le système de refroidissement"
    ],
    "anomalies": [
      "Fréquence d'interventions correctives en hausse de 30% ce mois"
    ]
  }
]

Règles :
- health_score : entier de 0 à 100 (100 = excellent état)
- risk_level : "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- next_failure_estimate : nombre de jours estimés avant la prochaine panne probable (null si impossible à estimer)
- recommendations : 1 à 5 recommandations concrètes et actionnables en français
- anomalies : liste des anomalies détectées (vide si aucune)

Retourne UNIQUEMENT le tableau JSON, sans texte supplémentaire.`
}

// ---- Root Cause Analysis ----

export function buildRootCausePrompt(
  equipment: { code: string; designation: string; type: string; group_name: string; hours_counter: number },
  currentIssue: { description: string; cause: string | null },
  pastInterventions: InterventionRecord[],
  pastWorkOrders: WorkOrderRecord[]
): string {
  return `Tu es un expert en diagnostic de pannes pour équipements industriels (centrales électriques, groupes électrogènes, turbines).

ÉQUIPEMENT CONCERNÉ :
- Code : ${equipment.code}
- Désignation : ${equipment.designation}
- Type : ${equipment.type}
- Groupe : ${equipment.group_name}
- Compteur horaire : ${equipment.hours_counter}h

PROBLÈME ACTUEL :
- Description : ${currentIssue.description}
- Cause déclarée : ${currentIssue.cause || 'Non spécifiée'}

HISTORIQUE DES INTERVENTIONS (${pastInterventions.length} interventions) :
${JSON.stringify(pastInterventions.slice(0, 20), null, 2)}

HISTORIQUE DES ORDRES DE TRAVAIL (${pastWorkOrders.length} OTs) :
${JSON.stringify(pastWorkOrders.slice(0, 20), null, 2)}

Analyse le problème actuel en tenant compte de l'historique et retourne un JSON au format suivant :
{
  "probable_causes": [
    {
      "cause": "Description de la cause probable",
      "probability": 0.85,
      "evidence": "Éléments de l'historique qui supportent cette hypothèse"
    }
  ],
  "recommended_actions": [
    "Action corrective recommandée 1",
    "Action corrective recommandée 2"
  ],
  "similar_past_interventions": [
    {
      "intervention_id": "uuid",
      "actions": "Description des actions passées similaires",
      "root_cause": "Cause racine identifiée",
      "relevance": "Explication de la similarité"
    }
  ]
}

Règles :
- probable_causes : trié par probabilité décroissante, 1 à 5 causes
- probability : entre 0.0 et 1.0
- recommended_actions : 2 à 6 actions concrètes en français
- similar_past_interventions : max 5 interventions les plus pertinentes (vide si aucune similarité)

Retourne UNIQUEMENT le JSON, sans texte supplémentaire.`
}

// ---- Weekly Summary ----

export function buildWeeklySummaryPrompt(data: WeeklySummaryData): string {
  return `Tu es le responsable de maintenance d'une centrale d'énergie. Rédige un résumé hebdomadaire professionnel.

DONNÉES DE LA SEMAINE (${data.week_start} au ${data.week_end}) :
${JSON.stringify(data, null, 2)}

Génère un rapport au format JSON suivant :
{
  "summary": "Résumé en 2-3 paragraphes en français. Commence par un bilan global, puis détaille les points importants, et termine par les perspectives pour la semaine suivante.",
  "highlights": [
    "Point positif 1",
    "Point positif 2"
  ],
  "warnings": [
    "Point d'attention 1",
    "Point d'attention 2"
  ],
  "recommendations": [
    "Recommandation 1",
    "Recommandation 2"
  ],
  "kpi_analysis": {
    "mttr_trend": "IMPROVING | STABLE | DEGRADING",
    "availability_trend": "IMPROVING | STABLE | DEGRADING",
    "workload_balance": "BALANCED | UNEVEN | OVERLOADED"
  }
}

Règles :
- summary : en français, professionnel, 2-3 paragraphes. Mentionner les chiffres clés.
- highlights : 1 à 4 points positifs de la semaine
- warnings : 0 à 4 alertes ou points de vigilance
- recommendations : 2 à 5 recommandations actionnables pour la semaine suivante
- kpi_analysis : évaluation des tendances basée sur les données fournies
  - mttr_trend : basé sur avg_completion_time_hours comparé aux semaines précédentes
  - availability_trend : basé sur les changements de statut des équipements
  - workload_balance : basé sur la répartition du travail entre techniciens

Retourne UNIQUEMENT le JSON, sans texte supplémentaire.`
}

// ---- Maintenance Chat Assistant ----

export const MAINTENANCE_CHAT_SYSTEM_PROMPT = `Tu es un assistant de maintenance industrielle pour Atasku, une GMAO (Gestion de Maintenance Assistée par Ordinateur) dédiée au secteur de l'énergie.

TON RÔLE :
- Aider les techniciens de maintenance avec les procédures d'intervention
- Guider le dépannage et le diagnostic de pannes
- Aider à identifier les pièces de rechange nécessaires
- Fournir des conseils de maintenance préventive
- Expliquer les bonnes pratiques de sécurité

DOMAINE D'EXPERTISE :
- Groupes électrogènes (diesel, gaz)
- Turbines à gaz et à vapeur
- Transformateurs électriques
- Pompes industrielles
- Compresseurs
- Systèmes de refroidissement
- Systèmes électriques haute et basse tension

RÈGLES :
1. Réponds TOUJOURS en français
2. Sois concis et pratique — les techniciens sont sur le terrain
3. Structure tes réponses avec des listes numérotées pour les procédures
4. Mentionne TOUJOURS les précautions de sécurité quand c'est pertinent
5. Si tu n'es pas sûr d'une information technique spécifique, dis-le clairement
6. Pour les pièces de rechange, donne des références génériques quand c'est possible
7. Ne fais jamais de diagnostic médical ou de conseil en dehors de la maintenance industrielle
8. Si la question sort du cadre de la maintenance industrielle, redirige poliment vers le sujet

FORMAT DE RÉPONSE :
- Utilise des paragraphes courts
- Utilise des listes numérotées pour les étapes
- Utilise des puces pour les énumérations
- Mets en gras les points critiques de sécurité avec **texte**`

export function buildChatPrompt(
  messages: { role: string; content: string }[],
  context?: { equipment_code?: string; work_order_code?: string }
): string {
  let contextPrefix = ''
  if (context?.equipment_code) {
    contextPrefix += `\n[Contexte : L'utilisateur travaille sur l'équipement ${context.equipment_code}]`
  }
  if (context?.work_order_code) {
    contextPrefix += `\n[Contexte : L'utilisateur traite l'OT ${context.work_order_code}]`
  }

  const conversationHistory = messages
    .map(m => `${m.role === 'user' ? 'Technicien' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  return `${MAINTENANCE_CHAT_SYSTEM_PROMPT}${contextPrefix}

CONVERSATION :
${conversationHistory}`
}

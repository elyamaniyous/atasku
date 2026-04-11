export const PLANS = {
  FREE: {
    name: 'Gratuit',
    maxUsers: 3,
    maxEquipment: 10,
    maxStorageMb: 500,
    aiCallsPerWeek: 1,
    features: ['core_cmms', 'basic_pdf', 'email_alerts'],
    price: 0,
  },
  PRO: {
    name: 'Pro',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_placeholder',
    pricePerUser: 29,
    maxUsers: 20,
    maxEquipment: 100,
    maxStorageMb: 10240,
    aiCallsPerWeek: -1, // unlimited
    features: [
      'core_cmms',
      'ai_unlimited',
      'whatsapp',
      'sms',
      'pdf_branded',
      'offline_sync',
      'sla_tracking',
    ],
    price: 29,
  },
  ENTERPRISE: {
    name: 'Entreprise',
    maxUsers: -1, // unlimited
    maxEquipment: -1,
    maxStorageMb: -1,
    aiCallsPerWeek: -1,
    features: [
      'core_cmms',
      'ai_unlimited',
      'ai_custom',
      'whatsapp',
      'sms',
      'pdf_branded',
      'offline_sync',
      'sla_tracking',
      'api_access',
      'sso',
      'audit_log',
    ],
    price: -1, // custom
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanLimits(plan: PlanKey) {
  return PLANS[plan]
}

export function isFeatureAvailable(plan: PlanKey, feature: string): boolean {
  return (PLANS[plan].features as readonly string[]).includes(feature)
}

export function isPlanLimitReached(
  plan: PlanKey,
  metric: 'users' | 'equipment',
  currentCount: number
): boolean {
  const limits = PLANS[plan]
  const max = metric === 'users' ? limits.maxUsers : limits.maxEquipment
  return max !== -1 && currentCount >= max
}

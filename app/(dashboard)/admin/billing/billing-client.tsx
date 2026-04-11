'use client'

import { useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import {
  CreditCard,
  Users,
  HardDrive,
  Wrench,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { createCheckoutSession, createPortalSession } from '@/actions/billing'
import type { PLANS } from '@/lib/stripe/plans'

type BillingInfo = {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  planStatus: 'active' | 'past_due' | 'canceled' | 'trialing'
  trialDaysLeft: number
  usage: {
    users: { current: number; max: number }
    equipment: { current: number; max: number }
    storage: { current: number; max: number }
  }
  hasSubscription: boolean
}

function usagePercent(current: number, max: number): number {
  if (max <= 0) return 0 // unlimited
  return Math.min(100, Math.round((current / max) * 100))
}

function usageColor(percent: number): string {
  if (percent >= 90) return 'bg-red-600'
  if (percent >= 70) return 'bg-orange-500'
  return 'bg-emerald-600'
}

function planBadgeClass(plan: string): string {
  switch (plan) {
    case 'PRO':
      return 'bg-violet-100 text-violet-800 border-violet-200'
    case 'ENTERPRISE':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200'
  }
}

function statusBadge(status: string, trialDaysLeft: number) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="size-3" />
          Actif
        </span>
      )
    case 'trialing':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <Clock className="size-3" />
          Essai ({trialDaysLeft}j restants)
        </span>
      )
    case 'past_due':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          <AlertTriangle className="size-3" />
          Paiement en retard
        </span>
      )
    case 'canceled':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
          Annul&eacute;
        </span>
      )
    default:
      return null
  }
}

function formatLimit(current: number, max: number, unit?: string): string {
  const maxLabel = max <= 0 ? 'illimit\u00e9' : `${max}${unit ? ' ' + unit : ''}`
  return `${current} / ${maxLabel}`
}

export function BillingClient({
  billing,
  plans,
  success,
  canceled,
}: {
  billing: BillingInfo
  plans: typeof PLANS
  success: boolean
  canceled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (success) toast.success('Abonnement activ\u00e9 avec succ\u00e8s !')
    if (canceled) toast.info('Mise \u00e0 niveau annul\u00e9e.')
  }, [success, canceled])

  function handleUpgrade() {
    startTransition(async () => {
      const result = await createCheckoutSession()
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    })
  }

  function handleManage() {
    startTransition(async () => {
      const result = await createPortalSession()
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    })
  }

  const usersPercent = usagePercent(billing.usage.users.current, billing.usage.users.max)
  const equipPercent = usagePercent(billing.usage.equipment.current, billing.usage.equipment.max)
  const storagePercent = usagePercent(billing.usage.storage.current, billing.usage.storage.max)

  const planConfig = plans[billing.plan]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Facturation
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          G&eacute;rez votre abonnement et suivez votre consommation.
        </p>
      </div>

      {/* Past-due warning */}
      {billing.planStatus === 'past_due' && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Paiement en retard
            </p>
            <p className="mt-1 text-sm text-red-700">
              Votre paiement a &eacute;chou&eacute;. Mettez &agrave; jour vos informations de paiement pour &eacute;viter la r&eacute;trogradation de votre compte.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={handleManage}
              disabled={isPending}
            >
              Mettre &agrave; jour le paiement
            </Button>
          </div>
        </div>
      )}

      {/* Trial banner */}
      {billing.planStatus === 'trialing' && billing.trialDaysLeft <= 7 && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Il vous reste {billing.trialDaysLeft} jour{billing.trialDaysLeft > 1 ? 's' : ''} d&apos;essai Pro
            </p>
            <p className="mt-1 text-sm text-blue-700">
              Passez au Pro pour conserver toutes les fonctionnalit&eacute;s avanc&eacute;es apr&egrave;s la fin de l&apos;essai.
            </p>
            <Button
              size="sm"
              className="mt-3 bg-red-600 text-white hover:bg-red-700"
              onClick={handleUpgrade}
              disabled={isPending}
            >
              Passer au Pro
            </Button>
          </div>
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 text-stone-500" />
              <div>
                <CardTitle className="font-serif text-lg">Plan actuel</CardTitle>
                <CardDescription>
                  {billing.plan === 'FREE'
                    ? 'Fonctionnalit\u00e9s de base pour d\u00e9marrer'
                    : billing.plan === 'PRO'
                      ? `$${planConfig.price}/utilisateur/mois`
                      : 'Tarification personnalis\u00e9e'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={planBadgeClass(billing.plan)}
              >
                {planConfig.name}
              </Badge>
              {statusBadge(billing.planStatus, billing.trialDaysLeft)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {billing.plan === 'FREE' && (
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleUpgrade}
                disabled={isPending}
              >
                <ArrowUpRight className="mr-2 size-4" />
                {isPending ? 'Redirection...' : 'Passer au Pro \u2014 $29/utilisateur/mois'}
              </Button>
            )}
            {billing.plan === 'PRO' && billing.hasSubscription && (
              <Button
                variant="outline"
                onClick={handleManage}
                disabled={isPending}
              >
                <CreditCard className="mr-2 size-4" />
                {isPending ? 'Redirection...' : 'G\u00e9rer mon abonnement'}
              </Button>
            )}
            {billing.plan === 'ENTERPRISE' && (
              <Button variant="outline" disabled>
                Contactez votre gestionnaire de compte
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage meters */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Users */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-stone-500" />
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-2xl font-bold tabular-nums text-stone-900">
              {formatLimit(billing.usage.users.current, billing.usage.users.max)}
            </p>
            <Progress value={usersPercent}>
              <ProgressTrack className="h-2">
                <ProgressIndicator className={usageColor(usersPercent)} />
              </ProgressTrack>
            </Progress>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wrench className="size-4 text-stone-500" />
              <CardTitle className="text-sm font-medium">&Eacute;quipements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-2xl font-bold tabular-nums text-stone-900">
              {formatLimit(billing.usage.equipment.current, billing.usage.equipment.max)}
            </p>
            <Progress value={equipPercent}>
              <ProgressTrack className="h-2">
                <ProgressIndicator className={usageColor(equipPercent)} />
              </ProgressTrack>
            </Progress>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="size-4 text-stone-500" />
              <CardTitle className="text-sm font-medium">Stockage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-2xl font-bold tabular-nums text-stone-900">
              {formatLimit(billing.usage.storage.current, billing.usage.storage.max, 'Mo')}
            </p>
            <Progress value={storagePercent}>
              <ProgressTrack className="h-2">
                <ProgressIndicator className={usageColor(storagePercent)} />
              </ProgressTrack>
            </Progress>
          </CardContent>
        </Card>
      </div>

      {/* Feature comparison hint for FREE users */}
      {billing.plan === 'FREE' && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="mx-auto mb-3 size-8 text-red-600" />
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                D&eacute;bloquez tout le potentiel d&apos;Atasku
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                IA illimit&eacute;e, alertes WhatsApp &amp; SMS, rapports PDF personnalis&eacute;s,
                synchronisation hors-ligne et suivi SLA.
              </p>
              <Button
                className="mt-4 bg-red-600 text-white hover:bg-red-700"
                onClick={handleUpgrade}
                disabled={isPending}
              >
                {isPending ? 'Redirection...' : 'Passer au Pro \u2014 $29/utilisateur/mois'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

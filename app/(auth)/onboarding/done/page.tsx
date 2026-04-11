'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/onboarding/step-indicator'
import { getOrganization, updateOrganization } from '@/actions/org'
import { getEquipmentCount } from '@/actions/equipment'
import { getInvitationCount } from '@/actions/invitation'
import { Button } from '@/components/ui/button'
import { Loader2, Building2, Wrench, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DonePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [orgName, setOrgName] = useState('')
  const [eqCount, setEqCount] = useState(0)
  const [invCount, setInvCount] = useState(0)

  useEffect(() => {
    Promise.all([getOrganization(), getEquipmentCount(), getInvitationCount()]).then(
      ([org, eq, inv]) => {
        if (org && typeof org === 'object' && 'name' in org) {
          setOrgName((org as { name: string }).name)
        }
        setEqCount(eq)
        setInvCount(inv)
      }
    )
  }, [])

  function handleFinish() {
    startTransition(async () => {
      await updateOrganization({ onboarding_completed: true })
      router.push('/')
    })
  }

  return (
    <div className="text-center">
      <StepIndicator currentStep={4} />

      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="font-heading text-2xl text-stone-800">
          Tout est prêt !
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Votre espace Atasku est configuré
        </p>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 space-y-2"
      >
        <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-left">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50">
            <Building2 className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">Organisation</p>
            <p className="text-xs text-stone-500">{orgName || '...'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-left">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50">
            <Wrench className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">Équipements</p>
            <p className="text-xs text-stone-500">
              {eqCount} équipement{eqCount !== 1 ? 's' : ''} ajouté{eqCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-left">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">Équipe</p>
            <p className="text-xs text-stone-500">
              {invCount} invitation{invCount !== 1 ? 's' : ''} envoyée{invCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <Button
          size="lg"
          className="w-full bg-red-600 text-white hover:bg-red-700"
          onClick={handleFinish}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Aller au tableau de bord'
          )}
        </Button>
      </motion.div>
    </div>
  )
}

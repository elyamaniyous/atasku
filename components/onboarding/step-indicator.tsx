'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Organisation', number: 1 },
  { label: 'Équipements', number: 2 },
  { label: 'Équipe', number: 3 },
  { label: 'Terminé', number: 4 },
]

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEPS.map((step, i) => {
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep
        const isPending = step.number > currentStep

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isCompleted && 'bg-green-600 text-white',
                  isActive && 'bg-red-600 text-white',
                  isPending && 'border-2 border-stone-300 text-stone-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'mt-1.5 hidden text-xs sm:block',
                  isCompleted && 'font-medium text-green-700',
                  isActive && 'font-semibold text-stone-800',
                  isPending && 'text-stone-400'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-8 sm:w-12',
                  step.number < currentStep ? 'bg-green-600' : 'bg-stone-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

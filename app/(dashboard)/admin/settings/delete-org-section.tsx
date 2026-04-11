'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2 } from 'lucide-react'

export function DeleteOrgSection({ orgName }: { orgName: string }) {
  const [confirmName, setConfirmName] = useState('')
  const nameMatches = confirmName === orgName

  return (
    <section className="rounded-xl border-2 border-red-200 bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="size-5 text-red-600" />
        </div>
        <div>
          <h2 className="font-heading text-lg text-red-700">Zone dangereuse</h2>
          <p className="mt-1 text-sm text-stone-600">
            La suppression de l&apos;organisation est irréversible. Toutes les données
            seront définitivement perdues.
          </p>
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="destructive" className="mt-4">
                  <Trash2 className="size-4" />
                  Supprimer l&apos;organisation
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Supprimer {orgName} ?</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible. Tapez le nom de l&apos;organisation pour
                  confirmer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p className="text-sm text-stone-600">
                  Tapez{' '}
                  <span className="font-mono font-semibold text-stone-900">
                    {orgName}
                  </span>{' '}
                  pour confirmer :
                </p>
                <Input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={orgName}
                />
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                Contactez le support pour supprimer votre organisation. Cette
                fonctionnalité sera disponible prochainement.
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Annuler
                </DialogClose>
                <Button variant="destructive" disabled>
                  <Trash2 className="size-4" />
                  Supprimer définitivement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  )
}

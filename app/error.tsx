'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4F0] px-4">
      <h1 className="font-heading text-4xl font-bold text-stone-800">Erreur</h1>
      <p className="mt-4 text-stone-600">
        Une erreur inattendue s&apos;est produite.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700"
      >
        Réessayer
      </button>
    </div>
  )
}

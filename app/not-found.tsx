import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4F0] px-4">
      <h1 className="font-heading text-6xl font-bold text-stone-800">404</h1>
      <p className="mt-4 text-lg text-stone-600">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}

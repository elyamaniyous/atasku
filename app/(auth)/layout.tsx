export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4F0] px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <h1 className="font-heading text-3xl text-stone-800 font-bold">Atasku</h1>
      </div>

      {/* Card container */}
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-sm ring-1 ring-stone-200/60">
        {children}
      </div>
    </div>
  )
}

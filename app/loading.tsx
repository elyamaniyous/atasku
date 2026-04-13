export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F4F0]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 animate-spin rounded-full border-4 border-stone-200 border-t-red-600" />
        <p className="text-sm text-stone-500">Chargement...</p>
      </div>
    </div>
  )
}

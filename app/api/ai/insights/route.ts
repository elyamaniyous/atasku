import { getCachedInsights } from '@/actions/ai'

export async function POST() {
  try {
    const data = await getCachedInsights()
    return Response.json(data)
  } catch {
    return Response.json(
      { error: 'Erreur lors de la generation des insights.' },
      { status: 500 }
    )
  }
}

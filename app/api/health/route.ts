import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('organizations').select('id').limit(1)
    return Response.json({
      status: error ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
    })
  } catch {
    return Response.json({ status: 'error' }, { status: 500 })
  }
}

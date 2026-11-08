import { DashboardClient, DASHBOARD_THEME_COOKIE, type DashboardThemeKey } from './dashboard-client'
import { getDashboardData } from '@/lib/db/dashboard-query'
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth/session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = await verifySessionToken(cookieStore.get(AUTH_COOKIE)?.value)
  if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
    redirect('/dashboard/login')
  }

  const sessionMeta = { role: session.role, shopId: session.shopId }
  const savedTheme = cookieStore.get(DASHBOARD_THEME_COOKIE)?.value
  const initialTheme = (['light', 'day', 'dark', 'night'] as const).find((t) => t === savedTheme) as DashboardThemeKey | undefined

  try {
    const data = await getDashboardData({
      shopId: session.role === 'manager' ? session.shopId : null,
    })
    return <DashboardClient data={data} session={sessionMeta} initialTheme={initialTheme} />
  } catch (err) {
    console.error('[dashboard page]', err)
    return <DashboardClient data={null} session={sessionMeta} initialTheme={initialTheme} />
  }
}

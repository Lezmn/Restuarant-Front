import { delay } from '@/lib/mock/db'
import { mockDashboard } from '@/lib/mock/reports'
import type { DashboardData } from '@/types/reports'

// ของจริงจะเป็น GET /reports/dashboard?date=... — backend ยังไม่มี module นี้
export async function getDashboard(): Promise<DashboardData> {
  await delay()
  return mockDashboard
}

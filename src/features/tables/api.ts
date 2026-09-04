import { delay, mockTables } from '@/lib/mock/db'
import type { RestaurantTable } from '@/types/models'

export async function getTables(): Promise<RestaurantTable[]> {
  await delay()
  return mockTables
}

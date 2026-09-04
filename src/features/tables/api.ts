import { delay, mockTables } from '@/lib/mock/db'
import type { RestaurantTable } from '@/types/models'

export async function getTables(): Promise<RestaurantTable[]> {
  await delay()
  // คืน copy เสมอ — ถ้าคืน array ตัวเดิม React Query จะได้ reference เดิม
  // แล้วหน้าจอจะไม่ re-render ทั้งที่ข้อมูลข้างในเปลี่ยนแล้ว
  // (API จริงคืน object ใหม่ทุกครั้งอยู่แล้ว ปัญหานี้มีเฉพาะตอนใช้ mock)
  return mockTables.map((t) => ({ ...t }))
}

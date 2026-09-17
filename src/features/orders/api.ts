import { apiClient } from '@/lib/api-client'
import { mapOrder } from '@/lib/map'
import type { ApiOrder } from '@/types/api'
import type { OrderStatus } from '@/types/enums'
import type { Id, Order } from '@/types/models'

/** GET /orders — ทุก role ที่ login แล้วดูได้ */
export async function getOrders(): Promise<Order[]> {
  const data = await apiClient<ApiOrder[]>('/orders')
  return data
    .map(mapOrder)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** PATCH /orders/:id/status @Roles(ADMIN, KITCHEN) — backend คุมลำดับสถานะให้เอง */
export async function updateOrderStatus(vars: {
  id: Id
  status: OrderStatus
}): Promise<Order> {
  const data = await apiClient<ApiOrder>(`/orders/${vars.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: vars.status }),
  })
  return mapOrder(data)
}

export interface NewOrderLine {
  menuItemId: Id
  quantity: number
  note: string
}

/**
 * POST /orders @Roles(ADMIN, STAFF) — พนักงานรับออเดอร์แทนลูกค้า
 * หมายเหตุ: endpoint นี้รับ tableId ไม่ใช่ tableSessionId
 */
export async function createOrder(vars: {
  tableId: Id
  lines: NewOrderLine[]
}): Promise<Order> {
  const lines = vars.lines.filter((l) => l.quantity > 0)
  if (lines.length === 0) throw new Error('กรุณาเลือกอย่างน้อย 1 รายการ')

  const data = await apiClient<ApiOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      tableId: vars.tableId,
      items: lines.map((l) => ({
        menuItemId: l.menuItemId,
        quantity: l.quantity,
        ...(l.note.trim() ? { note: l.note.trim() } : {}),
      })),
    }),
  })
  return mapOrder(data)
}

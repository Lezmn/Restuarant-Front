import { delay, mockOrders } from '@/lib/mock/db'
import type { OrderStatus } from '@/types/enums'
import type { Id, Order } from '@/types/models'

export async function getOrders(): Promise<Order[]> {
  await delay()
  return [...mockOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateOrderStatus(vars: {
  id: Id
  status: OrderStatus
}): Promise<Order> {
  await delay(200)
  const order = mockOrders.find((o) => o.id === vars.id)
  if (!order) throw new Error('ไม่พบออเดอร์')
  order.status = vars.status
  return order
}

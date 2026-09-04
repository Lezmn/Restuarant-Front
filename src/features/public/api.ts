import {
  delay,
  mockOrders,
  mockServiceRequests,
  mockSessions,
  nextOrderNumber,
} from '@/lib/mock/db'
import {
  OrderStatus,
  ServiceRequestStatus,
  ServiceRequestType,
  type PaymentMethod,
} from '@/types/enums'
import type { Order, TableSession } from '@/types/models'
import type { CartLine } from './cart-store'
import { lineUnitPrice } from './cart-store'

// ฝั่งลูกค้าเข้าผ่าน QR ไม่ต้อง login — ของจริงคือ endpoint ใต้ /public
// GET /public/sessions/:token, GET /public/sessions/:token/orders,
// POST /public/orders, POST /public/call-staff, POST /public/checkout

export async function getSessionByToken(token: string): Promise<TableSession> {
  await delay()
  const session = mockSessions.find((s) => s.token === token)
  if (!session) throw new Error('ไม่พบโต๊ะนี้ — กรุณาสแกน QR ใหม่อีกครั้ง')
  return session
}

export async function getSessionOrders(token: string): Promise<Order[]> {
  await delay()
  const session = mockSessions.find((s) => s.token === token)
  if (!session) throw new Error('ไม่พบโต๊ะนี้')
  return mockOrders
    .filter((o) => o.tableSessionId === session.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function submitOrder(vars: {
  token: string
  lines: CartLine[]
}): Promise<Order> {
  await delay(400)
  const session = mockSessions.find((s) => s.token === vars.token)
  if (!session) throw new Error('ไม่พบโต๊ะนี้')
  if (vars.lines.length === 0) throw new Error('ยังไม่มีรายการในตะกร้า')

  const order: Order = {
    id: `o-${Date.now()}`,
    orderNumber: nextOrderNumber(),
    tableSessionId: session.id,
    tableName: session.tableName,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    items: vars.lines.map((line, index) => ({
      id: `oi-${Date.now()}-${index}`,
      menuItemId: line.menuItemId,
      menuItemName: line.name,
      imageUrl: line.imageUrl,
      quantity: line.quantity,
      unitPrice: lineUnitPrice(line),
      note: line.note || null,
      optionNames: line.options.map((o) => o.name),
    })),
  }

  mockOrders.push(order)
  return order
}

export async function callStaff(vars: {
  token: string
  note?: string
}): Promise<void> {
  await delay(300)
  const session = mockSessions.find((s) => s.token === vars.token)
  if (!session) throw new Error('ไม่พบโต๊ะนี้')

  mockServiceRequests.push({
    id: `sr-${Date.now()}`,
    tableSessionId: session.id,
    tableName: session.tableName,
    type: ServiceRequestType.CALL_STAFF,
    status: ServiceRequestStatus.PENDING,
    paymentMethod: null,
    note: vars.note ?? null,
    createdAt: new Date().toISOString(),
  })
}

export async function requestCheckout(vars: {
  token: string
  method: PaymentMethod
}): Promise<void> {
  await delay(400)
  const session = mockSessions.find((s) => s.token === vars.token)
  if (!session) throw new Error('ไม่พบโต๊ะนี้')

  mockServiceRequests.push({
    id: `sr-${Date.now()}`,
    tableSessionId: session.id,
    tableName: session.tableName,
    type: ServiceRequestType.CHECKOUT,
    status: ServiceRequestStatus.PENDING,
    paymentMethod: vars.method,
    note: null,
    createdAt: new Date().toISOString(),
  })
}

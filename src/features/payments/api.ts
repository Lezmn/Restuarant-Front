import {
  delay,
  mockOrders,
  mockPayments,
  mockServiceRequests,
  mockSessions,
  mockTables,
} from '@/lib/mock/db'
import {
  OrderStatus,
  ServiceRequestStatus,
  TableSessionStatus,
  TableStatus,
  type PaymentMethod,
} from '@/types/enums'
import type { Id, Payment } from '@/types/models'

/**
 * ของจริงคือ POST /payments (@Roles ADMIN, CASHIER)
 * mock ตัวนี้ทำตามลำดับเดียวกับ payments.service.ts ฝั่ง NestJS ทุกขั้น:
 *   เช็คว่าทุกออเดอร์เสิร์ฟแล้ว → สร้าง Payment → ออเดอร์ SERVED เป็น PAID
 *   → ปิด session → คืนโต๊ะเป็น AVAILABLE → เคลียร์คำขอที่ค้าง
 */
export async function createPayment(vars: {
  tableSessionId: Id
  method: PaymentMethod
  amount: number
  note?: string
}): Promise<Payment> {
  await delay(400)

  const session = mockSessions.find((s) => s.id === vars.tableSessionId)
  if (!session) throw new Error('ไม่พบโต๊ะนี้')
  if (vars.amount <= 0) throw new Error('จำนวนเงินต้องมากกว่า 0')

  const sessionOrders = mockOrders.filter(
    (o) =>
      o.tableSessionId === session.id && o.status !== OrderStatus.CANCELLED,
  )

  // backend มี guard ข้อนี้ — พนักงานจะเจอจริงถ้ากดเช็คบิลตอนอาหารยังไม่เสิร์ฟครบ
  const notServed = sessionOrders.some(
    (o) => o.status !== OrderStatus.SERVED && o.status !== OrderStatus.PAID,
  )
  if (notServed) {
    throw new Error('ชำระเงินได้เมื่อทุกออเดอร์ใน session ถูกเสิร์ฟแล้ว')
  }

  const payment: Payment = {
    id: `pay-${Date.now()}`,
    tableSessionId: session.id,
    method: vars.method,
    amount: vars.amount,
    paidAt: new Date().toISOString(),
  }
  mockPayments.push(payment)

  for (const order of sessionOrders) {
    if (order.status === OrderStatus.SERVED) {
      order.status = OrderStatus.PAID
    }
  }

  session.status = TableSessionStatus.CLOSED
  session.closedAt = new Date().toISOString()

  const table = mockTables.find((t) => t.id === session.tableId)
  if (table) table.status = TableStatus.AVAILABLE

  for (const request of mockServiceRequests) {
    if (
      request.tableSessionId === session.id &&
      request.status === ServiceRequestStatus.PENDING
    ) {
      request.status = ServiceRequestStatus.RESOLVED
    }
  }

  return payment
}

import { apiClient } from '@/lib/api-client'
import { mapPayment } from '@/lib/map'
import type { ApiPayment } from '@/types/api'
import type { PaymentMethod } from '@/types/enums'
import type { Id, Payment } from '@/types/models'

/**
 * POST /payments @Roles(ADMIN, STAFF)
 * backend ทำในทรานแซกชันเดียว: สร้าง Payment + Receipt → ออเดอร์เป็น PAID
 * → ปิด session → คืนโต๊ะเป็นว่าง → เคลียร์คำขอที่ค้าง
 * และมี guard ว่าต้องเสิร์ฟครบทุกออเดอร์ก่อนถึงจะจ่ายได้
 */
export async function createPayment(vars: {
  tableSessionId: Id
  method: PaymentMethod
  /** ยอดที่เก็บจริง — ไม่ส่ง = เต็มบิล ส่วนต่างบันทึกเป็นส่วนลดในใบเสร็จ */
  amount?: number
  /** POST /payments ไม่ได้ส่ง tableSession กลับมา จึงต้องส่งชื่อโต๊ะมาเติมในใบเสร็จเอง */
  tableName: string
  /** หมายเหตุตอนรับเงิน — backend เก็บลง payment + receipt */
  note?: string
}): Promise<Payment> {
  const data = await apiClient<ApiPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      tableSessionId: vars.tableSessionId,
      method: vars.method,
      ...(vars.amount === undefined ? {} : { amount: vars.amount }),
      ...(vars.note ? { note: vars.note } : {}),
    }),
  })
  return mapPayment(data, vars.tableName)
}

/** GET /payments @Roles(ADMIN, STAFF) — รายการบิลทั้งหมด ล่าสุดก่อน (ไม่มี items ของใบเสร็จ) */
export async function getPayments(): Promise<Payment[]> {
  const data = await apiClient<ApiPayment[]>('/payments')
  return data.map((p) => mapPayment(p))
}

/** GET /payments/:id — ตัวเดียวที่ส่ง receipt.items มาด้วย ใช้ตอนเปิดดู/พิมพ์ใบเสร็จย้อนหลัง */
export async function getPayment(id: Id): Promise<Payment> {
  const data = await apiClient<ApiPayment>(`/payments/${id}`)
  return mapPayment(data)
}

/**
 * PATCH /payments/:id/void @Roles(ADMIN, STAFF)
 * backend: payment → VOIDED, ออเดอร์กลับเป็น SERVED + paymentId null,
 * และเปิด session/โต๊ะกลับให้ถ้าปิดไปแล้ว → เก็บเงินใหม่ได้เลย
 */
export async function voidPayment(vars: {
  id: Id
  reason?: string
}): Promise<Payment> {
  const data = await apiClient<ApiPayment>(`/payments/${vars.id}/void`, {
    method: 'PATCH',
    body: JSON.stringify(vars.reason ? { reason: vars.reason } : {}),
  })
  return mapPayment(data)
}

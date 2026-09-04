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
  /** POST /payments ไม่ได้ส่ง tableSession กลับมา จึงต้องส่งชื่อโต๊ะมาเติมในใบเสร็จเอง */
  tableName: string
}): Promise<Payment> {
  const data = await apiClient<ApiPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      tableSessionId: vars.tableSessionId,
      method: vars.method,
    }),
  })
  return mapPayment(data, vars.tableName)
}

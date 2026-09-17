import { apiClient } from '@/lib/api-client'
import type { ApiExpense } from '@/types/api'
import type { ExpenseCategory } from '@/types/enums'

/** POST /expenses @Roles(ADMIN) — backend ใช้เวลาปัจจุบันเป็น spentAt ถ้าไม่ส่ง */
export async function addExpense(vars: {
  detail: string
  category: ExpenseCategory
  amount: number
}): Promise<ApiExpense> {
  // backend ก็ validate อยู่แล้ว แต่ข้อความฝั่งนี้อ่านง่ายกว่า class-validator
  if (!vars.detail.trim()) throw new Error('กรุณากรอกรายละเอียด')
  if (!(vars.amount > 0)) throw new Error('จำนวนเงินต้องมากกว่า 0')

  return apiClient<ApiExpense>('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      title: vars.detail.trim(),
      category: vars.category,
      amount: vars.amount,
    }),
  })
}

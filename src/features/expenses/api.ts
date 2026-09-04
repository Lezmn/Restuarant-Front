import { delay } from '@/lib/mock/db'
import { mockFinance, mockTransactions } from '@/lib/mock/reports'
import type { ExpenseCategory, FinanceData } from '@/types/reports'

// ของจริงจะเป็น GET /reports/finance + POST /expenses
// backend ยังไม่มีทั้ง Expense model และ expenses module
export async function getFinance(): Promise<FinanceData> {
  await delay()
  return {
    ...mockFinance,
    transactions: [...mockTransactions].sort((a, b) =>
      b.date.localeCompare(a.date),
    ),
  }
}

export async function addExpense(vars: {
  detail: string
  category: ExpenseCategory
  amount: number
}): Promise<void> {
  await delay(300)
  if (!vars.detail.trim()) throw new Error('กรุณากรอกรายละเอียด')
  if (vars.amount <= 0) throw new Error('จำนวนเงินต้องมากกว่า 0')

  mockTransactions.push({
    id: `tx-${Date.now()}`,
    date: new Date().toISOString(),
    detail: vars.detail.trim(),
    category: vars.category,
    // รายจ่ายเก็บเป็นค่าลบ เพื่อให้รวมยอดในตารางเดียวกับรายรับได้
    amount: -Math.abs(vars.amount),
  })

  mockFinance.summary.expenseTotal += Math.abs(vars.amount)
  mockFinance.summary.netProfit -= Math.abs(vars.amount)
}

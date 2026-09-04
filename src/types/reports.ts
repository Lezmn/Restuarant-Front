import type { Id } from './models'

export interface DailySummary {
  /** วันที่ของสรุปชุดนี้ (ISO) */
  date: string
  revenue: number
  cashTotal: number
  promptPayTotal: number
  orderCount: number
}

export interface RevenuePoint {
  /** ป้ายแกน X เช่น "จ." "อ." */
  label: string
  date: string
  revenue: number
}

export interface TodayStatus {
  cashCount: number
  promptPayCount: number
  tablesInUse: number
  tablesTotal: number
  customerCount: number
}

export interface Notification {
  id: Id
  tableName: string
  method: 'CASH' | 'PROMPTPAY'
  amount: number
  createdAt: string
}

export interface DashboardData {
  summary: DailySummary
  trend: RevenuePoint[]
  todayStatus: TodayStatus
  notifications: Notification[]
}

export const ExpenseCategory = {
  INGREDIENT: 'INGREDIENT',
  RENT: 'RENT',
  UTILITY: 'UTILITY',
  OTHER: 'OTHER',
} as const
export type ExpenseCategory =
  (typeof ExpenseCategory)[keyof typeof ExpenseCategory]

export interface Transaction {
  id: Id
  date: string
  detail: string
  /** รายรับใช้ PaymentMethod, รายจ่ายใช้ ExpenseCategory */
  category: string
  /** บวก = รายรับ, ลบ = รายจ่าย */
  amount: number
}

export interface FinanceSummary {
  netProfit: number
  expenseTotal: number
  revenueTotal: number
  cashTotal: number
  promptPayTotal: number
  orderCount: number
}

export interface FinanceData {
  summary: FinanceSummary
  transactions: Transaction[]
}

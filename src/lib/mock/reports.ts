// ข้อมูลจำลองของฝั่งเจ้าของร้าน
// backend ยังไม่มี reports/expenses module — ตัวเลขทั้งหมดตรงกับที่ดีไซน์ใส่ไว้
// ตอนต่อ API จริงให้ลบไฟล์นี้ทิ้ง แล้วแก้แค่ features/reports/api.ts กับ features/expenses/api.ts
import { ExpenseCategory } from '@/types/reports'
import type {
  DashboardData,
  FinanceData,
  Transaction,
} from '@/types/reports'

const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString()

const daysAgo = (d: number) => {
  const date = new Date()
  date.setDate(date.getDate() - d)
  return date.toISOString()
}

export const mockDashboard: DashboardData = {
  summary: {
    date: new Date().toISOString(),
    revenue: 5000,
    cashTotal: 2500,
    promptPayTotal: 2500,
    orderCount: 28,
  },
  trend: [
    { label: 'จ.', date: daysAgo(6), revenue: 1200 },
    { label: 'อ.', date: daysAgo(5), revenue: 1800 },
    { label: 'พ.', date: daysAgo(4), revenue: 1500 },
    { label: 'พฤ.', date: daysAgo(3), revenue: 2000 },
    { label: 'ศ.', date: daysAgo(2), revenue: 2700 },
    { label: 'ส.', date: daysAgo(1), revenue: 3400 },
    { label: 'อา.', date: daysAgo(0), revenue: 3100 },
  ],
  todayStatus: {
    cashCount: 8,
    promptPayCount: 12,
    tablesInUse: 10,
    tablesTotal: 20,
    customerCount: 30,
  },
  notifications: [
    {
      id: 'n-1',
      tableName: '12',
      method: 'CASH',
      amount: 450,
      createdAt: minutesAgo(2),
    },
    {
      id: 'n-2',
      tableName: '3',
      method: 'PROMPTPAY',
      amount: 500,
      createdAt: minutesAgo(1),
    },
  ],
}

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    date: daysAgo(1),
    detail: 'ซื้อวัตถุดิบจากตลาด',
    category: ExpenseCategory.INGREDIENT,
    amount: -10000,
  },
  {
    id: 'tx-2',
    date: daysAgo(1),
    detail: 'ลูกค้าจ่ายเงินค่าอาหาร',
    category: 'PROMPTPAY',
    amount: 200,
  },
  {
    id: 'tx-3',
    date: daysAgo(2),
    detail: 'ค่าเช่าร้านประจำเดือน',
    category: ExpenseCategory.RENT,
    amount: -15000,
  },
  {
    id: 'tx-4',
    date: daysAgo(3),
    detail: 'ลูกค้าจ่ายเงินค่าอาหาร',
    category: 'CASH',
    amount: 850,
  },
]

export const mockFinance: FinanceData = {
  summary: {
    netProfit: 20000,
    expenseTotal: 10000,
    revenueTotal: 20000,
    cashTotal: 5000,
    promptPayTotal: 15000,
    orderCount: 67,
  },
  transactions: mockTransactions,
}

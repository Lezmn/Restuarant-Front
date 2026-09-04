import { ErrorNote } from '@/components/ui/ErrorNote'
import { StatCard } from '@/components/ui/StatCard'
import { useAddExpense, useFinance } from '@/features/expenses/hooks'
import { formatBaht } from '@/lib/format'
import { ExpenseCategory } from '@/types/reports'
import { useMemo, useState } from 'react'

const categoryLabel: Record<string, string> = {
  [ExpenseCategory.INGREDIENT]: 'วัตถุดิบ',
  [ExpenseCategory.RENT]: 'ค่าเช่าร้าน',
  [ExpenseCategory.UTILITY]: 'ค่าน้ำค่าไฟ',
  [ExpenseCategory.OTHER]: 'อื่น ๆ',
  PROMPTPAY: 'PromptPay',
  CASH: 'เงินสด',
}

const categoryTone: Record<string, string> = {
  [ExpenseCategory.INGREDIENT]: 'bg-danger/10 text-danger',
  [ExpenseCategory.RENT]: 'bg-brand-50 text-brand-500',
  [ExpenseCategory.UTILITY]: 'bg-brand-50 text-brand-500',
  [ExpenseCategory.OTHER]: 'bg-gray-100 text-gray-600',
  PROMPTPAY: 'bg-success/10 text-success',
  CASH: 'bg-success/10 text-success',
}

const filters = [
  { key: 'ALL', label: 'ทั้งหมด' },
  { key: ExpenseCategory.INGREDIENT, label: 'วัตถุดิบ' },
  { key: 'PROMPTPAY', label: 'PromptPay' },
  { key: 'CASH', label: 'เงินสด' },
  { key: ExpenseCategory.RENT, label: 'ค่าเช่าร้าน' },
]

const thaiDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export function FinancePage() {
  const { data, isPending } = useFinance()
  const addExpense = useAddExpense()
  const [filter, setFilter] = useState<string>('ALL')
  const [formOpen, setFormOpen] = useState(false)

  const transactions = useMemo(() => {
    const list = data?.transactions ?? []
    return filter === 'ALL' ? list : list.filter((t) => t.category === filter)
  }, [data, filter])

  if (isPending || !data) {
    return <p className="text-sm text-gray-500">กำลังโหลด...</p>
  }

  const { summary } = data

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-black">ภาพรวมทางการเงิน</h1>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="rounded-lg bg-danger px-4 py-2 text-sm font-bold text-white"
        >
          {formOpen ? 'ปิดฟอร์ม' : '+ รายจ่าย'}
        </button>
      </div>

      <ErrorNote error={addExpense.error} />

      {formOpen && <ExpenseForm onDone={() => setFormOpen(false)} />}

      {/* กำไร / รายจ่าย */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="กำไรสุทธิ"
          value={formatBaht(summary.netProfit)}
          tone="green"
          size="lg"
        />
        <StatCard
          label="รายจ่าย"
          value={formatBaht(summary.expenseTotal)}
          tone="red"
          size="lg"
        />
      </div>

      {/* สถิติย่อย */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="รายรับรวม"
          value={formatBaht(summary.revenueTotal)}
          tone="brand"
        />
        <StatCard
          label="จ่ายเงินสด"
          value={formatBaht(summary.cashTotal)}
          tone="orange"
        />
        <StatCard
          label="จ่าย PromptPay"
          value={formatBaht(summary.promptPayTotal)}
          tone="purple"
        />
        <StatCard
          label="จำนวนออเดอร์"
          value={summary.orderCount.toLocaleString('th-TH')}
          tone="olive"
        />
      </div>

      {/* ตัวกรองหมวดหมู่ */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 p-3">
        <span className="mr-1 text-sm text-gray-600">หมวดหมู่ :</span>
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.key
                ? 'border-brand-400 bg-brand-400 text-white'
                : 'border-brand-400 bg-white text-brand-400 hover:bg-brand-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* รายการล่าสุด */}
      <section className="rounded-xl border border-gray-200 p-4">
        <h2 className="mb-3 text-lg font-bold text-black">รายการล่าสุด</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-700">
                <th className="px-4 py-3 font-semibold">วันที่</th>
                <th className="px-4 py-3 font-semibold">รายละเอียด</th>
                <th className="px-4 py-3 font-semibold">หมวดหมู่</th>
                <th className="px-4 py-3 text-right font-semibold">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-gray-400">
                    ไม่มีรายการในหมวดนี้
                  </td>
                </tr>
              )}

              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {thaiDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-black">{tx.detail}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        categoryTone[tx.category] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {categoryLabel[tx.category] ?? tx.category}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-bold ${
                      tx.amount < 0 ? 'text-danger' : 'text-success'
                    }`}
                  >
                    {tx.amount < 0 ? '-' : '+'}
                    {formatBaht(Math.abs(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const addExpense = useAddExpense()
  const [detail, setDetail] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>(
    ExpenseCategory.INGREDIENT,
  )
  const [amount, setAmount] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        addExpense.mutate(
          { detail, category, amount: Number(amount) },
          { onSuccess: onDone },
        )
      }}
      className="grid gap-3 rounded-xl border-2 border-danger/40 bg-danger/5 p-4 sm:grid-cols-4"
    >
      <label className="text-sm sm:col-span-2">
        <span className="font-semibold text-gray-700">รายละเอียด</span>
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="เช่น ซื้อวัตถุดิบจากตลาด"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-300"
        />
      </label>

      <label className="text-sm">
        <span className="font-semibold text-gray-700">หมวดหมู่</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-300"
        >
          {Object.values(ExpenseCategory).map((c) => (
            <option key={c} value={c}>
              {categoryLabel[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="font-semibold text-gray-700">จำนวนเงิน (บาท)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-300"
        />
      </label>

      <div className="sm:col-span-4">
        <button
          type="submit"
          disabled={addExpense.isPending}
          className="rounded-lg bg-danger px-6 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {addExpense.isPending ? 'กำลังบันทึก...' : 'บันทึกรายจ่าย'}
        </button>
      </div>
    </form>
  )
}

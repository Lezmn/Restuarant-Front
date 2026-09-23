import { ErrorNote } from '@/components/ui/ErrorNote'
import { Pagination } from '@/components/ui/Pagination'
import { StatCard } from '@/components/ui/StatCard'
import { useAddExpense } from '@/features/expenses/hooks'
import { currentMonth } from '@/features/reports/api'
import { useFinance } from '@/features/reports/hooks'
import { formatBaht } from '@/lib/format'
import { usePagination } from '@/lib/use-pagination'
import { ExpenseCategory, PaymentMethod } from '@/types/enums'
import { useMemo, useState } from 'react'

/** ป้ายหมวดในตาราง — รายรับใช้วิธีจ่าย รายจ่ายใช้หมวดรายจ่าย */
const categoryLabel: Record<PaymentMethod | ExpenseCategory, string> = {
  [PaymentMethod.CASH]: 'เงินสด',
  [PaymentMethod.PROMPTPAY]: 'PromptPay',
  [ExpenseCategory.INGREDIENTS]: 'วัตถุดิบ',
  [ExpenseCategory.UTILITIES]: 'ค่าน้ำค่าไฟ',
  [ExpenseCategory.SALARY]: 'เงินเดือน',
  [ExpenseCategory.EQUIPMENT]: 'อุปกรณ์',
  [ExpenseCategory.RENT]: 'ค่าเช่าร้าน',
  [ExpenseCategory.OTHER]: 'อื่น ๆ',
}

const categoryTone: Record<PaymentMethod | ExpenseCategory, string> = {
  [PaymentMethod.CASH]: 'bg-success/10 text-success',
  [PaymentMethod.PROMPTPAY]: 'bg-success/10 text-success',
  [ExpenseCategory.INGREDIENTS]: 'bg-danger/10 text-danger',
  [ExpenseCategory.UTILITIES]: 'bg-brand-50 text-brand-500',
  [ExpenseCategory.SALARY]: 'bg-brand-50 text-brand-500',
  [ExpenseCategory.EQUIPMENT]: 'bg-brand-50 text-brand-500',
  [ExpenseCategory.RENT]: 'bg-brand-50 text-brand-500',
  [ExpenseCategory.OTHER]: 'bg-gray-100 text-gray-600',
}

type Filter = 'ALL' | PaymentMethod | ExpenseCategory

const filters: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'ทั้งหมด' },
  ...Object.values(PaymentMethod).map((m) => ({ key: m, label: categoryLabel[m] })),
  ...Object.values(ExpenseCategory).map((c) => ({ key: c, label: categoryLabel[c] })),
]

const thaiDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export function FinancePage() {
  const [month, setMonth] = useState(currentMonth)
  const { data, isPending, isError, error } = useFinance(month)
  const addExpense = useAddExpense()
  const [filter, setFilter] = useState<Filter>('ALL')
  const [formOpen, setFormOpen] = useState(false)

  const transactions = useMemo(() => {
    const list = data?.transactions ?? []
    return filter === 'ALL' ? list : list.filter((t) => t.category === filter)
  }, [data, filter])

  // ทั้งเดือนมีหลายสิบรายการ — ตัดเป็นหน้า ๆ (เปลี่ยนตัวกรองแล้ว usePagination clamp หน้าให้เอง)
  const paged = usePagination(transactions)

  if (isPending) {
    return <p className="text-sm text-gray-500">กำลังโหลด...</p>
  }
  if (isError || !data) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ'}
      </p>
    )
  }

  const { summary } = data

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-black">ภาพรวมทางการเงิน</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">
            <span className="sr-only">เดือน</span>
            {/* backend สรุปเป็นรายเดือน (?month=YYYY-MM) */}
            <input
              type="month"
              value={month}
              max={currentMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-brand-300"
            />
          </label>
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-bold text-white"
          >
            {formOpen ? 'ปิดฟอร์ม' : '+ รายจ่าย'}
          </button>
        </div>
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
          label="จำนวนบิล"
          value={summary.paymentCount.toLocaleString('th-TH')}
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

              {paged.pageItems.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {thaiDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-black">{tx.detail}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryTone[tx.category]}`}
                    >
                      {categoryLabel[tx.category]}
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

        <Pagination
          page={paged.page}
          totalPages={paged.totalPages}
          from={paged.from}
          to={paged.to}
          total={paged.total}
          onChange={paged.setPage}
        />
      </section>
    </div>
  )
}

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const addExpense = useAddExpense()
  const [detail, setDetail] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>(
    ExpenseCategory.INGREDIENTS,
  )
  const [amount, setAmount] = useState('')
  const [invalid, setInvalid] = useState('')

  const amountNum = Number(amount)
  const validate = () => {
    if (!detail.trim()) return 'กรุณากรอกรายละเอียด'
    if (amount.trim() === '' || !Number.isFinite(amountNum)) return 'กรุณากรอกจำนวนเงิน'
    if (amountNum <= 0) return 'จำนวนเงินต้องมากกว่า 0'
    return ''
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        // เช็คก่อนยิง ไม่งั้นได้ error 400 ดิบ ๆ จาก backend ซึ่งอ่านไม่รู้เรื่อง
        const problem = validate()
        setInvalid(problem)
        if (problem) return

        addExpense.mutate(
          { detail: detail.trim(), category, amount: amountNum },
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

      {invalid && (
        <p role="alert" className="text-sm font-semibold text-danger sm:col-span-4">
          {invalid}
        </p>
      )}

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

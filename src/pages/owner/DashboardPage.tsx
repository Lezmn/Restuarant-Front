import { StatCard } from '@/components/ui/StatCard'
import { TrendChart } from '@/components/ui/TrendChart'
import { useDashboard } from '@/features/reports/hooks'
import { formatBaht } from '@/lib/format'

const thaiDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const minutesSince = (iso: string) =>
  Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000))

export function DashboardPage() {
  const { data, isPending } = useDashboard()

  if (isPending || !data) {
    return <p className="text-sm text-gray-500">กำลังโหลด...</p>
  }

  const { summary, trend, todayStatus, notifications } = data

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <p className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800">
          📅 {thaiDate(summary.date)}
        </p>
      </div>

      {/* สรุปวันนี้ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="รายรับวันนี้"
          value={formatBaht(summary.revenue)}
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* กราฟแนวโน้ม */}
        <section className="rounded-xl border border-gray-200 p-4 lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-black">
            แนวโน้มรายรับ 7 วันที่ผ่านมา
          </h2>
          <TrendChart points={trend} />
        </section>

        {/* สถานะวันนี้ */}
        <section className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 text-lg font-bold text-black">สถานะวันนี้</h2>
          <dl className="divide-y divide-gray-200">
            <StatusRow
              label="จ่ายเงินสด"
              value={todayStatus.cashCount.toString()}
            />
            <StatusRow
              label="จ่าย PromptPay"
              value={todayStatus.promptPayCount.toString()}
            />
            <StatusRow
              label="โต๊ะที่ใช้งานอยู่"
              value={`${todayStatus.tablesInUse}/${todayStatus.tablesTotal}`}
            />
            <StatusRow
              label="ลูกค้าเข้าใช้บริการ"
              value={todayStatus.customerCount.toString()}
            />
          </dl>
        </section>
      </div>

      {/* การแจ้งเตือน */}
      <section className="rounded-xl border border-gray-200 p-4">
        <h2 className="mb-3 text-lg font-bold text-black">การแจ้งเตือน</h2>

        {notifications.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            ยังไม่มีการแจ้งเตือน
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((note) => (
              <li key={note.id} className="flex items-center gap-3 py-3">
                <span aria-hidden className="text-xl">
                  {note.method === 'CASH' ? '💰' : '📱'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-black">
                    โต๊ะ {note.tableName}{' '}
                    {note.method === 'CASH' ? 'จ่ายเงินสด' : 'จ่าย PromptPay'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {minutesSince(note.createdAt)} นาทีที่แล้ว
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-brand-400">
                  {formatBaht(note.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-sm text-gray-700">{label}</dt>
      <dd className="text-sm font-bold text-black">{value}</dd>
    </div>
  )
}

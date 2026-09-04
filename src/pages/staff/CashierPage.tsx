import { PageHeader } from '@/components/ui/PageHeader'

export function CashierPage() {
  return (
    <div>
      <PageHeader title="แคชเชียร์" description="รับชำระเงินและออกใบเสร็จ" />
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        ยังไม่ได้ทำหน้านี้ — ต่อกับ <code>POST /payments</code> และ{' '}
        <code>GET /table-sessions</code> ทีหลัง
      </div>
    </div>
  )
}

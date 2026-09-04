import { ErrorNote } from '@/components/ui/ErrorNote'
import { Modal } from '@/components/ui/Modal'
import { useOrders } from '@/features/orders/hooks'
import { useCreatePayment } from '@/features/payments/hooks'
import { useServiceRequests } from '@/features/service-requests/hooks'
import { formatBaht } from '@/lib/format'
import { mockSessions, orderTotal } from '@/lib/mock/db'
import {
  PaymentMethod,
  ServiceRequestStatus,
  ServiceRequestType,
  TableSessionStatus,
} from '@/types/enums'
import type { Id } from '@/types/models'
import { useState } from 'react'

const POLL_MS = 10_000

const methodLabel: Record<string, string> = {
  [PaymentMethod.CASH]: 'เงินสด',
  [PaymentMethod.CARD]: 'บัตร',
  [PaymentMethod.PROMPTPAY]: 'PromptPay',
}

// PromptPay = ฟ้า, เงินสด = ส้ม (บัตรใช้ฟ้าเหมือน PromptPay เพราะเป็นการจ่ายผ่านระบบ)
const methodColor: Record<string, string> = {
  [PaymentMethod.CASH]: 'text-brand-300',
  [PaymentMethod.CARD]: 'text-promptpay',
  [PaymentMethod.PROMPTPAY]: 'text-promptpay',
}

// สถานะที่กดได้ ต้องบอกให้รู้ว่ากดได้ — เข้มขึ้น + ขีดเส้นใต้ตอนชี้เมาส์
const methodHover: Record<string, string> = {
  [PaymentMethod.CASH]: 'hover:text-brand-400',
  [PaymentMethod.CARD]: 'hover:brightness-75',
  [PaymentMethod.PROMPTPAY]: 'hover:brightness-75',
}

const dialogTitle: Record<string, string> = {
  [PaymentMethod.CASH]: 'ชำระเงินสด',
  [PaymentMethod.CARD]: 'ชำระด้วยบัตร',
  [PaymentMethod.PROMPTPAY]: 'ชำระผ่าน PromptPay',
}

interface PayTarget {
  sessionId: Id
  tableName: string
  method: PaymentMethod
  amountDue: number
}

export function CheckPage() {
  const { data: orders, isPending } = useOrders({ refetchInterval: POLL_MS })
  const { data: requests } = useServiceRequests({ refetchInterval: POLL_MS })
  const createPayment = useCreatePayment()
  const [target, setTarget] = useState<PayTarget | null>(null)

  // ของจริงใช้ GET /table-sessions?status=OPEN — ตอนนี้อ่านจาก mock
  const openSessions = mockSessions.filter(
    (s) => s.status === TableSessionStatus.OPEN,
  )

  const rows = openSessions.map((session) => {
    const total = (orders ?? [])
      .filter((o) => o.tableSessionId === session.id)
      .reduce((sum, o) => sum + orderTotal(o), 0)

    const checkout = requests?.find(
      (r) =>
        r.tableSessionId === session.id &&
        r.type === ServiceRequestType.CHECKOUT &&
        r.status === ServiceRequestStatus.PENDING,
    )

    return { session, total, checkout }
  })

  return (
    <div>
      <ErrorNote error={createPayment.error} />

      {isPending && <p className="text-sm text-gray-500">กำลังโหลด...</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[600px] border-collapse text-center">
          <thead>
            <tr className="bg-table-head text-white">
              <th className="px-4 py-3 text-base font-bold sm:text-lg">โต๊ะ</th>
              <th className="px-4 py-3 text-base font-bold sm:text-lg">
                ราคาที่ต้องจ่าย
              </th>
              <th className="px-4 py-3 text-base font-bold sm:text-lg">
                รูปแบบการจ่าย
              </th>
              <th className="px-4 py-3 text-base font-bold sm:text-lg">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-sm text-gray-400">
                  ยังไม่มีโต๊ะที่เปิดอยู่
                </td>
              </tr>
            )}

            {rows.map(({ session, total, checkout }) => (
              <tr key={session.id} className="transition hover:bg-brand-50/60">
                <td className="px-4 py-3 font-bold text-black">
                  {session.tableName}
                </td>
                <td className="px-4 py-3 font-bold text-black">
                  {formatBaht(total)}
                </td>
                <td className="px-4 py-3">
                  {checkout?.paymentMethod ? (
                    <span
                      className={`font-semibold ${methodColor[checkout.paymentMethod]}`}
                    >
                      {methodLabel[checkout.paymentMethod]}
                    </span>
                  ) : (
                    <span className="text-gray-800">รอดำเนินการ</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {checkout ? (
                    <button
                      type="button"
                      onClick={() =>
                        setTarget({
                          sessionId: session.id,
                          tableName: session.tableName,
                          method: checkout.paymentMethod ?? PaymentMethod.CASH,
                          amountDue: total,
                        })
                      }
                      title="บันทึกการชำระเงิน"
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded font-semibold underline-offset-4 transition hover:underline focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none ${
                        methodColor[checkout.paymentMethod ?? PaymentMethod.CASH]
                      } ${methodHover[checkout.paymentMethod ?? PaymentMethod.CASH]}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                        className="h-4 w-4"
                      >
                        <path
                          d="M12 20h7M4 20h3l10-10-3-3L4 17z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      รอเช็คบิล
                    </button>
                  ) : (
                    <span className="text-gray-800">รอดำเนินการ</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {target && (
        <PaymentDialog
          target={target}
          isSaving={createPayment.isPending}
          onCancel={() => setTarget(null)}
          onSubmit={(amount, note) =>
            createPayment.mutate(
              {
                tableSessionId: target.sessionId,
                method: target.method,
                amount,
                note,
              },
              { onSuccess: () => setTarget(null) },
            )
          }
        />
      )}
    </div>
  )
}

function PaymentDialog({
  target,
  isSaving,
  onCancel,
  onSubmit,
}: {
  target: PayTarget
  isSaving: boolean
  onCancel: () => void
  onSubmit: (amount: number, note: string) => void
}) {
  // เติมยอดที่ต้องจ่ายไว้ให้ก่อน พนักงานแก้ได้ถ้าลูกค้าจ่ายไม่เท่ากัน
  const [amount, setAmount] = useState(String(target.amountDue))
  const [note, setNote] = useState('')

  return (
    <Modal title={dialogTitle[target.method]} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(Number(amount), note)
        }}
      >
        <p className="mb-3 text-sm text-gray-500">
          โต๊ะ {target.tableName} · ยอดที่ต้องจ่าย{' '}
          <span className="font-bold text-black">
            {formatBaht(target.amountDue)}
          </span>
        </p>

        <label className="block">
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4 text-brand-400">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5A2.5 2.5 0 0 1 12 8c1.4 0 2.5.9 2.5 2s-1.1 1.8-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" strokeLinecap="round" />
            </svg>
            ราคาที่จ่าย
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none focus:border-brand-300 focus:bg-white"
          />
        </label>

        <label className="mt-4 block">
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4 text-brand-400">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h10M7 13h6" strokeLinecap="round" />
            </svg>
            รายละเอียด
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none focus:border-brand-300 focus:bg-white"
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-danger py-2.5 font-bold text-white"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded bg-plus py-2.5 font-bold text-white disabled:opacity-60"
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

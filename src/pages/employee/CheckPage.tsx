import { ErrorNote } from '@/components/ui/ErrorNote'
import { Modal } from '@/components/ui/Modal'
import { useOrders } from '@/features/orders/hooks'
import { orderTotal } from '@/features/orders/order-total'
import { useCreatePayment } from '@/features/payments/hooks'
import { useServiceRequests } from '@/features/service-requests/hooks'
import { useSessions } from '@/features/table-sessions/hooks'
import { IS_DEMO_PROMPTPAY, PROMPTPAY_ID } from '@/lib/config'
import { formatBaht } from '@/lib/format'
import { LIVE_POLL_MS } from '@/lib/live'
import { buildPromptPayPayload } from '@/lib/promptpay'
import {
  OrderStatus,
  PaymentMethod,
  ServiceRequestStatus,
  ServiceRequestType,
  TableSessionStatus,
} from '@/types/enums'
import type { Id, Payment } from '@/types/models'
import { ReceiptDialog } from './ReceiptDialog'
import { QRCodeSVG } from 'qrcode.react'
import { useMemo, useState } from 'react'

const POLL_MS = LIVE_POLL_MS

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
  /** ลูกค้ากดเช็คบิลมาเองพร้อมเลือกวิธีจ่ายแล้วหรือยัง */
  chosenByCustomer: boolean
}

export function CheckPage() {
  const { data: requests } = useServiceRequests({ refetchInterval: POLL_MS })
  const { data: sessions, isPending } = useSessions({
    refetchInterval: POLL_MS,
  })
  const { data: orders } = useOrders({ refetchInterval: POLL_MS })
  const createPayment = useCreatePayment()
  const [target, setTarget] = useState<PayTarget | null>(null)
  /** ใบเสร็จที่เพิ่งออก — เปิดให้พิมพ์ทันทีหลังรับเงิน */
  const [receipt, setReceipt] = useState<Payment | null>(null)
  /** หมายเหตุที่พนักงานพิมพ์ตอนรับเงิน — backend ยังไม่มี field นี้ จึงติดไปกับใบเสร็จที่พิมพ์เท่านั้น */
  const [receiptNote, setReceiptNote] = useState('')

  const openSessions = (sessions ?? []).filter(
    (s) => s.status === TableSessionStatus.OPEN,
  )

  const rows = openSessions.map((session) => {
    const checkout = requests?.find(
      (r) =>
        r.tableSessionId === session.id &&
        r.type === ServiceRequestType.CHECKOUT &&
        r.status === ServiceRequestStatus.PENDING,
    )

    /**
     * ยอดที่ต้องจ่ายจริง = เฉพาะออเดอร์ที่ยังไม่ได้จ่ายและไม่ได้ยกเลิก
     * (field total ของ session รวมออเดอร์ที่จ่ายไปแล้วด้วย ทำให้ยอดบนจอ
     *  ไม่ตรงกับยอดที่ backend เก็บจริงตอนแยกบิล)
     */
    const unpaid = (orders ?? []).filter(
      (o) =>
        o.tableSessionId === session.id &&
        o.status !== OrderStatus.PAID &&
        o.status !== OrderStatus.CANCELLED,
    )
    const outstanding = unpaid.reduce((sum, o) => sum + orderTotal(o), 0)
    // backend ไม่ยอมให้จ่ายถ้ายังมีออเดอร์ที่ไม่ได้เสิร์ฟ — บอกไว้ก่อนกด จะได้ไม่เจอ error
    const notServed = unpaid.filter((o) => o.status !== OrderStatus.SERVED)

    return { session, outstanding, unpaid, notServed, checkout }
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

            {rows.map(
              ({ session, outstanding, unpaid, notServed, checkout }) => {
                // ถ้าลูกค้ายังไม่ได้กดเช็คบิล พนักงานก็เปิดบิลเองได้ ตั้งต้นเป็นเงินสด
                const method = checkout?.paymentMethod ?? PaymentMethod.CASH
                const blocked = unpaid.length === 0 || notServed.length > 0

                return (
                  <tr
                    key={session.id}
                    className="transition hover:bg-brand-50/60"
                  >
                    <td className="px-4 py-3 font-bold text-black">
                      {session.tableName}
                    </td>
                    <td className="px-4 py-3 font-bold text-black">
                      {formatBaht(outstanding)}
                    </td>
                    <td className="px-4 py-3">
                      {checkout?.paymentMethod ? (
                        <span
                          className={`font-semibold ${methodColor[checkout.paymentMethod]}`}
                        >
                          {methodLabel[checkout.paymentMethod]}
                        </span>
                      ) : (
                        <span className="text-gray-500">ลูกค้ายังไม่ได้เลือก</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {blocked ? (
                        <span
                          className="text-sm text-gray-500"
                          title={
                            unpaid.length === 0
                              ? 'ออเดอร์ในโต๊ะนี้จ่ายครบแล้ว'
                              : 'ต้องกดเสิร์ฟให้ครบทุกออเดอร์ก่อนจึงจะเก็บเงินได้'
                          }
                        >
                          {unpaid.length === 0
                            ? 'จ่ายครบแล้ว'
                            : `รออีก ${notServed.length} ออเดอร์`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setTarget({
                              sessionId: session.id,
                              tableName: session.tableName,
                              method,
                              amountDue: outstanding,
                              chosenByCustomer: Boolean(
                                checkout?.paymentMethod,
                              ),
                            })
                          }
                          title="บันทึกการชำระเงิน"
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded font-semibold underline-offset-4 transition hover:underline focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none ${
                            methodColor[method]
                          } ${methodHover[method]}`}
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
                          {checkout ? 'รอเช็คบิล' : 'เก็บเงิน'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              },
            )}
          </tbody>
        </table>
      </div>

      {receipt && (
        <ReceiptDialog
          payment={receipt}
          note={receiptNote}
          onClose={() => setReceipt(null)}
        />
      )}

      {target && (
        <PaymentDialog
          target={target}
          isSaving={createPayment.isPending}
          onCancel={() => setTarget(null)}
          onSubmit={(method, note) =>
            createPayment.mutate(
              {
                tableSessionId: target.sessionId,
                method,
                tableName: target.tableName,
              },
              {
                onSuccess: (payment) => {
                  setTarget(null)
                  setReceiptNote(note)
                  setReceipt(payment)
                },
              },
            )
          }
        />
      )}
    </div>
  )
}

const payMethods = [PaymentMethod.CASH, PaymentMethod.PROMPTPAY] as const

function PaymentDialog({
  target,
  isSaving,
  onCancel,
  onSubmit,
}: {
  target: PayTarget
  isSaving: boolean
  onCancel: () => void
  onSubmit: (method: PaymentMethod, note: string) => void
}) {
  // เติมยอดที่ต้องจ่ายไว้ให้ก่อน พนักงานแก้ได้ถ้าลูกค้าจ่ายไม่เท่ากัน
  const [amount, setAmount] = useState(String(target.amountDue))
  const [note, setNote] = useState('')
  // โต๊ะที่ลูกค้าไม่ได้กดเช็คบิลจาก QR ต้องให้พนักงานเลือกวิธีจ่ายเอง
  const [method, setMethod] = useState<PaymentMethod>(target.method)

  const isPromptPay = method === PaymentMethod.PROMPTPAY
  const change = (Number(amount) || 0) - target.amountDue

  // QR ผูกยอดเงินไว้ด้วย ลูกค้าจึงไม่ต้องกรอกยอดเอง
  const qrPayload = useMemo(
    () =>
      isPromptPay
        ? buildPromptPayPayload(PROMPTPAY_ID, Number(amount) || 0)
        : '',
    [isPromptPay, amount],
  )

  return (
    <Modal title={dialogTitle[method]} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(method, note.trim())
        }}
      >
        <p className="mb-3 text-sm text-gray-500">
          โต๊ะ {target.tableName} · ยอดที่ต้องจ่าย{' '}
          <span className="font-bold text-black">
            {formatBaht(target.amountDue)}
          </span>
        </p>

        {/* ถ้าลูกค้าเลือกวิธีจ่ายมาแล้วก็ใช้ตามนั้น ไม่ต้องมีปุ่มให้กดเพิ่ม */}
        {!target.chosenByCustomer && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            {payMethods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`rounded-lg border-2 py-2.5 text-sm font-bold transition ${
                  method === m
                    ? `border-current ${methodColor[m]} bg-brand-50`
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {methodLabel[m]}
              </button>
            ))}
          </div>
        )}

        {isPromptPay && (
          <div className="mb-4 flex flex-col items-center rounded-xl border-2 border-promptpay/30 bg-promptpay/5 p-4">
            <p className="mb-2 text-sm font-bold text-promptpay">
              ให้ลูกค้าสแกนเพื่อจ่าย
            </p>
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG value={qrPayload} size={180} />
            </div>
            <p className="mt-2 text-lg font-bold text-black">
              {formatBaht(Number(amount) || 0)}
            </p>

            {IS_DEMO_PROMPTPAY && (
              <p className="mt-2 text-center text-xs text-danger">
                โหมดเดโม — ยังไม่ได้ตั้ง VITE_PROMPTPAY_ID
                สแกนแล้วจะไม่พบบัญชีปลายทาง
              </p>
            )}

            <p className="mt-2 text-center text-xs text-gray-500">
              ระบบยังตรวจสอบเงินเข้าอัตโนมัติไม่ได้ — ให้ตรวจสลิปก่อนกดบันทึก
            </p>
          </div>
        )}

        <label className="block">
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
              className="h-4 w-4 text-brand-400"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M9.5 9.5A2.5 2.5 0 0 1 12 8c1.4 0 2.5.9 2.5 2s-1.1 1.8-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5"
                strokeLinecap="round"
              />
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

        {/* รับเงินมามากกว่ายอด = ต้องทอน — ช่วยคิดให้เฉย ๆ ยอดที่บันทึกยังเป็นยอดจริงของบิล */}
        {!isPromptPay && change > 0 && (
          <p className="mt-1 text-right text-sm font-semibold text-brand-400">
            เงินทอน {formatBaht(change)}
          </p>
        )}

        <label className="mt-4 block">
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
              className="h-4 w-4 text-brand-400"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h10M7 13h6" strokeLinecap="round" />
            </svg>
            รายละเอียด
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="พิมพ์ลงบนใบเสร็จ (ยังไม่ได้เก็บในระบบ)"
            className="mt-1 w-full resize-none rounded border border-gray-300 bg-gray-100 px-3 py-2 outline-none focus:border-brand-300 focus:bg-white"
          />
        </label>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-danger py-2.5 font-bold text-white transition hover:brightness-95"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded bg-plus py-2.5 font-bold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

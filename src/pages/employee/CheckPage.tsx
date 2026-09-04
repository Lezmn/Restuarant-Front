import { useOrders } from '@/features/orders/hooks'
import { ErrorNote } from '@/components/ui/ErrorNote'
import {
  useResolveServiceRequest,
  useServiceRequests,
} from '@/features/service-requests/hooks'
import { formatBaht } from '@/lib/format'
import { mockSessions, orderTotal } from '@/lib/mock/db'
import {
  PaymentMethod,
  ServiceRequestStatus,
  ServiceRequestType,
  TableSessionStatus,
} from '@/types/enums'

const POLL_MS = 10_000

const methodLabel: Record<string, string> = {
  [PaymentMethod.CASH]: 'เงินสด',
  [PaymentMethod.CARD]: 'บัตร',
  [PaymentMethod.PROMPTPAY]: 'PromptPay',
}

export function CheckPage() {
  const { data: orders, isPending } = useOrders({ refetchInterval: POLL_MS })
  const { data: requests } = useServiceRequests({ refetchInterval: POLL_MS })
  const resolve = useResolveServiceRequest()

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
      <ErrorNote error={resolve.error} />

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
              <tr key={session.id}>
                <td className="px-4 py-3 font-bold text-black">
                  {session.tableName}
                </td>
                <td className="px-4 py-3 font-bold text-black">
                  {formatBaht(total)}
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {checkout?.paymentMethod
                    ? methodLabel[checkout.paymentMethod]
                    : 'รอดำเนินการ'}
                </td>
                <td className="px-4 py-3">
                  {checkout ? (
                    <button
                      type="button"
                      disabled={resolve.isPending}
                      onClick={() => resolve.mutate(checkout.id)}
                      className="inline-flex items-center gap-1.5 font-semibold text-brand-300 disabled:opacity-60"
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
    </div>
  )
}

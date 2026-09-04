import { useCallStaff, useSession, useSessionOrders } from '@/features/public/hooks'
import { formatBaht } from '@/lib/format'
import { itemTotal, orderTotal } from '@/features/orders/order-total'
import { OrderStatus } from '@/types/enums'
import type { Order } from '@/types/models'
import { Link, useParams } from 'react-router-dom'

const steps = [
  { status: OrderStatus.PENDING, label: 'รับออเดอร์แล้ว', icon: '✓' },
  { status: OrderStatus.PREPARING, label: 'กำลังปรุงอาหาร', icon: '🍳' },
  { status: OrderStatus.SERVED, label: 'เสิร์ฟแล้ว', icon: '🍽' },
]

const stepIndex = (order: Order) => {
  if (order.status === OrderStatus.SERVED || order.status === OrderStatus.PAID)
    return 2
  if (order.status === OrderStatus.PREPARING) return 1
  return 0
}

export function CustomerStatusPage() {
  const { token } = useParams()
  const { data: session } = useSession(token)
  const { data: orders, isPending } = useSessionOrders(token)
  const callStaff = useCallStaff()

  if (isPending) return <p className="text-sm text-gray-500">กำลังโหลด...</p>

  const latest = orders?.[0]

  return (
    <div className="lg:mx-auto lg:max-w-2xl">
      <h1 className="text-lg font-bold text-gray-900">ติดตามสถานะออเดอร์</h1>
      <p className="text-sm text-gray-500">
        {session ? `โต๊ะ ${session.tableName} : ` : ''}
        ทั้งหมด {orders?.length ?? 0} รายการ
      </p>

      {!latest ? (
        <div className="mt-6 rounded-2xl border-2 border-brand-75 bg-white px-4 py-10 text-center">
          <p className="text-sm text-gray-500">ไม่มีออเดอร์</p>
          <Link
            to={`/t/${token}`}
            className="mt-4 inline-block rounded-full bg-brand-300 px-6 py-2.5 text-sm font-bold text-white"
          >
            เลือกเมนู
          </Link>
        </div>
      ) : (
        <>
          {/* stepper */}
          <div className="mt-4 rounded-2xl border-2 border-brand-75 bg-white p-4">
            <ol className="flex items-start">
              {steps.map((step, index) => {
                const current = stepIndex(latest)
                const done = index <= current
                return (
                  <li key={step.status} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      <span
                        className={`h-0.5 flex-1 ${
                          index === 0
                            ? 'bg-transparent'
                            : index <= current
                              ? 'bg-brand-300'
                              : 'bg-gray-200'
                        }`}
                      />
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                          done
                            ? 'bg-brand-300 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step.icon}
                      </span>
                      <span
                        className={`h-0.5 flex-1 ${
                          index === steps.length - 1
                            ? 'bg-transparent'
                            : index < current
                              ? 'bg-brand-300'
                              : 'bg-gray-200'
                        }`}
                      />
                    </div>
                    <span
                      className={`mt-2 text-center text-xs ${
                        done ? 'font-semibold text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>

            {latest.status !== OrderStatus.SERVED && (
              <div className="mt-5 flex items-center justify-center gap-3 border-t border-brand-75 pt-4">
                <span aria-hidden className="text-2xl">
                  ⏱
                </span>
                <div className="text-center">
                  <p className="text-sm text-gray-600">คาดว่าจะได้รับในอีก</p>
                  <p className="text-xl font-bold text-brand-400">
                    10 - 15 นาที
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={callStaff.isPending || callStaff.isSuccess}
            onClick={() => callStaff.mutate({ token: token as string })}
            className="mt-4 w-full rounded-xl border-2 border-brand-400 py-3 text-sm font-bold text-brand-400 transition disabled:opacity-60"
          >
            📞 เรียกพนักงานเพื่อสอบถาม
          </button>

          {callStaff.isSuccess && (
            <p className="mt-4 rounded-xl bg-success/10 py-3 text-center text-sm font-semibold text-success">
              กรุณารอพนักงานสักครู่
            </p>
          )}

          {/* รายการทั้งหมด */}
          <h2 className="mt-6 text-sm font-semibold text-gray-700">
            รายการทั้งหมด
          </h2>
          <div className="mt-2 space-y-3">
            {orders?.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border-2 border-brand-75 bg-white p-4"
              >
                <p className="text-sm font-semibold text-gray-900">
                  ออเดอร์ #{order.orderRef}
                </p>
                <ul className="mt-2 space-y-1">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 text-gray-700">
                        {item.quantity}× {item.menuItemName}
                        {item.optionNames.length > 0 && (
                          <span className="text-gray-400">
                            {' '}
                            ({item.optionNames.join(', ')})
                          </span>
                        )}
                        {item.note && (
                          <span className="block text-xs text-brand-400">
                            {item.note}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-gray-500">
                        {formatBaht(itemTotal(item))}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 border-t border-brand-75 pt-2 text-right text-sm font-bold text-price">
                  {formatBaht(orderTotal(order))}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

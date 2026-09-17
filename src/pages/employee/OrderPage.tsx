import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks'
import { ErrorNote } from '@/components/ui/ErrorNote'
import { LIVE_POLL_MS } from '@/lib/live'
import { OrderStatus } from '@/types/enums'
import type { Id, Order } from '@/types/models'
import { useState } from 'react'

// ยังไม่มี WebSocket ฝั่ง backend — ใช้ polling ไปก่อน
const POLL_MS = LIVE_POLL_MS

const waitedMinutes = (iso: string) =>
  Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000))

type ColumnKey = 'queue' | 'cooking' | 'done'

const columns: {
  key: ColumnKey
  title: string
  status: OrderStatus
  dot: string
  border: string
  badge: string
  button: string
  buttonLabel: string
}[] = [
  {
    key: 'queue',
    title: 'รอคิว',
    status: OrderStatus.PENDING,
    dot: 'bg-status-queue',
    border: 'border-status-queue',
    badge: 'bg-status-queue/15 text-status-queue',
    button: 'bg-status-queue',
    buttonLabel: 'เริ่มปรุง',
  },
  {
    key: 'cooking',
    title: 'กำลังปรุง',
    status: OrderStatus.PREPARING,
    dot: 'bg-brand-300',
    border: 'border-brand-300',
    badge: 'bg-brand-50 text-brand-400',
    button: 'bg-status-cooking',
    buttonLabel: 'ทำเสร็จแล้ว',
  },
  {
    key: 'done',
    title: 'เมนูที่ทำเสร็จ',
    status: OrderStatus.SERVED,
    dot: 'bg-status-done',
    border: 'border-status-done',
    badge: 'bg-status-done/15 text-status-done',
    button: 'bg-status-done',
    buttonLabel: 'ทำเสร็จเรียบร้อย',
  },
]

export function OrderPage() {
  const { data: orders, isPending } = useOrders({ refetchInterval: POLL_MS })
  const updateStatus = useUpdateOrderStatus()

  // backend ยังไม่มีสถานะ "เคลียร์ออกจากบอร์ด" — เก็บไว้ในหน้าจอก่อน
  const [cleared, setCleared] = useState<Id[]>([])
  // ติ๊กรายอาหารว่าทำแล้ว — เป็นตัวช่วยของครัว ไม่ได้ส่งขึ้น backend
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const visible = (orders ?? []).filter((o) => !cleared.includes(o.id))

  const handleAdvance = (order: Order, key: ColumnKey) => {
    if (key === 'queue') {
      updateStatus.mutate({ id: order.id, status: OrderStatus.PREPARING })
    } else if (key === 'cooking') {
      updateStatus.mutate({ id: order.id, status: OrderStatus.SERVED })
    } else {
      setCleared((prev) => [...prev, order.id])
    }
  }

  return (
    <div className="relative">
      <ErrorNote error={updateStatus.error} />

      {isPending && <p className="text-sm text-gray-500">กำลังโหลด...</p>}

      <div className="grid gap-4 md:grid-cols-3 md:divide-x md:divide-gray-200">
        {columns.map((column) => {
          const list = visible.filter((o) => o.status === column.status)

          return (
            <section key={column.key} className="md:px-3">
              <header className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-3.5 w-3.5 rounded-full ${column.dot}`} />
                  <h2 className="text-lg font-bold text-black sm:text-xl">
                    {column.title}
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${column.badge}`}
                >
                  {list.length} รายการ
                </span>
              </header>

              <div className="space-y-4">
                {list.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">
                    ไม่มีรายการ
                  </p>
                )}

                {list.map((order) => (
                  <article
                    key={order.id}
                    className={`rounded-xl border-2 bg-white p-3 ${column.border}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-bold text-black">
                        โต๊ะ {order.tableName}
                      </p>
                      <p className="text-sm text-gray-600">
                        รอมาแล้ว {waitedMinutes(order.createdAt)} นาที
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      ออเดอร์ #{order.orderRef}
                    </p>

                    <ul className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className={`rounded-lg border border-gray-200 px-3 py-2 ${
                            column.key === 'done' ? 'text-gray-400' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">
                              <span className="font-bold">{item.quantity}</span>{' '}
                              {item.menuItemName}
                              {item.optionNames.length > 0 && (
                                <span className="text-gray-500">
                                  {' '}
                                  ({item.optionNames.join(', ')})
                                </span>
                              )}
                            </span>

                            {column.key === 'cooking' && (
                              <input
                                type="checkbox"
                                aria-label={`ทำ ${item.menuItemName} แล้ว`}
                                checked={Boolean(checked[item.id])}
                                onChange={(e) =>
                                  setChecked((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.checked,
                                  }))
                                }
                                className="h-5 w-5 shrink-0 accent-brand-300"
                              />
                            )}
                          </div>

                          {item.note && column.key !== 'done' && (
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-status-queue">
                              <span className="h-1.5 w-1.5 rounded-full bg-status-queue" />
                              {item.note}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => handleAdvance(order, column.key)}
                      className={`mt-3 w-full rounded-lg py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${column.button}`}
                    >
                      {column.buttonLabel}
                    </button>

                    <button
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `ยกเลิกออเดอร์ #${order.orderRef} โต๊ะ ${order.tableName} ?`,
                          )
                        ) {
                          updateStatus.mutate({
                            id: order.id,
                            status: OrderStatus.CANCELLED,
                          })
                        }
                      }}
                      className="mt-2 w-full rounded-lg border border-gray-300 py-2 text-xs font-semibold text-gray-600 transition hover:border-danger hover:text-danger disabled:opacity-60"
                    >
                      ยกเลิกออเดอร์
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>

    </div>
  )
}

import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks'
import { formatTime } from '@/lib/format'
import { OrderStatus } from '@/types/enums'
import { statusLabel, statusTone } from '@/features/orders/order-status'

// ยังไม่มี WebSocket ฝั่ง backend — ใช้ polling ไปก่อน
const KITCHEN_POLL_MS = 5_000

export function KitchenPage() {
  const { data: orders, isPending } = useOrders({
    refetchInterval: KITCHEN_POLL_MS,
  })
  const updateStatus = useUpdateOrderStatus()

  const queue = orders?.filter(
    (o) =>
      o.status === OrderStatus.PENDING || o.status === OrderStatus.PREPARING,
  )

  return (
    <div>
      <PageHeader
        title="ครัว"
        description={`คิวที่ต้องทำ · รีเฟรชอัตโนมัติทุก ${KITCHEN_POLL_MS / 1000} วินาที`}
      />

      {isPending && <p className="text-sm text-gray-500">กำลังโหลด...</p>}
      {queue?.length === 0 && (
        <p className="text-sm text-gray-500">ไม่มีคิวค้าง</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {queue?.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900">
                โต๊ะ {order.tableName}
              </p>
              <Badge tone={statusTone[order.status]}>
                {statusLabel[order.status]}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              #{order.id} · {formatTime(order.createdAt)}
            </p>

            <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {order.items.map((item) => (
                <li key={item.id} className="text-sm">
                  <span className="font-medium text-gray-900">
                    {item.quantity}× {item.menuItemName}
                  </span>
                  {item.optionNames.length > 0 && (
                    <span className="text-gray-500">
                      {' '}
                      ({item.optionNames.join(', ')})
                    </span>
                  )}
                  {item.note && (
                    <p className="text-amber-600">หมายเหตุ: {item.note}</p>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              {order.status === OrderStatus.PENDING && (
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({
                      id: order.id,
                      status: OrderStatus.PREPARING,
                    })
                  }
                  className="flex-1 rounded-lg bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  เริ่มทำ
                </button>
              )}
              {order.status === OrderStatus.PREPARING && (
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({
                      id: order.id,
                      status: OrderStatus.SERVED,
                    })
                  }
                  className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  เสิร์ฟแล้ว
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

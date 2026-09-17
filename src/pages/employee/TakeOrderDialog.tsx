import { ErrorNote } from '@/components/ui/ErrorNote'
import { Modal } from '@/components/ui/Modal'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { useMenuItems } from '@/features/menu/hooks'
import { useCreateOrder } from '@/features/orders/hooks'
import { formatBaht } from '@/lib/format'
import type { Id, TableSession } from '@/types/models'
import { useMemo, useState } from 'react'

/**
 * พนักงานรับออเดอร์แทนลูกค้า — สำหรับลูกค้าที่ไม่ได้สแกน QR
 * (หน้านี้ยังสั่งได้แค่เมนูเปล่า ๆ ยังไม่ให้เลือกตัวเลือกเมนู)
 */
export function TakeOrderDialog({
  session,
  onClose,
}: {
  session: TableSession
  onClose: () => void
}) {
  const { data: items, isPending } = useMenuItems()
  const createOrder = useCreateOrder()

  const [qty, setQty] = useState<Record<Id, number>>({})
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')

  const available = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return (items ?? [])
      .filter((i) => i.isAvailable)
      .filter((i) => !keyword || i.name.toLowerCase().includes(keyword))
  }, [items, search])

  const lines = Object.entries(qty)
    .filter(([, n]) => n > 0)
    .map(([menuItemId, quantity]) => ({ menuItemId, quantity, note }))

  const total = lines.reduce((sum, line) => {
    const item = items?.find((i) => i.id === line.menuItemId)
    return sum + (item?.price ?? 0) * line.quantity
  }, 0)

  const count = lines.reduce((n, l) => n + l.quantity, 0)

  return (
    <Modal title={`รับออเดอร์ — โต๊ะ ${session.tableName}`} onClose={onClose}>
      <ErrorNote error={createOrder.error} />

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ค้นหาเมนู"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-300"
      />

      {isPending && <p className="mt-3 text-sm text-gray-500">กำลังโหลด...</p>}

      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
        {available.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {item.name}
              </p>
              <p className="text-sm text-amount">{formatBaht(item.price)}</p>
            </div>

            <QuantityStepper
              size="sm"
              min={0}
              value={qty[item.id] ?? 0}
              onChange={(next) =>
                setQty((prev) => ({ ...prev, [item.id]: Math.max(0, next) }))
              }
            />
          </li>
        ))}

        {!isPending && available.length === 0 && (
          <li className="py-6 text-center text-sm text-gray-400">
            ไม่พบเมนูที่ค้นหา
          </li>
        )}
      </ul>

      <label className="mt-3 block text-sm">
        <span className="font-semibold text-gray-700">หมายเหตุ</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น ไม่เผ็ด (ใส่ให้ทุกรายการในออเดอร์นี้)"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-300"
        />
      </label>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">
          {count} รายการ
        </span>
        <span className="text-lg font-bold text-amount">
          {formatBaht(total)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border-2 border-gray-300 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          disabled={createOrder.isPending || count === 0}
          onClick={() =>
            createOrder.mutate(
              { tableId: session.tableId, lines },
              { onSuccess: onClose },
            )
          }
          className="rounded-lg bg-brand-300 py-2.5 text-sm font-bold text-white transition hover:bg-brand-400 disabled:bg-gray-300"
        >
          {createOrder.isPending ? 'กำลังส่ง...' : 'ส่งเข้าครัว'}
        </button>
      </div>
    </Modal>
  )
}

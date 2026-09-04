import { PageHeader } from '@/components/ui/PageHeader'
import { useTables } from '@/features/tables/hooks'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { TableStatus } from '@/types/enums'

const statusTone: Record<string, BadgeTone> = {
  [TableStatus.AVAILABLE]: 'green',
  [TableStatus.OCCUPIED]: 'amber',
  [TableStatus.RESERVED]: 'blue',
}

const statusLabel: Record<string, string> = {
  [TableStatus.AVAILABLE]: 'ว่าง',
  [TableStatus.OCCUPIED]: 'มีลูกค้า',
  [TableStatus.RESERVED]: 'จองแล้ว',
}

export function TablesPage() {
  const { data: tables, isPending } = useTables()

  return (
    <div>
      <PageHeader title="โต๊ะ" description="สถานะโต๊ะทั้งหมดในร้าน" />

      {isPending && <p className="text-sm text-gray-500">กำลังโหลด...</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tables?.map((table) => (
          <div
            key={table.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900">{table.name}</p>
              <Badge tone={statusTone[table.status]}>
                {statusLabel[table.status]}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-gray-500">{table.seats} ที่นั่ง</p>
          </div>
        ))}
      </div>
    </div>
  )
}

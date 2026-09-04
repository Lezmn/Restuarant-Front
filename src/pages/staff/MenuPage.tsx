import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCategories, useMenuItems } from '@/features/menu/hooks'
import { formatBaht } from '@/lib/format'

export function MenuPage() {
  const { data: categories } = useCategories()
  const { data: items, isPending } = useMenuItems()

  return (
    <div>
      <PageHeader title="จัดการเมนู" description="เมนูและหมวดหมู่ทั้งหมด" />

      {isPending && <p className="text-sm text-gray-500">กำลังโหลด...</p>}

      <div className="space-y-6">
        {categories?.map((category) => (
          <section key={category.id}>
            <h2 className="mb-2 text-sm font-semibold text-gray-500">
              {category.name}
            </h2>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
              {items
                ?.filter((item) => item.categoryId === category.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}
                      {item.optionGroups.length > 0 && (
                        <p className="mt-1 text-xs text-gray-400">
                          ตัวเลือก:{' '}
                          {item.optionGroups
                            .map(
                              (g) =>
                                `${g.name} (${g.options.map((o) => o.name).join('/')})`,
                            )
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {!item.isAvailable && <Badge tone="red">หมด</Badge>}
                      <span className="text-sm font-medium text-gray-900">
                        {formatBaht(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

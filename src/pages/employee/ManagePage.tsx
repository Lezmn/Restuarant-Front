import { FoodImage } from '@/components/ui/FoodImage'
import { ErrorNote } from '@/components/ui/ErrorNote'
import { useMenuItems, useSetMenuItemAvailability } from '@/features/menu/hooks'
import { formatBaht } from '@/lib/format'
import { useMemo, useState } from 'react'

type Tab = 'menu' | 'ingredient'

export function ManagePage() {
  const { data: items, isPending } = useMenuItems()
  const setAvailability = useSetMenuItemAvailability()
  const [tab, setTab] = useState<Tab>('menu')
  const [search, setSearch] = useState('')

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return items ?? []
    return (items ?? []).filter((i) => i.name.toLowerCase().includes(keyword))
  }, [items, search])

  return (
    <div>
      <ErrorNote error={setAvailability.error} />

      {/* แถบเครื่องมือ: toggle เมนู/วัตถุดิบ + ค้นหา */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <div className="flex gap-2">
          <TabButton active={tab === 'menu'} onClick={() => setTab('menu')}>
            เมนู
          </TabButton>
          <TabButton
            active={tab === 'ingredient'}
            onClick={() => setTab('ingredient')}
          >
            วัตถุดิบ
          </TabButton>
        </div>

        <label className="relative block flex-1 sm:max-w-md">
          <span className="sr-only">ค้นหา</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-black"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา"
            className="w-full rounded-2xl bg-gray-300/40 py-3 pr-4 pl-12 font-bold text-black outline-none placeholder:text-black/70 focus:bg-gray-300/60"
          />
        </label>
      </div>

      {tab === 'ingredient' ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
          ยังทำไม่ได้ — backend ยังไม่มี model วัตถุดิบ
          <br />
          ต้องเพิ่ม Ingredient model ใน prisma schema ก่อน
        </div>
      ) : (
        <>
          {isPending && (
            <p className="mt-6 text-sm text-gray-500">กำลังโหลด...</p>
          )}

          {!isPending && visible.length === 0 && (
            <p className="mt-10 text-center text-sm text-gray-500">
              ไม่พบเมนูที่ค้นหา
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {visible.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <FoodImage src={item.imageUrl} alt={item.name} />
                </div>

                <div className="p-3">
                  <div className="flex items-baseline justify-between gap-2 border-b border-gray-200 pb-2">
                    <p className="truncate text-sm font-semibold text-black">
                      {item.name}
                    </p>
                    <p className="shrink-0 text-sm font-semibold text-black">
                      {formatBaht(item.price)}
                    </p>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-700">สถานะ</p>
                      <p
                        className={`text-sm ${
                          item.isAvailable ? 'text-black' : 'text-gray-400'
                        }`}
                      >
                        {item.isAvailable ? 'พร้อมจำหน่าย' : 'หมดชั่วคราว'}
                      </p>
                    </div>

                    <Switch
                      checked={item.isAvailable}
                      label={`สถานะของ ${item.name}`}
                      disabled={setAvailability.isPending}
                      onChange={(next) =>
                        setAvailability.mutate({
                          id: item.id,
                          isAvailable: next,
                        })
                      }
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 px-5 py-2 text-sm font-bold transition ${
        active
          ? 'border-brand-400 bg-brand-400 text-white'
          : 'border-brand-400 bg-white text-brand-400 hover:bg-brand-50'
      }`}
    >
      {children}
    </button>
  )
}

function Switch({
  checked,
  label,
  disabled,
  onChange,
}: {
  checked: boolean
  label: string
  disabled: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${
        checked ? 'bg-brand-400' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

import { ErrorNote } from '@/components/ui/ErrorNote'
import {
  useCreateMenuOption,
  useDeleteMenuOption,
  useMenuItem,
  useUpdateMenuOption,
} from '@/features/menu/hooks'
import type { MenuOptionInput } from '@/features/menu/api'
import { useIngredients } from '@/features/ingredients/hooks'
import { formatBaht } from '@/lib/format'
import { MenuOptionGroupKind } from '@/types/enums'
import type { Id, MenuOption } from '@/types/models'
import { useState } from 'react'

const GROUP_LABEL: Record<MenuOptionGroupKind, string> = {
  [MenuOptionGroupKind.PROTEIN]: 'เนื้อสัตว์ (เลือกได้ 1)',
  [MenuOptionGroupKind.EXTRA]: 'เพิ่มเติม (เลือกได้หลายอย่าง)',
}

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-300'

/**
 * จัดการตัวเลือกของเมนู (หมู/ไก่/ไข่ดาว) — เพิ่ม, แก้, เปิด-ปิดให้เลือก, ลบ
 * ทุกปุ่มยิง API ทันที ไม่รอปุ่ม "บันทึก" ของฟอร์มเมนู เพราะตัวเลือกเป็น resource แยกใน backend
 * อ่านข้อมูลสดจาก useMenuItem ไม่ใช่ prop เพราะหลังเพิ่ม/แก้ต้องเห็นผลทันทีโดยไม่ปิด dialog
 */
export function MenuOptionsEditor({ menuItemId }: { menuItemId: Id }) {
  const { data: item } = useMenuItem(menuItemId)
  const createOption = useCreateMenuOption()
  const updateOption = useUpdateMenuOption()
  const deleteOption = useDeleteMenuOption()

  const options = item?.optionGroups.flatMap((g) => g.options) ?? []
  const busy =
    createOption.isPending || updateOption.isPending || deleteOption.isPending
  const error = createOption.error ?? updateOption.error ?? deleteOption.error

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <h3 className="text-sm font-bold text-gray-800">ตัวเลือกของเมนู</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        ปิดสวิตช์ = ลูกค้าจะไม่เห็นตัวเลือกนั้น (ใช้ตอนของหมดชั่วคราว) ·
        ผูกวัตถุดิบไว้ = ของหมดทีเดียวหายทุกเมนู
      </p>

      <div className="mt-2">
        <ErrorNote error={error} />
      </div>

      {(Object.keys(GROUP_LABEL) as MenuOptionGroupKind[]).map((group) => {
        const rows = options.filter((o) => o.group === group)
        if (rows.length === 0) return null
        return (
          <div key={group} className="mt-3">
            <p className="text-xs font-semibold text-gray-600">{GROUP_LABEL[group]}</p>
            <ul className="mt-1 space-y-1.5">
              {rows.map((option) => (
                <OptionRow
                  key={option.id}
                  option={option}
                  disabled={busy}
                  onToggle={(isAvailable) =>
                    updateOption.mutate({
                      menuItemId,
                      optionId: option.id,
                      input: { isAvailable },
                    })
                  }
                  onSave={(input) =>
                    updateOption.mutate({ menuItemId, optionId: option.id, input })
                  }
                  onDelete={() => {
                    if (confirm(`ลบตัวเลือก "${option.name}" ?`)) {
                      deleteOption.mutate({ menuItemId, optionId: option.id })
                    }
                  }}
                />
              ))}
            </ul>
          </div>
        )
      })}

      {options.length === 0 && (
        <p className="mt-3 text-xs text-gray-400">ยังไม่มีตัวเลือก</p>
      )}

      <NewOptionRow
        disabled={busy}
        onAdd={(input) => createOption.mutate({ menuItemId, input })}
      />
    </section>
  )
}

/**
 * โหมด "เพิ่มเมนูใหม่" — ยังไม่มี id เมนูให้ยิง API จึงพักตัวเลือกไว้ใน state ของฟอร์มก่อน
 * ManagePage จะสร้างตัวเลือกพวกนี้ต่อท้ายทันทีหลังบันทึกเมนูสำเร็จ
 */
export function PendingOptionsEditor({
  options,
  onChange,
}: {
  options: MenuOptionInput[]
  onChange: (next: MenuOptionInput[]) => void
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <h3 className="text-sm font-bold text-gray-800">ตัวเลือกของเมนู</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        ใส่ไว้ก่อนได้เลย จะถูกบันทึกพร้อมเมนูตอนกด "บันทึก"
      </p>

      {(Object.keys(GROUP_LABEL) as MenuOptionGroupKind[]).map((group) => {
        const rows = options
          .map((o, index) => ({ o, index }))
          .filter(({ o }) => o.group === group)
        if (rows.length === 0) return null
        return (
          <div key={group} className="mt-3">
            <p className="text-xs font-semibold text-gray-600">{GROUP_LABEL[group]}</p>
            <ul className="mt-1 space-y-1.5">
              {rows.map(({ o, index }) => (
                <li
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-900">
                    {o.name}
                    {o.price > 0 && (
                      <span className="ml-1 text-xs text-gray-500">+{formatBaht(o.price)}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange(options.filter((_, i) => i !== index))}
                    className="text-xs font-semibold text-danger hover:underline"
                  >
                    ลบ
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {options.length === 0 && (
        <p className="mt-3 text-xs text-gray-400">ยังไม่มีตัวเลือก</p>
      )}

      <NewOptionRow disabled={false} onAdd={(input) => onChange([...options, input])} />
    </section>
  )
}

function OptionRow({
  option,
  disabled,
  onToggle,
  onSave,
  onDelete,
}: {
  option: MenuOption
  disabled: boolean
  onToggle: (isAvailable: boolean) => void
  onSave: (input: {
    name: string
    price: number
    group: MenuOptionGroupKind
    ingredientId: Id | null
  }) => void
  onDelete: () => void
}) {
  const { data: ingredients } = useIngredients()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(option.name)
  const [price, setPrice] = useState(String(option.price))
  const [group, setGroup] = useState<MenuOptionGroupKind>(option.group)
  const [ingredientId, setIngredientId] = useState(option.ingredientId ?? '')

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-white p-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} min-w-0 flex-1`}
          placeholder="ชื่อตัวเลือก"
        />
        <input
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`${inputClass} w-20`}
          placeholder="+บาท"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as MenuOptionGroupKind)}
          className={inputClass}
        >
          <option value={MenuOptionGroupKind.PROTEIN}>เนื้อสัตว์</option>
          <option value={MenuOptionGroupKind.EXTRA}>เพิ่มเติม</option>
        </select>
        <select
          value={ingredientId}
          onChange={(e) => setIngredientId(e.target.value)}
          title="ผูกกับวัตถุดิบ — ของหมดแล้วตัวเลือกนี้หายทุกเมนู"
          className={inputClass}
        >
          <option value="">ไม่ผูกวัตถุดิบ</option>
          {ingredients?.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name}
              {ing.isAvailable ? '' : ' (หมด)'}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={disabled || !name.trim()}
          onClick={() => {
            onSave({
              name: name.trim(),
              price: Number(price) || 0,
              group,
              ingredientId: ingredientId || null,
            })
            setEditing(false)
          }}
          className="rounded-lg bg-brand-300 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-400 disabled:opacity-50"
        >
          บันทึก
        </button>
        <button
          type="button"
          onClick={() => {
            setName(option.name)
            setPrice(String(option.price))
            setGroup(option.group)
            setIngredientId(option.ingredientId ?? '')
            setEditing(false)
          }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
        >
          ยกเลิก
        </button>
      </li>
    )
  }

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 ${
        option.isAvailable ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'
      }`}
    >
      <span className="min-w-0 flex-1 truncate text-sm text-gray-900">
        {option.name}
        {option.ingredientName && (
          <span
            className={`ml-1 text-xs ${
              option.ingredientOutOfStock ? 'font-semibold text-danger' : 'text-gray-400'
            }`}
          >
            [{option.ingredientName}
            {option.ingredientOutOfStock ? ' — หมด' : ''}]
          </span>
        )}
        {option.price > 0 && (
          <span className="ml-1 text-xs text-gray-500">+{formatBaht(option.price)}</span>
        )}
        {!option.isAvailable && (
          <span className="ml-2 text-xs font-semibold text-gray-500">ปิดอยู่</span>
        )}
      </span>

      {/* สวิตช์เปิด/ปิดให้ลูกค้าเลือก */}
      <button
        type="button"
        role="switch"
        aria-checked={option.isAvailable}
        aria-label={option.isAvailable ? 'ปิดตัวเลือกนี้' : 'เปิดตัวเลือกนี้'}
        disabled={disabled}
        onClick={() => onToggle(!option.isAvailable)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
          option.isAvailable ? 'bg-brand-300' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            option.isAvailable ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setEditing(true)}
        className="text-xs font-semibold text-brand-400 hover:underline disabled:opacity-50"
      >
        แก้
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className="text-xs font-semibold text-danger hover:underline disabled:opacity-50"
      >
        ลบ
      </button>
    </li>
  )
}

function NewOptionRow({
  disabled,
  onAdd,
}: {
  disabled: boolean
  onAdd: (input: {
    name: string
    price: number
    group: MenuOptionGroupKind
    isAvailable: boolean
  }) => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [group, setGroup] = useState<MenuOptionGroupKind>(MenuOptionGroupKind.EXTRA)

  const submit = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), price: Number(price) || 0, group, isAvailable: true })
    setName('')
    setPrice('')
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          // Enter ในช่องนี้ต้องเพิ่มตัวเลือก ไม่ใช่ submit ฟอร์มเมนูทั้งใบ
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        className={`${inputClass} min-w-0 flex-1`}
        placeholder="เพิ่มตัวเลือก เช่น ไข่ดาว"
      />
      <input
        type="number"
        min="0"
        step="1"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        className={`${inputClass} w-20`}
        placeholder="+บาท"
      />
      <select
        value={group}
        onChange={(e) => setGroup(e.target.value as MenuOptionGroupKind)}
        className={inputClass}
      >
        <option value={MenuOptionGroupKind.PROTEIN}>เนื้อสัตว์</option>
        <option value={MenuOptionGroupKind.EXTRA}>เพิ่มเติม</option>
      </select>
      <button
        type="button"
        disabled={disabled || !name.trim()}
        onClick={submit}
        className="rounded-lg border-2 border-brand-300 px-3 py-1.5 text-xs font-bold text-brand-400 hover:bg-brand-50 disabled:opacity-50"
      >
        + เพิ่ม
      </button>
    </div>
  )
}

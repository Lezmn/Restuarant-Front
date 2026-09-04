/**
 * แปลงข้อมูลดิบจาก API ให้เป็น type ที่หน้าจอใช้
 * รวมความต่างทั้งหมดไว้ที่ไฟล์เดียว ถ้า backend เปลี่ยน field ก็แก้ที่นี่ที่เดียว
 */
import type {
  ApiMenuItem,
  ApiOrder,
  ApiPayment,
  ApiReceipt,
  ApiServiceRequest,
  ApiTable,
  ApiTableSession,
  ApiUser,
} from '@/types/api'
import type {
  MenuItem,
  Order,
  Payment,
  Receipt,
  RestaurantTable,
  ServiceRequest,
  TableSession,
  User,
} from '@/types/models'

/** โต๊ะฝั่ง API เป็นตัวเลข แต่หน้าจอแสดงเป็นข้อความเสมอ */
const tableName = (table?: { number: number }) =>
  table ? String(table.number) : '-'

/** backend ไม่มีเลขที่ออเดอร์ — ใช้ 6 ตัวแรกของ uuid ให้พนักงานอ้างอิงกันได้ */
const orderRef = (id: string) => id.slice(0, 6).toUpperCase()

export const mapUser = (u: ApiUser): User => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
})

export const mapTable = (t: ApiTable): RestaurantTable => ({
  id: t.id,
  name: String(t.number),
  seats: t.seats,
  status: t.status,
})

/**
 * MenuOption ฝั่ง backend เป็น array แบน ยังไม่มีการจัดกลุ่ม
 * จึงยุบให้เป็นกลุ่มเดียวชื่อ "เพิ่มเติม" เลือกได้หลายอัน
 * (ดีไซน์ต้องการ radio ของ "เนื้อสัตว์" ด้วย ต้องรอ MenuOptionGroup ฝั่ง backend)
 */
export const mapMenuItem = (m: ApiMenuItem): MenuItem => ({
  id: m.id,
  categoryId: m.categoryId,
  name: m.name,
  description: m.description,
  price: m.price,
  imageUrl: m.imageUrl,
  isAvailable: m.isAvailable,
  optionGroups:
    m.options && m.options.length > 0
      ? [
          {
            id: `${m.id}-options`,
            name: 'เพิ่มเติม',
            selectType: 'multiple',
            required: false,
            options: m.options.map((o) => ({
              id: o.id,
              name: o.name,
              price: o.price,
              isAvailable: o.isAvailable,
            })),
          },
        ]
      : [],
})

export const mapOrder = (o: ApiOrder): Order => ({
  id: o.id,
  orderRef: orderRef(o.id),
  tableSessionId: o.tableSessionId ?? '',
  tableName: tableName(o.table),
  status: o.status,
  createdAt: o.createdAt,
  items: o.items.map((item) => ({
    id: item.id,
    menuItemId: item.menuItemId ?? '',
    // ทรง /public ส่ง name/options มาแบน ๆ ส่วนทรง /orders ซ้อนอยู่ใน menuItem/selectedOptions
    menuItemName: item.menuItem?.name ?? item.name ?? 'ไม่ทราบชื่อเมนู',
    imageUrl: item.menuItem?.imageUrl ?? null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    note: item.note,
    optionNames: (item.selectedOptions ?? item.options ?? []).map((o) => o.name),
    optionsTotal: (item.selectedOptions ?? item.options ?? []).reduce(
      (sum, o) => sum + o.price,
      0,
    ),
  })),
})

export const mapSession = (s: ApiTableSession): TableSession => ({
  id: s.id,
  tableId: s.tableId,
  tableName: tableName(s.table),
  token: s.token,
  status: s.status,
  openedAt: s.openedAt,
  closedAt: s.closedAt,
  total: s.total ?? 0,
})

export const mapServiceRequest = (r: ApiServiceRequest): ServiceRequest => ({
  id: r.id,
  tableSessionId: r.tableSessionId ?? '',
  tableName: tableName(r.table),
  type: r.type,
  status: r.status,
  paymentMethod: r.paymentMethod,
  // backend ยังไม่มีฟิลด์หมายเหตุใน ServiceRequest
  note: null,
  createdAt: r.createdAt,
})

export const mapReceipt = (
  r: ApiReceipt,
  tableNameText: string,
): Receipt => ({
  id: r.id,
  number: r.number,
  subtotal: r.subtotal,
  discount: r.discount,
  total: r.total,
  issuedAt: r.issuedAt,
  tableName: tableNameText,
  items: (r.items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    optionTotal: item.optionTotal,
    lineTotal: item.lineTotal,
    note: item.note,
  })),
})

/** fallbackTableName ใช้ตอน backend ไม่ได้ส่ง tableSession มาด้วย (เช่นตอน POST /payments) */
export const mapPayment = (p: ApiPayment, fallbackTableName?: string): Payment => ({
  id: p.id,
  tableSessionId: p.tableSessionId,
  method: p.method,
  amount: p.amount,
  paidAt: p.paidAt,
  receipt: p.receipt
    ? mapReceipt(
        p.receipt,
        p.tableSession?.table ? tableName(p.tableSession.table) : (fallbackTableName ?? '-'),
      )
    : null,
})

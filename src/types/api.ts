/**
 * รูปร่างข้อมูลดิบที่ API ส่งกลับมาจริง ๆ (ตรวจจาก response ของ NestJS)
 * ต่างจาก type ในโดเมนของ frontend หลายจุด เช่น
 *   - โต๊ะใช้ `number` (ตัวเลข) ไม่ใช่ `name`
 *   - ตัวเลือกเมนูเป็น array แบน ไม่มีการจัดกลุ่ม
 *   - ออเดอร์ไม่มีเลขที่ (order number)
 * จึงมีชั้นแปลงอยู่ที่ lib/map.ts เพื่อไม่ให้ความต่างพวกนี้รั่วเข้าไปในหน้าจอ
 */
import type {
  OrderStatus,
  PaymentMethod,
  Role,
  ServiceRequestStatus,
  ServiceRequestType,
  TableSessionStatus,
  TableStatus,
} from './enums'

export interface ApiUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface ApiLoginResponse {
  accessToken: string
  user: ApiUser
}

export interface ApiTable {
  id: string
  number: number
  seats: number
  status: TableStatus
}

export interface ApiMenuOption {
  id: string
  name: string
  price: number
  isAvailable: boolean
}

export interface ApiMenuItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isAvailable: boolean
  categoryId: string
  category?: { id: string; name: string }
  options?: ApiMenuOption[]
}

export interface ApiCategory {
  id: string
  name: string
  sortOrder?: number
  menuItems?: ApiMenuItem[]
}

/**
 * order item มาได้ 2 ทรง
 * - /orders (พนักงาน)  : menuItemId + menuItem{} + selectedOptions[]
 * - /public/... (ลูกค้า): name + options[] แบนมาแล้ว ไม่มี menuItemId/รูป
 */
export interface ApiOrderItem {
  id: string
  quantity: number
  unitPrice: number
  note: string | null
  menuItemId?: string
  menuItem?: { id: string; name: string; imageUrl?: string | null }
  selectedOptions?: { id: string; name: string; price: number }[]
  name?: string
  options?: { id: string; name: string; price: number }[]
}

export interface ApiOrder {
  id: string
  status: OrderStatus
  createdAt: string
  tableId?: string
  tableSessionId?: string | null
  table?: ApiTable
  items: ApiOrderItem[]
  /** เฉพาะทรง /public — backend รวมยอดของออเดอร์มาให้แล้ว */
  total?: number
}

export interface ApiTableSession {
  id: string
  token: string
  status: TableSessionStatus
  openedAt: string
  closedAt: string | null
  expiresAt: string | null
  tableId: string
  table?: ApiTable
  orders?: ApiOrder[]
  /** backend คำนวณยอดรวมของ session มาให้แล้ว ไม่ต้องบวกเองฝั่ง frontend */
  total?: number
  billingStatus?: string
  checkoutRequest?: ApiServiceRequest | null
}

export interface ApiServiceRequest {
  id: string
  type: ServiceRequestType
  status: ServiceRequestStatus
  createdAt: string
  resolvedAt: string | null
  paymentMethod: PaymentMethod | null
  tableId: string
  tableSessionId: string | null
  table?: ApiTable
}

export interface ApiReceiptItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  optionTotal: number
  lineTotal: number
  note: string | null
}

export interface ApiReceipt {
  id: string
  number: string
  subtotal: number
  discount: number
  total: number
  issuedAt: string
  tableId: string
  items?: ApiReceiptItem[]
}

export interface ApiPayment {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: string
  tableSessionId: string
  receipt?: ApiReceipt | null
  tableSession?: ApiTableSession
}

import type {
  OrderStatus,
  PaymentMethod,
  Role,
  ServiceRequestStatus,
  ServiceRequestType,
  TableSessionStatus,
  TableStatus,
} from './enums'

// id ทุกตัวเป็น uuid string ตาม prisma schema (@default(uuid()))
export type Id = string

export interface User {
  id: Id
  username: string
  name: string
  role: Role
}

export interface Category {
  id: Id
  name: string
  sortOrder: number
}

export interface MenuOption {
  id: Id
  name: string
  price: number
  isAvailable: boolean
}

// ดีไซน์แยกตัวเลือกเป็น 2 แบบ: "เนื้อสัตว์" เลือกได้อันเดียว (radio)
// กับ "เพิ่มเติม" เลือกได้หลายอัน (checkbox)
// แต่ MenuOption ใน backend เป็น flat list ยังไม่มีฟิลด์กลุ่ม/ชนิดการเลือก
// จึงจัดกลุ่มไว้ฝั่ง frontend ก่อน — ต้องเพิ่มใน schema ตอนต่อ API จริง
export interface MenuOptionGroup {
  id: Id
  name: string
  selectType: 'single' | 'multiple'
  required: boolean
  options: MenuOption[]
}

export interface MenuItem {
  id: Id
  categoryId: Id
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isAvailable: boolean
  optionGroups: MenuOptionGroup[]
}

export interface RestaurantTable {
  id: Id
  name: string
  seats: number
  status: TableStatus
}

export interface TableSession {
  id: Id
  tableId: Id
  tableName: string
  token: string
  status: TableSessionStatus
  openedAt: string
  closedAt: string | null
}

export interface OrderItem {
  id: Id
  menuItemId: Id
  menuItemName: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  note: string | null
  optionNames: string[]
}

export interface Order {
  id: Id
  orderNumber: number
  tableSessionId: Id
  tableName: string
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
}

export interface Payment {
  id: Id
  tableSessionId: Id
  method: PaymentMethod
  amount: number
  paidAt: string
}

export interface ServiceRequest {
  id: Id
  tableSessionId: Id
  tableName: string
  type: ServiceRequestType
  status: ServiceRequestStatus
  paymentMethod: PaymentMethod | null
  note: string | null
  createdAt: string
}

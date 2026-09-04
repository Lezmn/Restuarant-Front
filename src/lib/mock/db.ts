// ข้อมูลจำลองไว้ให้ frontend รันได้เองโดยยังไม่ต้องมี backend
// เก็บใน memory เฉย ๆ — รีเฟรชหน้าแล้วค่าจะกลับไปเป็นค่าเริ่มต้น
// ตอนต่อ API จริงให้ลบโฟลเดอร์นี้ทิ้งได้เลย
import {
  OrderStatus,
  PaymentMethod,
  Role,
  ServiceRequestStatus,
  ServiceRequestType,
  TableSessionStatus,
  TableStatus,
} from '@/types/enums'
import type {
  Category,
  MenuItem,
  Order,
  Payment,
  RestaurantTable,
  ServiceRequest,
  TableSession,
  User,
} from '@/types/models'

export const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString()

export const RESTAURANT_NAME = 'ร้านอาหารตามใจ ไม่ตามสั่ง'

export const mockUsers: (User & { password: string })[] = [
  { id: 'u-0', username: 'owner', password: '1234', name: 'เจ้าของร้าน', role: Role.ADMIN },
  { id: 'u-1', username: 'admin', password: '1234', name: 'ผู้จัดการร้าน', role: Role.ADMIN },
  { id: 'u-2', username: 'cashier', password: '1234', name: 'พนักงานแคชเชียร์', role: Role.CASHIER },
  { id: 'u-3', username: 'kitchen', password: '1234', name: 'ครัว', role: Role.KITCHEN },
  { id: 'u-4', username: 'waiter', password: '1234', name: 'พนักงานเสิร์ฟ', role: Role.WAITER },
]

export const mockCategories: Category[] = [
  { id: 'c-1', name: 'อาหารจานเดียว', sortOrder: 1 },
  { id: 'c-2', name: 'เมนูเส้น', sortOrder: 2 },
  { id: 'c-3', name: 'เครื่องดื่ม', sortOrder: 3 },
]

const meatGroup = (id: string) => ({
  id,
  name: 'เนื้อสัตว์',
  selectType: 'single' as const,
  required: true,
  options: [
    { id: `${id}-1`, name: 'หมู', price: 0, isAvailable: true },
    { id: `${id}-2`, name: 'ไก่', price: 0, isAvailable: true },
    { id: `${id}-3`, name: 'หมูกรอบ', price: 0, isAvailable: true },
    { id: `${id}-4`, name: 'กุ้ง', price: 0, isAvailable: true },
    { id: `${id}-5`, name: 'หมึก', price: 0, isAvailable: true },
    { id: `${id}-6`, name: 'ทะเล', price: 0, isAvailable: true },
  ],
})

const extraGroup = (id: string) => ({
  id,
  name: 'เพิ่มเติม',
  selectType: 'multiple' as const,
  required: false,
  options: [
    { id: `${id}-1`, name: 'ไข่ดาว', price: 10, isAvailable: true },
    { id: `${id}-2`, name: 'ไข่เจียว', price: 10, isAvailable: true },
    { id: `${id}-3`, name: 'พิเศษ', price: 10, isAvailable: true },
  ],
})

export const mockMenuItems: MenuItem[] = [
  {
    id: 'm-1',
    categoryId: 'c-1',
    name: 'ข้าวผัดกะเพรา',
    description: 'ผัดกะเพราหอม ๆ ราดข้าวสวยร้อน',
    price: 50,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [meatGroup('g-1a'), extraGroup('g-1b')],
  },
  {
    id: 'm-2',
    categoryId: 'c-1',
    name: 'ข้าวไข่เจียว',
    description: 'ไข่เจียวฟู กรอบนอกนุ่มใน',
    price: 40,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [extraGroup('g-2b')],
  },
  {
    id: 'm-3',
    categoryId: 'c-1',
    name: 'ข้าวผัด',
    description: 'ข้าวผัดสูตรร้าน',
    price: 50,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [meatGroup('g-3a'), extraGroup('g-3b')],
  },
  {
    id: 'm-4',
    categoryId: 'c-2',
    name: 'ผัดซีอิ๊ว',
    description: 'เส้นใหญ่ผัดซีอิ๊วไฟแรง',
    price: 50,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [meatGroup('g-4a')],
  },
  {
    id: 'm-5',
    categoryId: 'c-2',
    name: 'ผัดไทย',
    description: 'หมดชั่วคราว',
    price: 60,
    imageUrl: null,
    isAvailable: false,
    optionGroups: [],
  },
  {
    id: 'm-6',
    categoryId: 'c-3',
    name: 'น้ำเปล่า',
    description: null,
    price: 10,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [],
  },
  {
    id: 'm-7',
    categoryId: 'c-3',
    name: 'ชาเย็น',
    description: null,
    price: 45,
    imageUrl: null,
    isAvailable: true,
    optionGroups: [],
  },
]

export const mockTables: RestaurantTable[] = [
  { id: 't-1', name: '1', seats: 2, status: TableStatus.OCCUPIED },
  { id: 't-2', name: '2', seats: 4, status: TableStatus.OCCUPIED },
  { id: 't-3', name: '3', seats: 4, status: TableStatus.AVAILABLE },
  { id: 't-12', name: '12', seats: 6, status: TableStatus.OCCUPIED },
  { id: 't-13', name: '13', seats: 6, status: TableStatus.RESERVED },
]

export const mockSessions: TableSession[] = [
  {
    id: 's-1',
    tableId: 't-12',
    tableName: '12',
    token: 'demo-token-a1',
    status: TableSessionStatus.OPEN,
    openedAt: minutesAgo(45),
    closedAt: null,
  },
  {
    id: 's-2',
    tableId: 't-2',
    tableName: '2',
    token: 'demo-token-a2',
    status: TableSessionStatus.OPEN,
    openedAt: minutesAgo(12),
    closedAt: null,
  },
]

export const mockOrders: Order[] = [
  {
    id: 'o-1',
    orderNumber: 1,
    tableSessionId: 's-1',
    tableName: '12',
    status: OrderStatus.PREPARING,
    createdAt: minutesAgo(8),
    items: [
      {
        id: 'oi-1',
        menuItemId: 'm-1',
        menuItemName: 'ข้าวผัดกะเพราหมู',
        imageUrl: null,
        quantity: 1,
        unitPrice: 50,
        note: 'ไม่เผ็ด',
        optionNames: ['หมู'],
      },
      {
        id: 'oi-2',
        menuItemId: 'm-6',
        menuItemName: 'น้ำเปล่า',
        imageUrl: null,
        quantity: 1,
        unitPrice: 10,
        note: null,
        optionNames: [],
      },
    ],
  },
  {
    id: 'o-2',
    orderNumber: 2,
    tableSessionId: 's-2',
    tableName: '2',
    status: OrderStatus.PENDING,
    createdAt: minutesAgo(5),
    items: [
      {
        id: 'oi-3',
        menuItemId: 'm-2',
        menuItemName: 'ข้าวไข่เจียว',
        imageUrl: null,
        quantity: 2,
        unitPrice: 40,
        note: null,
        optionNames: ['ไข่ดาว'],
      },
    ],
  },
]

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'sr-1',
    tableSessionId: 's-2',
    tableName: '2',
    type: ServiceRequestType.CALL_STAFF,
    status: ServiceRequestStatus.PENDING,
    paymentMethod: null,
    note: 'ขอน้ำแข็งเพิ่ม',
    createdAt: minutesAgo(3),
  },
  {
    id: 'sr-2',
    tableSessionId: 's-1',
    tableName: '12',
    type: ServiceRequestType.CHECKOUT,
    status: ServiceRequestStatus.PENDING,
    paymentMethod: PaymentMethod.PROMPTPAY,
    note: null,
    createdAt: minutesAgo(1),
  },
]

export const mockPayments: Payment[] = []

export const orderTotal = (order: Order) =>
  order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

let orderCounter = mockOrders.length

export const nextOrderNumber = () => ++orderCounter

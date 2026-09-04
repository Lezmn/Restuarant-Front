// ให้ตรงกับ enum ใน prisma/schema.prisma ของฝั่ง backend
// ใช้ const object แทน TS enum เพราะ tsconfig เปิด erasableSyntaxOnly ไว้

export const Role = {
  ADMIN: 'ADMIN',
  CASHIER: 'CASHIER',
  KITCHEN: 'KITCHEN',
  WAITER: 'WAITER',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const OrderStatus = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  SERVED: 'SERVED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const TableStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
} as const
export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus]

export const TableSessionStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED',
} as const
export type TableSessionStatus =
  (typeof TableSessionStatus)[keyof typeof TableSessionStatus]

export const PaymentMethod = {
  CASH: 'CASH',
  CARD: 'CARD',
  PROMPTPAY: 'PROMPTPAY',
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const ServiceRequestType = {
  CALL_STAFF: 'CALL_STAFF',
  CHECKOUT: 'CHECKOUT',
  OTHER: 'OTHER',
} as const
export type ServiceRequestType =
  (typeof ServiceRequestType)[keyof typeof ServiceRequestType]

export const ServiceRequestStatus = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
} as const
export type ServiceRequestStatus =
  (typeof ServiceRequestStatus)[keyof typeof ServiceRequestStatus]

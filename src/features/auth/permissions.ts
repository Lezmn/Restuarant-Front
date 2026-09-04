import { Role } from '@/types/enums'

/**
 * สิทธิ์เข้าหน้าต่าง ๆ — ตั้งให้ตรงกับ @Roles(...) ของ controller ฝั่ง NestJS
 * เพื่อไม่ให้ UI พาผู้ใช้ไปเจอ 403
 *
 * order   → PATCH /orders/:id/status   @Roles(ADMIN, KITCHEN)
 * check   → /service-requests, /table-sessions, /payments
 *                                      @Roles(ADMIN, WAITER, CASHIER)
 * manage  → POST/PATCH/DELETE /menu    @Roles(ADMIN)
 * users   → ทั้ง controller            @Roles(ADMIN)
 *
 * หมายเหตุ: นี่เป็นการกัน UI เท่านั้น ไม่ใช่ security จริง
 * ตัวจริงคือ JwtAuthGuard + RolesGuard ที่ backend
 */
export const pageRoles = {
  order: [Role.ADMIN, Role.KITCHEN],
  check: [Role.ADMIN, Role.WAITER, Role.CASHIER],
  manage: [Role.ADMIN],
  orders: [Role.ADMIN, Role.WAITER],
  tables: [Role.ADMIN, Role.WAITER, Role.CASHIER],
  requests: [Role.ADMIN, Role.WAITER, Role.CASHIER],
  users: [Role.ADMIN],
  /** ฝั่งเจ้าของร้าน — backend ไม่มี role OWNER แยก ใช้ ADMIN แทน */
  owner: [Role.ADMIN],
} satisfies Record<string, Role[]>

/** หน้าแรกหลัง login ของแต่ละ role — ต้องเป็นหน้าที่ role นั้นเข้าได้จริง ไม่งั้น redirect วนลูป */
export const homeByRole: Record<Role, string> = {
  [Role.ADMIN]: '/employee/order',
  [Role.KITCHEN]: '/employee/order',
  [Role.CASHIER]: '/employee/check',
  [Role.WAITER]: '/employee/check',
}

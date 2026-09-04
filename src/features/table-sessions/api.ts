import { delay, mockSessions, mockTables } from '@/lib/mock/db'
import { TableSessionStatus, TableStatus } from '@/types/enums'
import type { Id, TableSession } from '@/types/models'

/**
 * ของจริง:
 *   GET   /table-sessions            @Roles(ADMIN, WAITER, CASHIER)
 *   POST  /table-sessions            @Roles(ADMIN, WAITER)
 *   PATCH /table-sessions/:id/close  @Roles(ADMIN, WAITER, CASHIER)
 */
export async function getSessions(): Promise<TableSession[]> {
  await delay()
  return mockSessions.map((s) => ({ ...s }))
}

/** สุ่ม token สำหรับ QR — ของจริง backend เป็นคนสร้างให้ */
const makeToken = () =>
  `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`

export async function openSession(tableId: Id): Promise<TableSession> {
  await delay(300)

  const table = mockTables.find((t) => t.id === tableId)
  if (!table) throw new Error('ไม่พบโต๊ะนี้')

  const alreadyOpen = mockSessions.some(
    (s) => s.tableId === tableId && s.status === TableSessionStatus.OPEN,
  )
  if (alreadyOpen) throw new Error('โต๊ะนี้เปิดอยู่แล้ว')

  const session: TableSession = {
    id: `s-${Date.now()}`,
    tableId: table.id,
    tableName: table.name,
    token: makeToken(),
    status: TableSessionStatus.OPEN,
    openedAt: new Date().toISOString(),
    closedAt: null,
  }

  mockSessions.push(session)
  table.status = TableStatus.OCCUPIED

  return session
}

export async function closeSession(sessionId: Id): Promise<void> {
  await delay(300)

  const session = mockSessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('ไม่พบ session นี้')

  session.status = TableSessionStatus.CLOSED
  session.closedAt = new Date().toISOString()

  const table = mockTables.find((t) => t.id === session.tableId)
  if (table) table.status = TableStatus.AVAILABLE
}

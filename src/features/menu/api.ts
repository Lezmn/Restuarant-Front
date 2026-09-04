import { delay, mockCategories, mockMenuItems } from '@/lib/mock/db'
import type { Category, Id, MenuItem } from '@/types/models'

export async function getCategories(): Promise<Category[]> {
  await delay()
  return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getMenuItems(): Promise<MenuItem[]> {
  await delay()
  return mockMenuItems
}

export async function getMenuItem(id: Id): Promise<MenuItem> {
  await delay(150)
  const item = mockMenuItems.find((m) => m.id === id)
  if (!item) throw new Error('ไม่พบเมนูนี้')
  return item
}

export async function setMenuItemAvailability(vars: {
  id: Id
  isAvailable: boolean
}): Promise<MenuItem> {
  await delay(150)
  const item = mockMenuItems.find((m) => m.id === vars.id)
  if (!item) throw new Error('ไม่พบเมนูนี้')
  item.isAvailable = vars.isAvailable
  return item
}

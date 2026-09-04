import { apiClient } from '@/lib/api-client'
import { mapMenuItem } from '@/lib/map'
import type { ApiCategory, ApiMenuItem } from '@/types/api'
import type { Category, Id, MenuItem } from '@/types/models'

export async function getCategories(): Promise<Category[]> {
  const data = await apiClient<ApiCategory[]>('/categories')
  return data.map((c, index) => ({
    id: c.id,
    name: c.name,
    sortOrder: c.sortOrder ?? index,
  }))
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const data = await apiClient<ApiMenuItem[]>('/menu')
  return data.map(mapMenuItem)
}

export async function getMenuItem(id: Id): Promise<MenuItem> {
  const data = await apiClient<ApiMenuItem>(`/menu/${id}`)
  return mapMenuItem(data)
}

export interface MenuItemInput {
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  categoryId: Id
  isAvailable: boolean
}

/** POST /menu @Roles(ADMIN) */
export async function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  const data = await apiClient<ApiMenuItem>('/menu', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return mapMenuItem(data)
}

/** PATCH /menu/:id @Roles(ADMIN) */
export async function updateMenuItem(vars: {
  id: Id
  input: Partial<MenuItemInput>
}): Promise<MenuItem> {
  const data = await apiClient<ApiMenuItem>(`/menu/${vars.id}`, {
    method: 'PATCH',
    body: JSON.stringify(vars.input),
  })
  return mapMenuItem(data)
}

/** DELETE /menu/:id @Roles(ADMIN) */
export async function deleteMenuItem(id: Id): Promise<void> {
  await apiClient<void>(`/menu/${id}`, { method: 'DELETE' })
}

/** เปิด/ปิดการขาย — ใช้ PATCH ตัวเดียวกับการแก้ไขเมนู */
export async function setMenuItemAvailability(vars: {
  id: Id
  isAvailable: boolean
}): Promise<MenuItem> {
  return updateMenuItem({
    id: vars.id,
    input: { isAvailable: vars.isAvailable },
  })
}

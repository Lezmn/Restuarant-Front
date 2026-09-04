import { delay, mockUsers } from '@/lib/mock/db'
import type { User } from '@/types/models'

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

// ตอนต่อ backend จริง เปลี่ยนเป็น:
// return apiClient<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  await delay()
  const found = mockUsers.find(
    (u) => u.username === payload.username && u.password === payload.password,
  )
  if (!found) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
  const { password: _password, ...user } = found
  return { accessToken: `mock.${user.username}`, user }
}

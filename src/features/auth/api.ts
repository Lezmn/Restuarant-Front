import { apiClient } from '@/lib/api-client'
import { mapUser } from '@/lib/map'
import type { ApiLoginResponse } from '@/types/api'
import type { User } from '@/types/models'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

/** POST /auth/login — เข้าสู่ระบบด้วยอีเมล (backend ไม่ได้ใช้ username) */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiClient<ApiLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return { accessToken: data.accessToken, user: mapUser(data.user) }
}

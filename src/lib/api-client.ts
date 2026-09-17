import { authStorage } from './auth-storage'

// fetch wrapper ตัวเดียวของทั้งแอป — features/*/api.ts ต้องเรียกผ่านตัวนี้เสมอ
// ตั้ง URL ของ API ผ่าน VITE_API_URL ใน .env
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = authStorage.getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (res.status === 401) {
    authStorage.clear()
    window.location.href = '/employee/login'
    throw new ApiError(401, 'ยังไม่ได้เข้าสู่ระบบ')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string | string[]
    } | null
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? `เกิดข้อผิดพลาด (${res.status})`)
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

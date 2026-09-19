import type { APIRequestContext, Page } from '@playwright/test'

const API_URL = 'http://localhost:3000'
const LOGIN_EMAIL_DOMAIN = 'restaurant.local'

/** กรอกฟอร์ม login แล้วกดส่ง — ใช้ร่วมกันทุกเคสที่ต้อง submit จริง */
export async function submitLogin(page: Page, username: string, password: string) {
  await page.getByLabel('ผู้ใช้').fill(username)
  await page.getByLabel('รหัสผ่าน').fill(password)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
}

/**
 * login ตรงกับ backend จริง (ไม่ผ่าน UI) เอาไว้ setup "login อยู่แล้ว" แบบเร็ว ๆ
 * ต้องใช้ token จริงเท่านั้น เพราะ apiClient (src/lib/api-client.ts) จะเช็ค 401
 * กับทุก request — ถ้าใช้ token ปลอม หน้าที่ยิง API จริงจะโดนเด้งกลับไป login ทันที
 */
export async function loginViaApi(
  request: APIRequestContext,
  username: string,
  password: string,
) {
  const email = username.includes('@') ? username : `${username}@${LOGIN_EMAIL_DOMAIN}`
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  })
  if (!res.ok()) {
    throw new Error(`login ผ่าน API ไม่สำเร็จ (${res.status()}) — เช็คว่า backend รันอยู่และ seed ข้อมูลแล้ว`)
  }
  return (await res.json()) as {
    accessToken: string
    user: { id: string; email: string; name: string; role: 'ADMIN' | 'STAFF' | 'KITCHEN' }
  }
}

/** ยัด auth state (token + user จริงจาก loginViaApi) ลง localStorage ตรง ๆ ตาม src/lib/auth-storage.ts */
export async function setAuthState(
  page: Page,
  accessToken: string,
  user: { id: string; email: string; name: string; role: 'ADMIN' | 'STAFF' | 'KITCHEN' },
) {
  await page.evaluate(
    ([token, u]) => {
      localStorage.setItem('restaurant.token', token as string)
      localStorage.setItem('restaurant.user', JSON.stringify(u))
    },
    [accessToken, user] as const,
  )
}

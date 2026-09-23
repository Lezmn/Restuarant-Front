import { test, expect } from '@playwright/test'
import { loginViaApi, setAuthState } from '../helpers'

// ⚠️ ต้องรัน backend จริง + seed data ที่ localhost:3000
// ต้องใช้ token จริงจาก login API เท่านั้น เพราะหน้า /employee ยิง API จริงทันทีที่เข้า
// (token ปลอมจะโดน apiClient เช็ค 401 แล้วเด้งกลับไป login เอง — ดูรายละเอียดใน helpers.ts)

test('login อยู่แล้ว (ADMIN) เข้าหน้า login พนักงานซ้ำ ต้องถูกเด้งออกไปเลย', async ({
  page,
  request,
}) => {
  const { accessToken, user } = await loginViaApi(request, 'admin', 'ChangeMe123!')

  await page.goto('/employee/login')
  await setAuthState(page, accessToken, user)
  await page.reload()

  await expect(page).toHaveURL(/\/employee\/order$/)
})

test('login อยู่แล้วด้วย role STAFF เข้าหน้า login เจ้าของร้าน ต้องไม่ถูกเด้ง (ไม่ใช่ ADMIN)', async ({
  page,
  request,
}) => {
  const { accessToken, user } = await loginViaApi(request, 'waiter', 'ChangeMe123!')

  await page.goto('/owner/login')
  await setAuthState(page, accessToken, user)
  await page.reload()

  // owner login จำกัดแค่ ADMIN (allowedRoles) — STAFF ต้องยังเห็นฟอร์ม login อยู่
  await expect(page).toHaveURL(/\/owner\/login$/)
  await expect(page.getByLabel('ผู้ใช้')).toBeVisible()
})

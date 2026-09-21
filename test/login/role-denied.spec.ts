import { test, expect } from '@playwright/test'
import { submitLogin } from '../helpers'

// ⚠️ ต้องรัน backend จริง + seed data ที่ localhost:3000
// เคสนี้: login ถูกต้องทุกอย่าง แต่ role ไม่มีสิทธิ์เข้าหน้านั้น (allowedRoles ไม่ตรง)

test('login ด้วยบัญชี waiter (STAFF) ที่หน้า owner login ต้องถูกปฏิเสธ', async ({
  page,
}) => {
  await page.goto('/owner/login')

  await submitLogin(page, 'waiter', 'ChangeMe123!')

  // owner login อนุญาตแค่ ADMIN — STAFF ต้องโดน signOut ทันทีและเห็นข้อความนี้
  await expect(page.getByText('บัญชีนี้ไม่มีสิทธิ์เข้าหน้านี้')).toBeVisible()
  await expect(page).toHaveURL(/\/owner\/login$/)

  // ต้องถูก signOut จริง ไม่ใช่แค่ไม่ redirect (เช็คว่า token ไม่ค้างใน localStorage)
  const token = await page.evaluate(() => localStorage.getItem('restaurant.token'))
  expect(token).toBeNull()
})

test('login ด้วยบัญชี kitchen (KITCHEN) ที่หน้า owner login ต้องถูกปฏิเสธเช่นกัน', async ({
  page,
}) => {
  await page.goto('/owner/login')

  await submitLogin(page, 'kitchen', 'ChangeMe123!')

  await expect(page.getByText('บัญชีนี้ไม่มีสิทธิ์เข้าหน้านี้')).toBeVisible()
  await expect(page).toHaveURL(/\/owner\/login$/)
})

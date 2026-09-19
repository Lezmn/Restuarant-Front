import { test, expect } from '@playwright/test'
import { submitLogin } from './helpers'

// ⚠️ ต้องรัน backend (NestJS) จริงที่ localhost:3000 เทสนี้ยิง POST /auth/login จริง
//
// 🐛 บั๊กที่รู้อยู่แล้ว (ยังไม่แก้ตามคำขอผู้ใช้): ทั้ง 2 เคสในไฟล์นี้ fail จริง
// สาเหตุ: src/lib/api-client.ts:31 เช็ค `res.status === 401` เหมารวมทุก endpoint
// ว่าคือ "session หมดอายุ" แล้ว force authStorage.clear() + window.location.href
// ไปหน้า login ทันที (reload ทั้งหน้า) — แต่ POST /auth/login เองก็ตอบ 401 เวลา
// รหัสผ่าน/username ผิดเช่นกัน (เป็น HTTP status ปกติของ auth ผิด ไม่ใช่ session หมดอายุ)
// เลยโดน intercept ก่อนจะถึง onError ของ useLogin ทำให้ role="alert" ใน LoginPage.tsx
// ไม่มีโอกาสได้ render เลย ผู้ใช้จริงกรอกรหัสผ่านผิดจะเห็นแค่หน้าจอ reload เฉย ๆ
// ไม่มีข้อความบอกเหตุผล — ตั้งใจปล่อยให้เทสนี้ fail ไว้เป็นตัวเตือนจนกว่าจะแก้ api-client.ts
// (เช่น ยกเว้น path '/auth/login' ออกจาก global 401 handler)

test('กรอกรหัสผ่านผิด ต้องขึ้น error และไม่หลุดไปหน้าอื่น', async ({ page }) => {
  await page.goto('/employee/login')

  await submitLogin(page, 'admin', 'wrong-password')

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page).toHaveURL(/\/employee\/login$/)
})

test('กรอก username ที่ไม่มีในระบบ ต้องขึ้น error', async ({ page }) => {
  await page.goto('/employee/login')

  await submitLogin(page, 'not-a-real-user', 'ChangeMe123!')

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page).toHaveURL(/\/employee\/login$/)
})

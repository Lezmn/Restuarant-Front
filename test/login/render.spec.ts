import { test, expect } from '@playwright/test'

// ไม่ต้องพึ่ง backend — เช็คแค่ว่า UI ของฟอร์ม login ขึ้นครบ

test('หน้า login พนักงานแสดงฟอร์มครบ', async ({ page }) => {
  await page.goto('/employee/login')

  await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible()
  await expect(page.getByText('สำหรับพนักงาน')).toBeVisible()
  await expect(page.getByLabel('ผู้ใช้')).toBeVisible()
  await expect(page.getByLabel('รหัสผ่าน')).toBeVisible()
  await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeEnabled()
})

test('หน้า login เจ้าของร้านแสดงฟอร์มครบ', async ({ page }) => {
  await page.goto('/owner/login')

  await expect(page.getByRole('heading', { name: 'ร้านอาหาร' })).toBeVisible()
  await expect(page.getByText('สำหรับเจ้าของร้าน')).toBeVisible()
  await expect(page.getByLabel('ผู้ใช้')).toBeVisible()
  await expect(page.getByLabel('รหัสผ่าน')).toBeVisible()
})

import { test, expect } from '@playwright/test'
import { loginAsCashier } from '../helpers'

// ⚠️ ต้องรัน backend จริง + seed data ที่ localhost:3000
// เทสนี้สมมติว่าตอนเริ่มยังไม่มีโต๊ะไหนเปิดอยู่เลย (โต๊ะว่างครบ 6 โต๊ะ)
// และเปิดโต๊ะจริงผ่าน UI จึงต้องปิดโต๊ะคืนท้ายเทส ไม่งั้นรันซ้ำจะนับโต๊ะว่างผิด

test('cashier เปิดโต๊ะที่ 1 แล้วจำนวนโต๊ะว่างและรายการโต๊ะที่เปิดต้องถูกต้อง', async ({
  page,
  request,
}) => {
  // 1. login role Cashier
  await loginAsCashier(page, request)
  await page.goto('/employee/check')
  await expect(page).toHaveURL(/\/employee\/check$/)

  // 2. ตอนยังไม่เปิดโต๊ะไหนเลย ต้องเห็นโต๊ะว่างครบ 6 และข้อความ "ยังไม่มีโต๊ะที่เปิดอยู่"
  await expect(page.getByText('จำนวนโต๊ะที่ว่าง 6 โต๊ะ')).toBeVisible()
  await expect(page.getByText('ยังไม่มีโต๊ะที่เปิดอยู่')).toBeVisible()

  // 3. กดปุ่ม โต๊ะ / QR
  await page.getByRole('link', { name: 'โต๊ะ / QR' }).click()
  await expect(page).toHaveURL(/\/employee\/tables$/)

  // 4. กดปุ่ม เปิดโต๊ะ + สร้าง QR ของโต๊ะที่ 1 (เปิดสำเร็จจะเด้ง QR modal ขึ้นมาเอง)
  const table1Card = page
    .locator('article')
    .filter({ has: page.getByText('โต๊ะ 1', { exact: true }) })
  await table1Card.getByRole('button', { name: 'เปิดโต๊ะ + สร้าง QR' }).click()
  await expect(page.getByRole('dialog', { name: 'QR โต๊ะ 1' })).toBeVisible()

  // 5. กดปุ่ม Check 2 ครั้ง — ครั้งแรกโดน overlay ของ QR modal บังอยู่ เลยแค่ปิด modal
  // ครั้งที่สอง modal ปิดแล้วถึงกดปุ่มนำทางไปหน้า Check ได้จริง
  const checkTab = page.getByRole('link', { name: 'Check' })
  await checkTab.click({ force: true })
  await checkTab.click()

  // 6. ตรวจสอบว่าจำนวนโต๊ะว่างลดลงถูกต้อง และโต๊ะที่เปิดไปแล้วคือโต๊ะที่ 1
  await expect(page).toHaveURL(/\/employee\/check$/)
  await expect(page.getByText('จำนวนโต๊ะที่ว่าง 5 โต๊ะ')).toBeVisible()

  // scope เฉพาะตารางโต๊ะที่เปิดอยู่ (ตัวแรก) ไม่เอาตาราง "บิลที่เก็บแล้ววันนี้" ด้านล่าง
  const rows = page.locator('table').first().locator('tbody tr')
  await expect(rows).toHaveCount(1)
  await expect(rows.first().getByRole('cell', { name: '1', exact: true })).toBeVisible()

  // เก็บกวาด: ปิดโต๊ะ 1 คืน ให้กลับไปว่างครบ 6 เหมือนเดิม ไม่งั้นรันเทสซ้ำครั้งต่อไปจะพังตั้งแต่ข้อ 2
  await page.goto('/employee/tables')
  await table1Card.getByRole('button', { name: 'ปิดโต๊ะ' }).click()
  await expect(
    table1Card.getByRole('button', { name: 'เปิดโต๊ะ + สร้าง QR' }),
  ).toBeVisible()
})

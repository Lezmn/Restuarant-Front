import { test, expect } from '@playwright/test'
import {
  advanceOrderToServed,
  loginAsAdmin,
  loginAsCashier,
  openTableAndPlaceOrder,
} from '../helpers'

// ⚠️ ต้องรัน backend จริง + seed data ที่ localhost:3000
// setup ด้วย admin: เปิดโต๊ะ + สั่งอาหาร + ไล่สถานะถึง "เสิร์ฟแล้ว" ก่อน (backend ไม่ให้เก็บเงิน
// ถ้าออเดอร์ยังไม่ถูกเสิร์ฟ ดู CheckPage.tsx: blocked = unpaid.length===0 || notServed.length>0)
// แล้วสลับตัวตนเป็น cashier (STAFF) มาเก็บเงินจริงตามหน้าที่ — ข้าวผัด(หมู) ราคารวม 50 บาท

const FRIED_RICE = /^ข้าวผัด(?!กะเพรา)/

test('cashier เก็บเงินสดสำเร็จ เห็นใบเสร็จถูกต้องและบิลไปโผล่ในรายการวันนี้', async ({
  page,
  request,
}) => {
  await loginAsAdmin(page, request)
  const { tableCardText, orderRef } = await openTableAndPlaceOrder(page, FRIED_RICE)
  await advanceOrderToServed(page, orderRef)

  await loginAsCashier(page, request)
  await page.goto('/employee/check')

  const tableName = tableCardText.replace(/^โต๊ะ\s*/, '')
  const row = page.getByRole('row').filter({ hasText: tableName })
  await row.getByRole('button', { name: 'เก็บเงิน' }).click()

  // ลูกค้าไม่ได้กดเช็คบิลมาเอง เลยตั้งต้นเป็น "เงินสด" ให้ และเติมยอดที่ต้องจ่ายมาให้อัตโนมัติ
  const dialog = page.getByRole('dialog', { name: 'ชำระเงินสด' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('ราคาที่จ่าย')).toHaveValue('50')

  await dialog.getByRole('button', { name: 'บันทึก' }).click()

  // PaymentDialog ปิดแล้วเด้ง ReceiptDialog ขึ้นมาทันที
  const receipt = page.getByRole('dialog', { name: 'ใบเสร็จรับเงิน' })
  await expect(receipt).toBeVisible()
  await expect(receipt.getByText('เงินสด')).toBeVisible()
  await expect(receipt.getByText('฿50').first()).toBeVisible()
  await receipt.getByRole('button', { name: 'ปิด' }).click()

  // โต๊ะนี้ต้องขึ้น "จ่ายครบแล้ว" แทนปุ่มเก็บเงิน และบิลไปโผล่ในตาราง "บิลที่เก็บแล้ววันนี้"
  await expect(row.getByText('จ่ายครบแล้ว')).toBeVisible()
  await expect(
    page.getByRole('row').filter({ hasText: tableName }).filter({ hasText: 'เงินสด' }),
  ).toBeVisible()
})

test('cashier เก็บเงินผ่าน PromptPay (สแกน) สำเร็จ เห็น QR และใบเสร็จถูกต้อง', async ({
  page,
  request,
}) => {
  await loginAsAdmin(page, request)
  const { tableCardText, orderRef } = await openTableAndPlaceOrder(page, FRIED_RICE)
  await advanceOrderToServed(page, orderRef)

  await loginAsCashier(page, request)
  await page.goto('/employee/check')

  const tableName = tableCardText.replace(/^โต๊ะ\s*/, '')
  const row = page.getByRole('row').filter({ hasText: tableName })
  await row.getByRole('button', { name: 'เก็บเงิน' }).click()

  // ใช้ locator แบบไม่ระบุชื่อ (ไม่เหมือนเทสเงินสด) เพราะ title ของ dialog เปลี่ยนจาก
  // "ชำระเงินสด" เป็น "ชำระผ่าน PromptPay" ทันทีที่กดเลือกวิธีจ่าย (dialogTitle[method] ใน CheckPage.tsx)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveAccessibleName('ชำระเงินสด')
  await dialog.getByRole('button', { name: 'PromptPay' }).click()
  await expect(dialog).toHaveAccessibleName('ชำระผ่าน PromptPay')

  // เลือก PromptPay แล้วต้องเห็น QR ให้ลูกค้าสแกนพร้อมยอดเงิน — โปรเจกต์นี้ยังไม่ได้ตั้ง
  // VITE_PROMPTPAY_ID ใน .env จริง (มีแค่ .env.example) เลยต้องขึ้นคำเตือนโหมดเดโมเสมอ
  await expect(dialog.getByText('ให้ลูกค้าสแกนเพื่อจ่าย')).toBeVisible()
  await expect(dialog.getByText('฿50').first()).toBeVisible()
  await expect(dialog.getByText('โหมดเดโม')).toBeVisible()

  await dialog.getByRole('button', { name: 'บันทึก' }).click()

  const receipt = page.getByRole('dialog', { name: 'ใบเสร็จรับเงิน' })
  await expect(receipt).toBeVisible()
  await expect(receipt.getByText('PromptPay')).toBeVisible()
  await receipt.getByRole('button', { name: 'ปิด' }).click()

  await expect(row.getByText('จ่ายครบแล้ว')).toBeVisible()
})

import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers'

// ⚠️ ต้องรัน backend จริง + seed data ที่ localhost:3000
// เทสในไฟล์นี้เป็น read-only ทั้งหมด (ไม่กด "+ เพิ่มเมนู" / "+ เพิ่มหมวดหมู่" จริง)
// เพื่อไม่ให้สร้างข้อมูลขยะค้างในฐานข้อมูล dev ทุกครั้งที่รันเทส

test('หน้าจัดการเมนูมีเครื่องมือครบ: เพิ่มเมนู, เพิ่มหมวดหมู่, ค้นหา, สลับแท็บ', async ({
  page,
  request,
}) => {
  await loginAsAdmin(page, request)
  await page.goto('/employee/manage')

  await expect(page.getByRole('button', { name: '+ เพิ่มเมนู' })).toBeVisible()
  await expect(page.getByRole('button', { name: '+ เพิ่มหมวดหมู่' })).toBeVisible()
  await expect(page.getByPlaceholder('ค้นหา')).toBeVisible()
  await expect(page.getByRole('button', { name: 'เมนู', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'วัตถุดิบ', exact: true })).toBeVisible()
})

test('เห็นหมวดหมู่จาก seed ครบ (อาหารจานเดียว, เมนูเส้น, เครื่องดื่ม)', async ({
  page,
  request,
}) => {
  await loginAsAdmin(page, request)
  await page.goto('/employee/manage')

  await expect(page.getByRole('button', { name: /^ทั้งหมด \(\d+\)$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /อาหารจานเดียว/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /เมนูเส้น/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /เครื่องดื่ม/ })).toBeVisible()
})

test('กดแท็บ "วัตถุดิบ" แสดงข้อความว่ายังทำไม่ได้ (backend ยังไม่มี model นี้)', async ({
  page,
  request,
}) => {
  await loginAsAdmin(page, request)
  await page.goto('/employee/manage')

  await page.getByRole('button', { name: 'วัตถุดิบ' }).click()

  await expect(page.getByText('ยังทำไม่ได้ — backend ยังไม่มี model วัตถุดิบ')).toBeVisible()
})

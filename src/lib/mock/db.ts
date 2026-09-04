// เหลือไว้เฉพาะตัวช่วยที่ mock ของ Dashboard/รายรับ-รายจ่ายยังใช้
// ส่วนอื่นย้ายไปเรียก API จริงหมดแล้ว
export const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

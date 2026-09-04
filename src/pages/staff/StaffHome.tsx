import { useAuth } from '@/features/auth/use-auth'
import { Role } from '@/types/enums'
import { Navigate } from 'react-router-dom'

// หน้าแรกหลัง login — ส่งไปหน้าที่ role นั้นเข้าได้จริง
// (ครัวเข้าหน้าโต๊ะไม่ได้ ถ้า redirect ไป /staff/tables ตรง ๆ จะวนลูป)
const homeByRole: Record<Role, string> = {
  [Role.ADMIN]: '/staff/tables',
  [Role.WAITER]: '/staff/tables',
  [Role.CASHIER]: '/staff/tables',
  [Role.KITCHEN]: '/staff/kitchen',
}

export function StaffHome() {
  const user = useAuth((s) => s.user)
  if (!user) return <Navigate to="/staff/login" replace />
  return <Navigate to={homeByRole[user.role]} replace />
}

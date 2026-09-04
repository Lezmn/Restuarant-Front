import { useAuth } from '@/features/auth/use-auth'
import type { Role } from '@/types/enums'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// กัน UI ไม่ให้เข้าหน้าที่ไม่มีสิทธิ์
// หมายเหตุ: นี่ไม่ใช่ security จริง — ตัวจริงคือ RolesGuard ฝั่ง NestJS
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const user = useAuth((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/staff" replace />
  }

  return <Outlet />
}

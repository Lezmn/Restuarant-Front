import { useAuth } from '@/features/auth/use-auth'
import { Role } from '@/types/enums'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  roles: Role[]
}

const navItems: NavItem[] = [
  { to: '/staff/tables', label: 'โต๊ะ', roles: [Role.ADMIN, Role.WAITER, Role.CASHIER] },
  { to: '/staff/orders', label: 'ออเดอร์', roles: [Role.ADMIN, Role.WAITER] },
  { to: '/staff/kitchen', label: 'ครัว', roles: [Role.ADMIN, Role.KITCHEN] },
  { to: '/staff/cashier', label: 'แคชเชียร์', roles: [Role.ADMIN, Role.CASHIER] },
  { to: '/staff/requests', label: 'คำขอจากโต๊ะ', roles: [Role.ADMIN, Role.WAITER, Role.CASHIER] },
  { to: '/staff/menu', label: 'จัดการเมนู', roles: [Role.ADMIN] },
  { to: '/staff/users', label: 'ผู้ใช้งาน', roles: [Role.ADMIN] },
]

export function StaffLayout() {
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)
  const navigate = useNavigate()

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <p className="font-semibold text-gray-900">Restaurant</p>
          <p className="text-xs text-gray-500">ระบบพนักงาน</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="mb-2 text-xs text-gray-500">{user?.role}</p>
          <button
            type="button"
            onClick={() => {
              signOut()
              navigate('/staff/login')
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

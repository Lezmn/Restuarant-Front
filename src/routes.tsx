import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { StaffLayout } from '@/components/layout/StaffLayout'
import { CustomerBillPage } from '@/pages/customer/BillPage'
import { CustomerCartPage } from '@/pages/customer/CartPage'
import { CustomerMenuItemPage } from '@/pages/customer/MenuItemPage'
import { CustomerMenuPage } from '@/pages/customer/MenuPage'
import { CustomerStatusPage } from '@/pages/customer/StatusPage'
import { CashierPage } from '@/pages/staff/CashierPage'
import { KitchenPage } from '@/pages/staff/KitchenPage'
import { LoginPage } from '@/pages/staff/LoginPage'
import { MenuPage } from '@/pages/staff/MenuPage'
import { OrdersPage } from '@/pages/staff/OrdersPage'
import { RequestsPage } from '@/pages/staff/RequestsPage'
import { StaffHome } from '@/pages/staff/StaffHome'
import { TablesPage } from '@/pages/staff/TablesPage'
import { UsersPage } from '@/pages/staff/UsersPage'
import { Role } from '@/types/enums'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/staff" replace /> },

  // ---------- ฝั่งลูกค้า: เข้าผ่าน QR ไม่ต้อง login ----------
  {
    path: '/t/:token',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerMenuPage /> },
      { path: 'menu/:menuItemId', element: <CustomerMenuItemPage /> },
      { path: 'cart', element: <CustomerCartPage /> },
      { path: 'bill', element: <CustomerBillPage /> },
      { path: 'status', element: <CustomerStatusPage /> },
    ],
  },

  // ---------- ฝั่งพนักงาน: ต้อง login ----------
  { path: '/staff/login', element: <LoginPage /> },
  {
    path: '/staff',
    element: <ProtectedRoute />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { index: true, element: <StaffHome /> },
          {
            element: (
              <ProtectedRoute roles={[Role.ADMIN, Role.WAITER, Role.CASHIER]} />
            ),
            children: [
              { path: 'tables', element: <TablesPage /> },
              { path: 'requests', element: <RequestsPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={[Role.ADMIN, Role.WAITER]} />,
            children: [{ path: 'orders', element: <OrdersPage /> }],
          },
          {
            element: <ProtectedRoute roles={[Role.ADMIN, Role.KITCHEN]} />,
            children: [{ path: 'kitchen', element: <KitchenPage /> }],
          },
          {
            element: <ProtectedRoute roles={[Role.ADMIN, Role.CASHIER]} />,
            children: [{ path: 'cashier', element: <CashierPage /> }],
          },
          {
            element: <ProtectedRoute roles={[Role.ADMIN]} />,
            children: [
              { path: 'menu', element: <MenuPage /> },
              { path: 'users', element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/staff" replace /> },
])

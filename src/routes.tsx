import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { EmployeeLayout } from '@/components/layout/EmployeeLayout'
import { OwnerLayout } from '@/components/layout/OwnerLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { pageRoles } from '@/features/auth/permissions'
import { Role } from '@/types/enums'
import { CustomerBillPage } from '@/pages/customer/BillPage'
import { CustomerCartPage } from '@/pages/customer/CartPage'
import { CustomerMenuItemPage } from '@/pages/customer/MenuItemPage'
import { CustomerMenuPage } from '@/pages/customer/MenuPage'
import { CustomerStatusPage } from '@/pages/customer/StatusPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { DashboardPage } from '@/pages/owner/DashboardPage'
import { FinancePage } from '@/pages/owner/FinancePage'
import { CheckPage } from '@/pages/employee/CheckPage'
import { EmployeeHome } from '@/pages/employee/EmployeeHome'

import { ManagePage } from '@/pages/employee/ManagePage'
import { OrderPage } from '@/pages/employee/OrderPage'
import { OrdersPage } from '@/pages/employee/OrdersPage'
import { RequestsPage } from '@/pages/employee/RequestsPage'
import { TablesPage } from '@/pages/employee/TablesPage'
import { UsersPage } from '@/pages/employee/UsersPage'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/employee" replace /> },

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

  // ---------- ฝั่งพนักงาน: ต้อง login + เช็ค role ----------
  {
    path: '/employee/login',
    element: (
      <LoginPage
        title="เข้าสู่ระบบ"
        subtitle="สำหรับพนักงาน"
        redirectTo="/employee"
        hint="admin / cashier / kitchen / waiter"
      />
    ),
  },
  {
    path: '/employee',
    // ชั้นที่ 1: ต้องมี token ไม่งั้นเด้งไปหน้า login
    element: <ProtectedRoute />,
    children: [
      {
        element: <EmployeeLayout />,
        children: [
          { index: true, element: <EmployeeHome /> },

          // ชั้นที่ 2: เช็ค role ทีละหน้า ตรงกับ @Roles(...) ฝั่ง NestJS
          {
            element: <ProtectedRoute roles={pageRoles.order} />,
            children: [{ path: 'order', element: <OrderPage /> }],
          },
          {
            element: <ProtectedRoute roles={pageRoles.check} />,
            children: [{ path: 'check', element: <CheckPage /> }],
          },
          {
            element: <ProtectedRoute roles={pageRoles.manage} />,
            children: [{ path: 'manage', element: <ManagePage /> }],
          },

          // หน้าที่ไม่มีในดีไซน์ แต่เขียนไว้แล้วและ backend รองรับ
          // เข้าถึงได้ทาง URL ตรง แต่ไม่ได้อยู่ในแถบล่าง
          {
            element: <ProtectedRoute roles={pageRoles.orders} />,
            children: [{ path: 'orders', element: <OrdersPage /> }],
          },
          {
            element: <ProtectedRoute roles={pageRoles.tables} />,
            children: [{ path: 'tables', element: <TablesPage /> }],
          },
          {
            element: <ProtectedRoute roles={pageRoles.requests} />,
            children: [{ path: 'requests', element: <RequestsPage /> }],
          },
          {
            element: <ProtectedRoute roles={pageRoles.users} />,
            children: [{ path: 'users', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },

  // ---------- ฝั่งเจ้าของร้าน: ADMIN เท่านั้น ----------
  // ดีไซน์แยกหน้า login ของเจ้าของร้านออกจากพนักงาน (Desktop-16)
  {
    path: '/owner/login',
    element: (
      <LoginPage
        title="ร้านอาหาร"
        subtitle="สำหรับเจ้าของร้าน"
        redirectTo="/owner/dashboard"
        allowedRoles={[Role.ADMIN]}
        hint="owner / admin"
      />
    ),
  },
  {
    path: '/owner',
    element: (
      <ProtectedRoute
        roles={pageRoles.owner}
        loginPath="/owner/login"
        fallbackPath="/owner/login"
      />
    ),
    children: [
      {
        element: <OwnerLayout />,
        children: [
          { index: true, element: <Navigate to="/owner/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'finance', element: <FinancePage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])

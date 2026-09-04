import { useLogin } from '@/features/auth/hooks'
import { useAuth } from '@/features/auth/use-auth'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const user = useAuth((s) => s.user)
  const navigate = useNavigate()
  const login = useLogin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/staff" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          login.mutate({ username, password }, {
            onSuccess: () => navigate('/staff'),
          })
        }}
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-gray-900">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-sm text-gray-500">สำหรับพนักงาน</p>

        <label className="mt-6 block text-sm font-medium text-gray-700">
          ชื่อผู้ใช้
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          รหัสผ่าน
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>

        {login.isError && (
          <p className="mt-3 text-sm text-red-600">{login.error.message}</p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="mt-6 w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {login.isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          ยังไม่ได้ต่อ backend — ใช้บัญชีจำลอง รหัสผ่าน <b>1234</b> ทุกบัญชี
          <br />
          admin / cashier / kitchen / waiter
        </p>
      </form>
    </div>
  )
}

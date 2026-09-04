import { useSession } from '@/features/public/hooks'
import { cartCount, useCart } from '@/features/public/cart-store'
import { RESTAURANT_NAME } from '@/lib/mock/db'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 4h2l2.2 10.5h9.9L19 7H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </svg>
  )
}

function IconBill() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M6 3h12v18l-3-1.6-3 1.6-3-1.6L6 21z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6" strokeLinecap="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface Tab {
  to: string
  label: string
  icon: ReactNode
  end: boolean
  badge?: number
}

export function CustomerLayout() {
  const { token } = useParams()
  const { data: session } = useSession(token)
  const lines = useCart((s) => s.lines)
  const count = cartCount(lines)

  const tabs: Tab[] = [
    { to: `/t/${token}`, label: 'เมนูอาหาร', icon: <IconHome />, end: true },
    { to: `/t/${token}/cart`, label: 'ตะกร้าสินค้า', icon: <IconCart />, end: false, badge: count },
    { to: `/t/${token}/bill`, label: 'เช็คบิลอาหาร', icon: <IconBill />, end: false },
    { to: `/t/${token}/status`, label: 'สถานะอาหาร', icon: <IconClock />, end: false },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-brand-75 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-3 md:max-w-3xl lg:max-w-6xl">
          <span aria-hidden className="text-xl text-brand-400">
            🍴
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-400 sm:text-base">
              {RESTAURANT_NAME}
            </p>
            {session && (
              <p className="text-xs text-gray-500">โต๊ะ {session.tableName}</p>
            )}
          </div>

          {/* md ขึ้นไปย้าย nav มาไว้บน แล้วซ่อนแถบล่าง */}
          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-brand-300 font-semibold text-white'
                      : 'text-gray-600 hover:bg-brand-50'
                  }`
                }
              >
                {tab.icon}
                <span className="hidden lg:inline">{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4 pb-28 md:max-w-3xl md:pb-8 lg:max-w-6xl">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-500 bg-brand-400 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto flex max-w-md">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                  isActive ? 'font-bold text-white' : 'text-white/70'
                }`
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
              {Boolean(tab.badge) && (
                <span className="absolute top-1 right-[22%] flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

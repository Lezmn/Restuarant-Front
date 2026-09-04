import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  callStaff,
  getPublicCategories,
  getPublicMenu,
  getSessionByToken,
  getSessionOrders,
  requestCheckout,
  submitOrder,
} from './api'
import { useCart } from './cart-store'

// ยังไม่มี WebSocket ฝั่ง backend — หน้าติดตามสถานะใช้ polling ไปก่อน
export const ORDER_POLL_MS = 10_000

export const publicKeys = {
  session: (token: string) => ['public', 'session', token] as const,
  orders: (token: string) => ['public', 'orders', token] as const,
  menu: ['public', 'menu'] as const,
  categories: ['public', 'categories'] as const,
}

/** ลูกค้าไม่ได้ login จึงต้องใช้ /public/menu ไม่ใช่ /menu ที่มี JwtAuthGuard */
export const usePublicMenu = () =>
  useQuery({ queryKey: publicKeys.menu, queryFn: getPublicMenu })

export const usePublicCategories = () =>
  useQuery({ queryKey: publicKeys.categories, queryFn: getPublicCategories })

export const usePublicMenuItem = (id: string | undefined) =>
  useQuery({
    queryKey: [...publicKeys.menu, id] as const,
    queryFn: async () => {
      const items = await getPublicMenu()
      const item = items.find((m) => m.id === id)
      if (!item) throw new Error('ไม่พบเมนูนี้')
      return item
    },
    enabled: Boolean(id),
  })

export const useSession = (token: string | undefined) =>
  useQuery({
    queryKey: publicKeys.session(token ?? ''),
    queryFn: () => getSessionByToken(token as string),
    enabled: Boolean(token),
    retry: false,
  })

export const useSessionOrders = (token: string | undefined) =>
  useQuery({
    queryKey: publicKeys.orders(token ?? ''),
    queryFn: () => getSessionOrders(token as string),
    enabled: Boolean(token),
    refetchInterval: ORDER_POLL_MS,
  })

export function useSubmitOrder(token: string | undefined) {
  const qc = useQueryClient()
  const clear = useCart((s) => s.clear)

  return useMutation({
    mutationFn: submitOrder,
    onSuccess: () => {
      clear()
      qc.invalidateQueries({ queryKey: publicKeys.orders(token ?? '') })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useCallStaff() {
  return useMutation({ mutationFn: callStaff })
}

export function useRequestCheckout() {
  return useMutation({ mutationFn: requestCheckout })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  callStaff,
  getSessionOrders,
  getSessionByToken,
  requestCheckout,
  submitOrder,
} from './api'
import { useCart } from './cart-store'

// ยังไม่มี WebSocket ฝั่ง backend — หน้าติดตามสถานะใช้ polling ไปก่อน
export const ORDER_POLL_MS = 10_000

export const publicKeys = {
  session: (token: string) => ['public', 'session', token] as const,
  orders: (token: string) => ['public', 'orders', token] as const,
}

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

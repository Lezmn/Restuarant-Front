import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LIVE_STALE_TIME } from '@/lib/live'
import { createOrder, getOrders, updateOrderStatus } from './api'

export const orderKeys = {
  all: ['orders'] as const,
}

export const useOrders = (options?: { refetchInterval?: number }) =>
  useQuery({
    queryKey: orderKeys.all,
    queryFn: getOrders,
    refetchInterval: options?.refetchInterval,
    staleTime: LIVE_STALE_TIME,
  })

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all })
      // ยกเลิกออเดอร์แล้วโต๊ะกลับเป็นว่าง
      qc.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all })
      qc.invalidateQueries({ queryKey: ['public'] })
    },
  })
}

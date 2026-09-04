import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrders, updateOrderStatus } from './api'

export const orderKeys = {
  all: ['orders'] as const,
}

export const useOrders = (options?: { refetchInterval?: number }) =>
  useQuery({
    queryKey: orderKeys.all,
    queryFn: getOrders,
    refetchInterval: options?.refetchInterval,
  })

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  })
}

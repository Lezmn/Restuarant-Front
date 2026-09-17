import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LIVE_STALE_TIME } from '@/lib/live'
import { createPayment, getPayment, getPayments, voidPayment } from './api'
import type { Id } from '@/types/models'

export const paymentKeys = {
  all: ['payments'] as const,
  detail: (id: Id) => ['payments', id] as const,
}

export const usePayments = () =>
  useQuery({
    queryKey: paymentKeys.all,
    queryFn: getPayments,
    staleTime: LIVE_STALE_TIME,
  })

export const usePayment = (id: Id | undefined) =>
  useQuery({
    queryKey: paymentKeys.detail(id ?? ''),
    queryFn: () => getPayment(id as Id),
    enabled: Boolean(id),
  })

/** จ่ายเงิน / ยกเลิกบิล กระทบ orders, session, โต๊ะ และคำขอเช็คบิล เหมือนกันทั้งคู่ */
function useBillingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['service-requests'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      // จ่าย/ยกเลิกแล้ว session ถูกปิด/เปิดกลับ ตารางหน้า Check ต้องอัปเดตด้วย
      qc.invalidateQueries({ queryKey: ['table-sessions'] })
    },
  })
}

export const useCreatePayment = () => useBillingMutation(createPayment)
export const useVoidPayment = () => useBillingMutation(voidPayment)

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPayment } from './api'

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['service-requests'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      // จ่ายเงินแล้ว session ถูกปิด ตารางหน้า Check ต้องอัปเดตด้วย
      qc.invalidateQueries({ queryKey: ['table-sessions'] })
    },
  })
}

import { reportKeys } from '@/features/reports/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addExpense } from './api'

export function useAddExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addExpense,
    // รายจ่ายใหม่กระทบทั้งหน้ารายรับ-รายจ่ายและยอด "รายจ่ายวันนี้" บน Dashboard
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  })
}

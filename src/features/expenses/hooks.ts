import { reportKeys } from '@/features/reports/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addExpense, deleteExpense, updateExpense } from './api'

/** รายจ่ายกระทบทั้งหน้ารายรับ-รายจ่ายและยอด "รายจ่ายวันนี้" บน Dashboard */
function useExpenseMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  })
}

export const useAddExpense = () => useExpenseMutation(addExpense)
export const useUpdateExpense = () => useExpenseMutation(updateExpense)
export const useDeleteExpense = () => useExpenseMutation(deleteExpense)

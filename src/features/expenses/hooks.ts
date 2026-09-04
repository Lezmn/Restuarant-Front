import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addExpense, getFinance } from './api'

export const financeKeys = {
  all: ['finance'] as const,
}

export const useFinance = () =>
  useQuery({ queryKey: financeKeys.all, queryFn: getFinance })

export function useAddExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
  })
}

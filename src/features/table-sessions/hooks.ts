import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closeSession, getSessions, openSession } from './api'

export const sessionKeys = {
  all: ['table-sessions'] as const,
}

export const useSessions = () =>
  useQuery({ queryKey: sessionKeys.all, queryFn: getSessions })

function useSessionMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all })
      qc.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useOpenSession = () => useSessionMutation(openSession)
export const useCloseSession = () => useSessionMutation(closeSession)

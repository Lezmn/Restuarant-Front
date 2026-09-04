import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getServiceRequests, resolveServiceRequest } from './api'

export const serviceRequestKeys = { all: ['service-requests'] as const }

export const useServiceRequests = (options?: { refetchInterval?: number }) =>
  useQuery({
    queryKey: serviceRequestKeys.all,
    queryFn: getServiceRequests,
    refetchInterval: options?.refetchInterval,
  })

export function useResolveServiceRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: resolveServiceRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceRequestKeys.all }),
  })
}

import { useQuery } from '@tanstack/react-query'
import { getDashboard } from './api'

export const reportKeys = {
  dashboard: ['reports', 'dashboard'] as const,
}

export const useDashboard = () =>
  useQuery({ queryKey: reportKeys.dashboard, queryFn: getDashboard })

import { useQuery } from '@tanstack/react-query'
import { getTables } from './api'

export const tableKeys = { all: ['tables'] as const }

export const useTables = () =>
  useQuery({ queryKey: tableKeys.all, queryFn: getTables })

import type { Id } from '@/types/models'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCategories,
  getMenuItem,
  getMenuItems,
  setMenuItemAvailability,
} from './api'

export const menuKeys = {
  categories: ['categories'] as const,
  items: ['menu-items'] as const,
  item: (id: Id) => ['menu-items', id] as const,
}

export const useCategories = () =>
  useQuery({ queryKey: menuKeys.categories, queryFn: getCategories })

export const useMenuItems = () =>
  useQuery({ queryKey: menuKeys.items, queryFn: getMenuItems })

export const useMenuItem = (id: Id | undefined) =>
  useQuery({
    queryKey: menuKeys.item(id ?? ''),
    queryFn: () => getMenuItem(id as Id),
    enabled: Boolean(id),
  })

export function useSetMenuItemAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: setMenuItemAvailability,
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.items }),
  })
}

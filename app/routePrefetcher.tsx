'use client'

import { usePrefetchAllRoutes } from '@/hooks/usePrefetchAllRoutes'

export const RoutePrefetcher = () => {
  usePrefetchAllRoutes()

  return null
}

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { allRoutes } from '@/lib/routes'

/**
 * Prefetches every route so the service worker caches all of them, no
 * matter which page the user happened to open first. Must run from the
 * root layout (not a single page) — otherwise a visitor who lands on e.g.
 * `/settings` first would never trigger prefetching of `/`, `/demo`, etc.,
 * and offline navigation to those routes would fail.
 */
export const usePrefetchAllRoutes = () => {
  const router = useRouter()

  useEffect(() => {
    const prefetchAllRoutes = () => {
      allRoutes.forEach((route) => router.prefetch(route))
    }

    // `ready` only means a SW is active — it says nothing about *this* page.
    // On a fresh visit (or right after an update takes over), this page load
    // isn't controlled yet, so fetches issued now bypass the SW and never
    // land in its cache. The SW calls clients.claim() (see app/sw.ts), which
    // fires `controllerchange` the moment it takes control — wait for that
    // when we're not controlled yet, otherwise the controller is already in
    // place and we can prefetch right away.
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        prefetchAllRoutes()
      } else {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          prefetchAllRoutes,
          { once: true },
        )
        return () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            prefetchAllRoutes,
          )
        }
      }
    } else {
      prefetchAllRoutes()
    }
  }, [router])
}

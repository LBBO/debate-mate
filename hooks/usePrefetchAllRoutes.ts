import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const allRoutes = ['/', '/settings', '/demo', '/licences']

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

    // On a fresh visit, the service worker doesn't control this page yet at
    // mount time — fetches issued before it takes control bypass the SW
    // entirely and can never end up in its cache, no matter how long they're
    // given afterwards. Wait for control so the RSC payload fetches below are
    // actually interceptable and cacheable.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(prefetchAllRoutes)
    } else {
      prefetchAllRoutes()
    }
  }, [router])
}

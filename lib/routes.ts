/**
 * Every route the app ships. Single source of truth for the service worker's
 * precache list (next.config.ts) and the client-side prefetch that warms the
 * router cache for the same routes (hooks/usePrefetchAllRoutes.ts) — keeping
 * them in one place stops the two lists from drifting apart.
 */
export const allRoutes = ['/', '/settings', '/demo', '/licences']

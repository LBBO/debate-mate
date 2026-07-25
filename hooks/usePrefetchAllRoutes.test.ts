import { usePrefetchAllRoutes } from '@/hooks/usePrefetchAllRoutes'
import { allRoutes } from '@/lib/routes'
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const prefetch = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch }),
}))

describe('usePrefetchAllRoutes', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(
    navigator,
    'serviceWorker',
  )

  beforeEach(() => {
    prefetch.mockClear()
  })

  afterEach(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker)
    } else {
      // @ts-expect-error -- jsdom doesn't define this by default
      delete navigator.serviceWorker
    }
  })

  it('prefetches every route immediately when service workers are unsupported', () => {
    // @ts-expect-error -- simulate a browser without service worker support
    delete navigator.serviceWorker

    renderHook(() => usePrefetchAllRoutes())

    allRoutes.forEach((route) => expect(prefetch).toHaveBeenCalledWith(route))
  })

  it('prefetches immediately when a service worker already controls the page', () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        controller: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
    })

    renderHook(() => usePrefetchAllRoutes())

    expect(prefetch).toHaveBeenCalledTimes(allRoutes.length)
  })

  it('waits for controllerchange before prefetching when not yet controlled', () => {
    const listeners: Record<string, () => void> = {}
    const addEventListener = vi.fn((event: string, cb: () => void) => {
      listeners[event] = cb
    })
    const removeEventListener = vi.fn()

    Object.defineProperty(navigator, 'serviceWorker', {
      value: { controller: null, addEventListener, removeEventListener },
      configurable: true,
    })

    const { unmount } = renderHook(() => usePrefetchAllRoutes())

    expect(prefetch).not.toHaveBeenCalled()
    expect(addEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function),
      { once: true },
    )

    listeners.controllerchange()

    expect(prefetch).toHaveBeenCalledTimes(allRoutes.length)

    unmount()
    expect(removeEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function),
    )
  })
})

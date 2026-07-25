import { usePersistentWakeLock } from '@/hooks/usePersistentWakeLock'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const request = vi.fn()
const release = vi.fn()
let released: boolean | undefined = true
let enableScreenLock = true

vi.mock('@/contexts/settingsContext', () => ({
  useSettings: () => ({ enableScreenLock }),
}))

vi.mock('react-screen-wake-lock', () => ({
  useWakeLock: () => ({ request, release, released }),
}))

describe('usePersistentWakeLock', () => {
  beforeEach(() => {
    request.mockClear()
    release.mockClear()
    released = true
    enableScreenLock = true
  })

  it('requests a wake lock on mount when screen lock is enabled', () => {
    renderHook(() => usePersistentWakeLock())

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('does not request a wake lock when screen lock is disabled', () => {
    enableScreenLock = false

    renderHook(() => usePersistentWakeLock())

    expect(request).not.toHaveBeenCalled()
  })

  it('releases the wake lock on unmount when it was acquired', () => {
    const { unmount, rerender } = renderHook(() => usePersistentWakeLock())
    released = false
    rerender()

    unmount()

    expect(release).toHaveBeenCalledTimes(1)
  })

  it('does not call release on unmount when the lock was never acquired', () => {
    // The underlying library warns if `release` is called without a prior
    // successful `request` - only call it when we actually hold the lock.
    const { unmount } = renderHook(() => usePersistentWakeLock())

    unmount()

    expect(release).not.toHaveBeenCalled()
  })

  it('retries acquiring the lock on the next click when not yet acquired (e.g. iOS Safari)', () => {
    renderHook(() => usePersistentWakeLock())
    request.mockClear()

    window.dispatchEvent(new Event('click'))

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('re-requests the lock when the tab becomes visible again', () => {
    renderHook(() => usePersistentWakeLock())
    request.mockClear()

    document.dispatchEvent(new Event('visibilitychange'))

    expect(request).toHaveBeenCalledTimes(1)
  })
})

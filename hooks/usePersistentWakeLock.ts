import { useCallback, useEffect } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'

export const usePersistentWakeLock = () => {
  const wakeLock = useWakeLock({
    reacquireOnPageVisible: true,
    onError: (e) => console.error('Requesting wake lock failed:', e),
  })
  const { request, release, released } = wakeLock
  const isAcquired = released === false

  const requestLock = useCallback(() => {
    void request()
  }, [request])

  useEffect(() => {
    requestLock()

    return () => {
      void release()
    }
  }, [request, release, requestLock])

  useEffect(() => {
    if (!isAcquired) {
      // We might be on iOS Safari, where we might have to wait for user interaction until we can request a wake lock
      window.addEventListener('touchstart', requestLock, { once: true })
      window.addEventListener('click', requestLock, { once: true })
      return () => {
        window.removeEventListener('touchstart', requestLock)
        window.removeEventListener('click', requestLock)
      }
    }
  }, [isAcquired, requestLock])

  return wakeLock
}

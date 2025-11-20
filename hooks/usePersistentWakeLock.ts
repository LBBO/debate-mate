import { useCallback, useEffect } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'

export const usePersistentWakeLock = () => {
  const wakeLock = useWakeLock()
  const { isSupported, request, release, released } = wakeLock

  const requestLock = useCallback(() => {
    void request()
  }, [request])

  useEffect(() => {
    requestLock()
    document.addEventListener('visibilitychange', requestLock)

    return () => {
      void release()
      document.removeEventListener('visibilitychange', requestLock)
    }
  }, [request, release, requestLock])

  useEffect(() => {
    if (!isSupported && !released) {
      // We might be on iOS Safari, where we might have to wait for user interaction until we can request a wake lock
      window.addEventListener('touchstart', requestLock, { once: true })
      window.addEventListener('click', requestLock, { once: true })
      return () => {
        window.removeEventListener('touchstart', requestLock)
        window.removeEventListener('click', requestLock)
      }
    }
  }, [isSupported, released, requestLock])

  return wakeLock
}

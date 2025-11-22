import { useSettings } from '@/contexts/settingsContext'
import { useCallback, useEffect } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'

export const usePersistentWakeLock = () => {
  const settings = useSettings()
  const wakeLock = useWakeLock({
    onError: (e) => console.error('Requesting wake lock failed:', e),
  })
  const { request, release, released } = wakeLock
  const isAcquired = released === false

  const requestLock = useCallback(() => {
    if (settings.enableScreenLock) {
      void request()
    }
  }, [request, settings.enableScreenLock])

  useEffect(() => {
    requestLock()
    document.addEventListener('visibilitychange', requestLock)

    return () => {
      void release()
      document.removeEventListener('visibilitychange', requestLock)
    }
  }, [release, requestLock])

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

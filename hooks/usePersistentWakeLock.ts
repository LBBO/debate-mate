import { useSettings } from '@/contexts/settingsContext'
import { useCallback, useEffect, useRef } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'

export const usePersistentWakeLock = () => {
  const settings = useSettings()
  const wakeLock = useWakeLock({
    // Browsers reject this for plenty of expected reasons (backgrounded tab,
    // automated/headless contexts, battery saver, etc.), so this isn't an
    // application error - log it at info level rather than as console.error.
    onError: (e) => console.info('Requesting wake lock failed:', e),
  })
  const { request, release, released } = wakeLock
  const isAcquired = released === false
  // The mount effect below only re-subscribes when `release`/`requestLock`
  // change identity, so its cleanup can't see a fresh `isAcquired` from
  // render - track it in a ref to avoid calling `release()` when no lock
  // was ever acquired (the library warns on that).
  const isAcquiredRef = useRef(isAcquired)
  useEffect(() => {
    isAcquiredRef.current = isAcquired
  })

  const requestLock = useCallback(() => {
    if (settings.enableScreenLock) {
      void request()
    }
  }, [request, settings.enableScreenLock])

  useEffect(() => {
    requestLock()
    document.addEventListener('visibilitychange', requestLock)

    return () => {
      if (isAcquiredRef.current) {
        void release()
      }
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

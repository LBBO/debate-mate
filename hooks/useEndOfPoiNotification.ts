import { useAudio } from '@/contexts/audioPlayerContext'
import { Settings, useSettings } from '@/contexts/settingsContext'
import { match } from '@gabriel/ts-pattern'
import { useCallback } from 'react'

export const useEndOfPoiNotification = () => {
  const settings = useSettings()
  const { playAudio } = useAudio()

  return useCallback(
    (type?: Settings['endOfPoiNotification']) => {
      match(type ?? settings.endOfPoiNotification)
        .with('sound', () => {
          playAudio('endOfPoi')
        })
        .with('alert', () => {
          const style = document.documentElement.style
          const old = style.getPropertyValue('--background')
          style.setProperty('--background', '#dc2626')
          setTimeout(() => {
            style.setProperty('--background', old)
          }, 2_000)
        })
        .exhaustive()
    },
    [playAudio, settings.endOfPoiNotification],
  )
}

import { SpeechType } from '@/app/speechTypes'
import { TimeDisplay } from '@/components/timeDisplay'
import { useAudio } from '@/contexts/audioPlayerContext'
import { cn } from '@/lib/utils'
import { useCallback, useEffect } from 'react'
import { useStopwatch } from 'react-timer-hook'

export const usePoiTimer = ({
  isSpeechRunning,
  speechType,
}: {
  isSpeechRunning: boolean
  speechType: SpeechType
}) => {
  const { pause, reset, seconds, minutes, totalSeconds, isRunning } =
    useStopwatch({ autoStart: false })

  const { playAudio } = useAudio({
    endOfPoi: '/wrong-answer-boop-boop.mp3',
  })

  const interruptPoi = useCallback(() => {
    pause()
    reset(undefined, false)
  }, [pause, reset])

  useEffect(() => {
    if (!isSpeechRunning && isRunning) {
      interruptPoi()
    }
  }, [interruptPoi, isRunning, isSpeechRunning])

  const togglePoi = useCallback(() => {
    if (isRunning) {
      interruptPoi()
    } else {
      reset(undefined, true)
    }
  }, [interruptPoi, isRunning, reset])

  useEffect(() => {
    if (totalSeconds > speechType.timeLimits.poi) {
      interruptPoi()
      playAudio('endOfPoi')
    }
  }, [interruptPoi, playAudio, speechType.timeLimits.poi, totalSeconds])

  const timeDisplay = (
    <TimeDisplay
      className={cn('text-4xl text-slate-500', {
        'text-transparent':
          !isRunning || totalSeconds > speechType.timeLimits.poi,
      })}
      minutes={minutes}
      seconds={seconds}
    />
  )

  return { togglePoi, timeDisplay, isRunning, interruptPoi }
}

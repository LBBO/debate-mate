'use client'
import { DebatePhaseBadge } from '@/app/DebatePhaseBadge'
import { DebatePhase } from '@/app/debatePhase'
import { IconButton } from '@/components/ui/shadcn-io/icon-button'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useStopwatch } from 'react-timer-hook'

const computePhase = (passedSeconds: number): DebatePhase => {
  const secondsPerMinute = 60

  if (passedSeconds < 1 * secondsPerMinute) {
    return 'protected-start'
  }
  if (passedSeconds < 6 * secondsPerMinute) {
    return 'unprotected'
  }
  if (passedSeconds < 7 * secondsPerMinute) {
    return 'protected-end'
  }
  if (passedSeconds < 7 * secondsPerMinute + 15) {
    return 'grace-period'
  }
  return 'ended'
}

export default function Home() {
  const {
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
    seconds,
    minutes,
    totalSeconds,
    isRunning,
  } = useStopwatch({ autoStart: false })

  const currentPhase =
    isRunning || totalSeconds > 0 ? computePhase(totalSeconds) : undefined

  useEffect(() => {
    // TODO play sounds
  }, [currentPhase])

  return (
    <main className="grid min-h-screen w-full grid-cols-1 grid-rows-[1fr,auto,1fr] justify-items-center gap-8 p-8">
      <div className=""></div>
      <div className="grid place-content-center justify-items-center gap-8">
        <p className="text-7xl font-bold">
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </p>
        <DebatePhaseBadge currentPhase={currentPhase} />
        <IconButton
          icon={isRunning ? PauseIcon : PlayIcon}
          active={isRunning}
          size="xl"
          color={[250, 250, 250]}
          className="bg-slate-900"
          onClick={() => {
            if (isRunning) {
              pauseTimer()
            } else {
              resetTimer()
              startTimer()
            }
          }}
        />
      </div>
      <div className=""></div>
    </main>
  )
}

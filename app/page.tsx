'use client'
import { DebatePhaseBadge } from '@/app/DebatePhaseBadge'
import { DebatePhase } from '@/app/debatePhase'
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/shadcn-io/icon-button'
import { ClockIcon, PauseIcon, PlayIcon, SquareIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
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

const getIconForButton = ({
  isSoftPaused,
  isRunning,
  minutes,
}: {
  isSoftPaused: boolean
  isRunning: boolean
  minutes: number
}) => {
  if (!isRunning) {
    return PlayIcon
  }
  if (isSoftPaused) {
    return SquareIcon
  }
  if (minutes > 0) {
    return SquareIcon
  }
  return PauseIcon
}

export default function Home() {
  const [isSoftPaused, setIsSoftPaused] = useState(false)
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
        {isSoftPaused ? (
          <>
            <p className="font-mono text-7xl font-bold text-slate-500">
              {(6 - minutes).toString().padStart(2, '0')}:
              {(59 - seconds).toString().padStart(2, '0')}
            </p>
            <Badge className="bg-slate-500 text-3xl text-white [&>svg]:size-6">
              <ClockIcon />
              Preparation time
            </Badge>
          </>
        ) : (
          <>
            <p className="font-mono text-7xl font-bold">
              {minutes.toString().padStart(2, '0')}:
              {seconds.toString().padStart(2, '0')}
            </p>
            <DebatePhaseBadge currentPhase={currentPhase} />
          </>
        )}
        <IconButton
          icon={getIconForButton({
            isRunning,
            isSoftPaused,
            minutes,
          })}
          active={isRunning}
          size="xl"
          color={[250, 250, 250]}
          className="bg-slate-900"
          onClick={() => {
            if (!isRunning) {
              resetTimer(undefined, true)
              setIsSoftPaused(false)
            } else if (minutes < 7 && !isSoftPaused) {
              setIsSoftPaused(true)
            } else {
              pauseTimer()
            }
          }}
        />
      </div>
      <div className=""></div>
    </main>
  )
}

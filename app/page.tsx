'use client'
import { useEffect, useState } from 'react'
import { useStopwatch } from 'react-timer-hook'

type DebatePhase =
  | 'protected-start'
  | 'unprotected'
  | 'protected-end'
  | 'grace period'
  | 'ended'

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
    return 'grace period'
  }
  return 'ended'
}

export default function Home() {
  const [startTime, setStartTime] = useState<number | undefined>()
  const {
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
    seconds,
    minutes,
    totalSeconds,
  } = useStopwatch({ autoStart: false })

  const currentPhase =
    startTime === undefined ? undefined : computePhase(totalSeconds)

  useEffect(() => {
    // TODO play sounds
  }, [currentPhase])

  return (
    <div className="footer">
      {minutes.toString().padStart(2, '0')}:
      {seconds.toString().padStart(2, '0')}
      <button
        onClick={() => {
          startTimer()
        }}
      >
        Start
      </button>
      <button
        onClick={() => {
          pauseTimer()
        }}
      >
        Stop
      </button>
    </div>
  )
}

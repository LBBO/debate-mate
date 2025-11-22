'use client'
import { DebatePhaseBadge } from '@/app/DebatePhaseBadge'
import { DebatePhase } from '@/app/debatePhase'
import { SpeechType, SpeechTypeKey, speechTypes } from '@/app/speechTypes'
import { SettingsButton } from '@/components/settingsButton'
import { TimeDisplay } from '@/components/timeDisplay'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { IconButton } from '@/components/ui/shadcn-io/icon-button'
import { useAudio } from '@/contexts/audioPlayerContext'
import { usePersistentWakeLock } from '@/hooks/usePersistentWakeLock'
import { usePoiTimer } from '@/hooks/usePoiTimer'
import { P, match } from '@gabriel/ts-pattern'
import {
  ClockIcon,
  MessageCircleOffIcon,
  MessageCircleQuestionMarkIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useStopwatch } from 'react-timer-hook'

const computePhase = (
  passedSeconds: number,
  speechType: SpeechType,
): DebatePhase => {
  const timeLimits = speechType.timeLimits

  if (passedSeconds < timeLimits.protectedStart) {
    return 'protected-start'
  }
  if (passedSeconds < timeLimits.totalRegularTime - timeLimits.protectedEnd) {
    return 'unprotected'
  }
  if (passedSeconds < timeLimits.totalRegularTime) {
    return 'protected-end'
  }
  if (passedSeconds < timeLimits.totalRegularTime + timeLimits.gracePeriod) {
    return 'grace-period'
  }
  return 'ended'
}

const getIconForButton = ({
  isSoftPaused,
  isRunning,
  totalSeconds,
  speechType,
}: {
  isSoftPaused: boolean
  isRunning: boolean
  totalSeconds: number
  speechType: SpeechType
}) => {
  if (!isRunning) {
    return PlayIcon
  }
  if (isSoftPaused) {
    return SquareIcon
  }
  if (totalSeconds > speechType.timeLimits.totalRegularTime) {
    return SquareIcon
  }
  return PauseIcon
}

export default function Home() {
  const { type } = usePersistentWakeLock()
  const isWakeLockActive = type !== undefined

  const { playAudio, activateAudio } = useAudio({
    bell: '/bell.mp3',
    friendlyReminder: '/friendly-reminder.mp3',
    regularTimeOver: '/regular-time-over.mp3',
    completelyOver: '/completely-over.mp3',
  })

  const [isSoftPaused, setIsSoftPaused] = useState(false)
  const {
    pause: pauseTimer,
    reset: resetTimer,
    seconds,
    minutes,
    totalSeconds,
    isRunning,
  } = useStopwatch({ autoStart: false })

  const [speechTypeKey, setSpeechTypeKey] = useState<SpeechTypeKey>('normal')
  const speechType = speechTypes[speechTypeKey]

  const {
    togglePoi,
    isRunning: isPoiRunning,
    timeDisplay: poiTimeDisplay,
  } = usePoiTimer({
    isSpeechRunning: isRunning && !isSoftPaused,
    speechType,
  })

  const onChangeSpeechType = (newTypeKey: SpeechTypeKey) => {
    if (!isRunning || isSoftPaused) {
      resetTimer(undefined, false)
      setIsSoftPaused(false)
    }
    setSpeechTypeKey(newTypeKey)
  }

  const totalRemainingSeconds =
    speechType.timeLimits.totalRegularTime - totalSeconds

  useEffect(() => {
    if (isSoftPaused && totalRemainingSeconds <= 0) {
      pauseTimer()
    }
  }, [isSoftPaused, pauseTimer, totalRemainingSeconds])

  const currentPhase =
    isRunning || totalSeconds > 0
      ? computePhase(totalSeconds, speechType)
      : undefined

  useEffect(() => {
    match(currentPhase)
      .with(P.union('unprotected', 'protected-end'), () => {
        if (!isSoftPaused) {
          playAudio('bell')
        }
      })
      .with('grace-period', () => {
        if (isSoftPaused) {
          playAudio('friendlyReminder')
        } else {
          playAudio('regularTimeOver')
        }
      })
      .with('ended', () => {
        if (!isSoftPaused) {
          playAudio('completelyOver')
        }
      })
      .otherwise(() => {})
  }, [currentPhase])

  const isPoiForbidden =
    !isPoiRunning &&
    (currentPhase !== 'unprotected' || !isRunning || isSoftPaused)

  return (
    <main className="grid min-h-screen w-full grid-cols-1 grid-rows-[1fr_auto_1fr] justify-items-center gap-8 p-8">
      <ButtonGroup>
        {(
          Object.entries(speechTypes) as Array<[SpeechTypeKey, SpeechType]>
        ).map(([key, type]) => (
          <Button
            key={key}
            onClick={() => onChangeSpeechType(key)}
            size="sm"
            variant={speechTypeKey === key ? 'default' : 'outline'}
          >
            {type.shortName}
          </Button>
        ))}
      </ButtonGroup>
      <div className="grid w-full max-w-xl justify-items-center gap-8">
        {isSoftPaused ? (
          <>
            {/* This is just serving as a vertical-space reserver */}
            {poiTimeDisplay}

            <TimeDisplay
              minutes={(totalRemainingSeconds < 0 ? Math.ceil : Math.floor)(
                totalRemainingSeconds / 60,
              )}
              seconds={totalRemainingSeconds % 60}
              variant="gray"
            />
            <Badge className="bg-slate-500 text-3xl text-white [&>svg]:size-6">
              <ClockIcon />
              Preparation time
            </Badge>
          </>
        ) : (
          <>
            {poiTimeDisplay}
            <TimeDisplay minutes={minutes} seconds={seconds} />
            <DebatePhaseBadge currentPhase={currentPhase} />
          </>
        )}
        <div className="grid w-full grid-cols-3">
          <div />
          <IconButton
            icon={getIconForButton({
              isRunning,
              isSoftPaused,
              totalSeconds,
              speechType,
            })}
            active={isRunning}
            size="xl"
            color={[250, 250, 250]}
            className="place-self-center bg-slate-900 hover:bg-slate-900/90 active:bg-slate-900/80"
            onClick={() => {
              activateAudio()

              if (!isRunning) {
                resetTimer(undefined, true)
                setIsSoftPaused(false)
              } else if (
                totalSeconds < speechType.timeLimits.totalRegularTime &&
                !isSoftPaused
              ) {
                setIsSoftPaused(true)
              } else {
                pauseTimer()
              }
            }}
          />
          <IconButton
            icon={
              isPoiRunning
                ? SquareIcon
                : isPoiForbidden
                  ? MessageCircleOffIcon
                  : MessageCircleQuestionMarkIcon
            }
            active={isPoiRunning}
            size="lg"
            disabled={isPoiForbidden}
            color={isPoiForbidden ? [148, 163, 184] : [15, 23, 42]}
            className="place-self-center bg-slate-300 hover:bg-slate-300/90 active:bg-slate-300/80 disabled:cursor-not-allowed disabled:hover:bg-slate-300 disabled:active:bg-slate-300"
            onClick={togglePoi}
          />
        </div>
      </div>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] content-end items-center">
        <div />
        <Link href="/licences">Licenses</Link>
        <div className="flex flex-row-reverse">
          <SettingsButton />
        </div>
      </div>
    </main>
  )
}

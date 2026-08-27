'use client'
import { DebatePhaseBadge } from '@/app/DebatePhaseBadge'
import { SpeechType, SpeechTypeKey, speechTypes } from '@/app/speechTypes'
import {
  clampDeductedSeconds,
  computePhase,
  getDeductionOptions,
  getIconForButton,
  getMaxDeductibleSeconds,
} from '@/app/timerLogic'
import { SettingsButton } from '@/components/settingsButton'
import { TimeDisplay } from '@/components/timeDisplay'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { IconButton } from '@/components/ui/shadcn-io/icon-button'
import {
  WheelPicker,
  WheelPickerWrapper,
} from '@/components/wheel-picker/wheel-picker'
import { useAudio } from '@/contexts/audioPlayerContext'
import { useSettings, useUpdateSettings } from '@/contexts/settingsContext'
import { usePersistentWakeLock } from '@/hooks/usePersistentWakeLock'
import { usePoiTimer } from '@/hooks/usePoiTimer'
import { P, match } from '@gabriel/ts-pattern'
import {
  ClockIcon,
  MessageCircleOffIcon,
  MessageCircleQuestionMarkIcon,
  SquareIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useStopwatch } from 'react-timer-hook'

export default function Home() {
  usePersistentWakeLock()

  const { playAudio, activateAudio } = useAudio()
  const settings = useSettings()
  const updateSettings = useUpdateSettings()

  const [isSoftPaused, setIsSoftPaused] = useState(false)
  const {
    pause: pauseTimer,
    reset: resetTimer,
    totalSeconds,
    isRunning,
  } = useStopwatch({ autoStart: false })

  const [speechTypeKey, setSpeechTypeKey] = useState<SpeechTypeKey>('normal')
  const speechType = speechTypes[speechTypeKey]
  const [deductedSeconds, setDeductedSeconds] = useState(0)

  const maxDeductibleSeconds = getMaxDeductibleSeconds(speechType)
  const deductionOptions = React.useMemo(
    () => getDeductionOptions(maxDeductibleSeconds),
    [maxDeductibleSeconds],
  )

  const effectiveTotalSeconds = totalSeconds + deductedSeconds

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
    setDeductedSeconds(0)
    setSpeechTypeKey(newTypeKey)
  }

  const totalRemainingSeconds =
    speechType.timeLimits.totalRegularTime - effectiveTotalSeconds

  useEffect(() => {
    if (isSoftPaused && totalRemainingSeconds <= 0) {
      pauseTimer()
    }
  }, [isSoftPaused, pauseTimer, totalRemainingSeconds])

  const currentPhase =
    isRunning || effectiveTotalSeconds > 0
      ? computePhase(effectiveTotalSeconds, speechType)
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

    // This is a purposeful onChange hook
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase])

  const isPoiForbidden =
    !isPoiRunning &&
    (currentPhase !== 'unprotected' || !isRunning || isSoftPaused)

  return (
    <main className="grid h-full w-full grid-cols-1 grid-rows-[1fr_auto_1fr] justify-items-center gap-8 p-8">
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
            <TimeDisplay
              minutes={Math.floor(effectiveTotalSeconds / 60)}
              seconds={effectiveTotalSeconds % 60}
            />
            <DebatePhaseBadge currentPhase={currentPhase} />
          </>
        )}
        <div className="grid w-full grid-cols-3">
          <div className="place-self-center">
            {isRunning ? (
              <>
                <p className={'mb-1 text-center text-xs text-slate-600'}>
                  Deduct
                </p>
                <WheelPickerWrapper className="w-24">
                  <WheelPicker<number>
                    aria-label="Deduct timer seconds"
                    options={deductionOptions}
                    value={deductedSeconds}
                    visibleCount={10}
                    optionItemHeight={24}
                    classNames={{
                      optionItem: 'text-sm',
                      highlightItem: 'text-sm font-semibold',
                    }}
                    onValueChange={(value) =>
                      setDeductedSeconds(
                        clampDeductedSeconds(value, speechType),
                      )
                    }
                  />
                </WheelPickerWrapper>
              </>
            ) : null}
          </div>
          <IconButton
            icon={getIconForButton({
              isRunning,
              isSoftPaused,
              elapsedSeconds: effectiveTotalSeconds,
              speechType,
            })}
            aria-label={
              !isRunning
                ? 'Start timer'
                : isSoftPaused ||
                    effectiveTotalSeconds >
                      speechType.timeLimits.totalRegularTime
                  ? 'Stop timer'
                  : 'Pause timer'
            }
            active={isRunning}
            size="xl"
            color={[250, 250, 250]}
            className="place-self-center bg-slate-900 hover:bg-slate-900/90 active:bg-slate-900/80"
            onClick={() => {
              activateAudio()

              if (!isRunning) {
                resetTimer(undefined, true)
                setIsSoftPaused(false)
                setDeductedSeconds(0)
              } else if (
                effectiveTotalSeconds <
                  speechType.timeLimits.totalRegularTime &&
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
            aria-label={
              isPoiRunning
                ? 'Stop point of information'
                : 'Point of information'
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
        <div>
          <IconButton
            icon={settings.muteAudio ? VolumeXIcon : Volume2Icon}
            aria-label={settings.muteAudio ? 'Unmute audio' : 'Mute audio'}
            animate={false}
            size="lg"
            color={settings.muteAudio ? [220, 38, 38] : [64, 64, 64]}
            className="bg-neutral-200"
            onClick={() => updateSettings({ muteAudio: !settings.muteAudio })}
          />
        </div>
        <div />
        <div className="flex flex-row-reverse">
          <SettingsButton />
        </div>
      </div>
    </main>
  )
}

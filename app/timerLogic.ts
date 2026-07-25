import { DebatePhase } from '@/app/debatePhase'
import { SpeechType } from '@/app/speechTypes'
import type { WheelPickerOption } from '@/components/wheel-picker/wheel-picker'
import { PauseIcon, PlayIcon, SquareIcon } from 'lucide-react'

export const computePhase = (
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

export const getIconForButton = ({
  isSoftPaused,
  isRunning,
  elapsedSeconds,
  speechType,
}: {
  isSoftPaused: boolean
  isRunning: boolean
  elapsedSeconds: number
  speechType: SpeechType
}) => {
  if (!isRunning) {
    return PlayIcon
  }
  if (isSoftPaused) {
    return SquareIcon
  }
  if (elapsedSeconds > speechType.timeLimits.totalRegularTime) {
    return SquareIcon
  }
  return PauseIcon
}

const deductionStepSeconds = 1

export const getMaxDeductibleSeconds = (speechType: SpeechType) =>
  speechType.timeLimits.totalRegularTime + speechType.timeLimits.gracePeriod

export const clampDeductedSeconds = (seconds: number, speechType: SpeechType) =>
  Math.max(0, Math.min(seconds, getMaxDeductibleSeconds(speechType)))

export const getDeductionOptions = (
  maxDeductibleSeconds: number,
): WheelPickerOption<number>[] => {
  const options: WheelPickerOption<number>[] = Array.from(
    { length: Math.ceil(maxDeductibleSeconds / deductionStepSeconds) + 1 },
    (_, index) => {
      const value = Math.min(index * deductionStepSeconds, maxDeductibleSeconds)
      return {
        value,
        label: `${value}s`,
      }
    },
  )

  return options
}

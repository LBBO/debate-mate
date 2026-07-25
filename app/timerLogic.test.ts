import { SpeechType, speechTypes } from '@/app/speechTypes'
import {
  clampDeductedSeconds,
  computePhase,
  getDeductionOptions,
  getIconForButton,
  getMaxDeductibleSeconds,
} from '@/app/timerLogic'
import { PauseIcon, PlayIcon, SquareIcon } from 'lucide-react'
import { describe, expect, it } from 'vitest'

describe('computePhase', () => {
  const normal = speechTypes.normal

  it('is protected-start before protectedStart elapses', () => {
    expect(computePhase(0, normal)).toBe('protected-start')
    expect(computePhase(59, normal)).toBe('protected-start')
  })

  it('is unprotected once protectedStart elapses and before protectedEnd window', () => {
    expect(computePhase(60, normal)).toBe('unprotected')
    expect(computePhase(359, normal)).toBe('unprotected')
  })

  it('is protected-end during the final protected window', () => {
    expect(computePhase(360, normal)).toBe('protected-end')
    expect(computePhase(419, normal)).toBe('protected-end')
  })

  it('is grace-period once totalRegularTime elapses', () => {
    expect(computePhase(420, normal)).toBe('grace-period')
    expect(computePhase(434, normal)).toBe('grace-period')
  })

  it('is ended once the grace period elapses', () => {
    expect(computePhase(435, normal)).toBe('ended')
    expect(computePhase(1000, normal)).toBe('ended')
  })

  it('collapses unprotected/protected-end into ended immediately when both are zero-width (rebuttal)', () => {
    const rebuttal = speechTypes.rebuttal
    expect(computePhase(0, rebuttal)).toBe('protected-start')
    expect(computePhase(59, rebuttal)).toBe('protected-start')
    expect(computePhase(60, rebuttal)).toBe('ended')
  })
})

describe('getIconForButton', () => {
  const speechType = speechTypes.normal

  it('shows play when not running', () => {
    expect(
      getIconForButton({
        isRunning: false,
        isSoftPaused: false,
        elapsedSeconds: 0,
        speechType,
      }),
    ).toBe(PlayIcon)
  })

  it('shows stop when soft-paused, regardless of elapsed time', () => {
    expect(
      getIconForButton({
        isRunning: true,
        isSoftPaused: true,
        elapsedSeconds: 0,
        speechType,
      }),
    ).toBe(SquareIcon)
  })

  it('shows stop once elapsed time exceeds totalRegularTime', () => {
    expect(
      getIconForButton({
        isRunning: true,
        isSoftPaused: false,
        elapsedSeconds: speechType.timeLimits.totalRegularTime + 1,
        speechType,
      }),
    ).toBe(SquareIcon)
  })

  it('shows pause while running within regular time', () => {
    expect(
      getIconForButton({
        isRunning: true,
        isSoftPaused: false,
        elapsedSeconds: 10,
        speechType,
      }),
    ).toBe(PauseIcon)
  })
})

describe('getMaxDeductibleSeconds', () => {
  it('is totalRegularTime + gracePeriod', () => {
    const speechType: SpeechType = speechTypes.normal
    expect(getMaxDeductibleSeconds(speechType)).toBe(
      speechType.timeLimits.totalRegularTime +
        speechType.timeLimits.gracePeriod,
    )
  })
})

describe('clampDeductedSeconds', () => {
  const speechType = speechTypes.normal
  const max = getMaxDeductibleSeconds(speechType)

  it('clamps negative values to 0', () => {
    expect(clampDeductedSeconds(-10, speechType)).toBe(0)
  })

  it('passes through in-range values', () => {
    expect(clampDeductedSeconds(30, speechType)).toBe(30)
  })

  it('clamps values above the max deductible', () => {
    expect(clampDeductedSeconds(max + 100, speechType)).toBe(max)
  })
})

describe('getDeductionOptions', () => {
  it('generates one option per second from 0 to max, inclusive', () => {
    const options = getDeductionOptions(5)
    expect(options).toEqual([
      { value: 0, label: '0s' },
      { value: 1, label: '1s' },
      { value: 2, label: '2s' },
      { value: 3, label: '3s' },
      { value: 4, label: '4s' },
      { value: 5, label: '5s' },
    ])
  })

  it('handles a max of 0', () => {
    expect(getDeductionOptions(0)).toEqual([{ value: 0, label: '0s' }])
  })
})

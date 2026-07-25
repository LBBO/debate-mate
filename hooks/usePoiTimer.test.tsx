import { SpeechType } from '@/app/speechTypes'
import { usePoiTimer } from '@/hooks/usePoiTimer'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const notify = vi.fn()

vi.mock('@/hooks/useEndOfPoiNotification', () => ({
  useEndOfPoiNotification: () => notify,
}))

const makeSpeechType = (poiSeconds: number): SpeechType => ({
  name: 'Test',
  shortName: 'Test',
  timeLimits: {
    totalRegularTime: 420,
    protectedStart: 60,
    protectedEnd: 60,
    gracePeriod: 15,
    poi: poiSeconds,
  },
})

describe('usePoiTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    notify.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts and stops via togglePoi', () => {
    const speechType = makeSpeechType(15)
    const { result } = renderHook(
      ({ isSpeechRunning }) => usePoiTimer({ isSpeechRunning, speechType }),
      { initialProps: { isSpeechRunning: true } },
    )

    expect(result.current.isRunning).toBe(false)

    act(() => result.current.togglePoi())
    expect(result.current.isRunning).toBe(true)

    act(() => result.current.togglePoi())
    expect(result.current.isRunning).toBe(false)
  })

  it('interrupts the POI when the speech itself stops', () => {
    const speechType = makeSpeechType(15)
    const { result, rerender } = renderHook(
      ({ isSpeechRunning }) => usePoiTimer({ isSpeechRunning, speechType }),
      { initialProps: { isSpeechRunning: true } },
    )

    act(() => result.current.togglePoi())
    expect(result.current.isRunning).toBe(true)

    rerender({ isSpeechRunning: false })
    expect(result.current.isRunning).toBe(false)
  })

  it('auto-interrupts and notifies once the POI time limit is exceeded', () => {
    const speechType = makeSpeechType(2)
    const { result } = renderHook(() =>
      usePoiTimer({ isSpeechRunning: true, speechType }),
    )

    act(() => result.current.togglePoi())
    expect(result.current.isRunning).toBe(true)
    expect(notify).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3_000)
    })

    expect(result.current.isRunning).toBe(false)
    expect(notify).toHaveBeenCalledTimes(1)
  })
})

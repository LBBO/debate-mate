import { useEndOfPoiNotification } from '@/hooks/useEndOfPoiNotification'
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const playAudio = vi.fn()
let endOfPoiNotification: 'sound' | 'alert' = 'sound'

vi.mock('@/contexts/audioPlayerContext', () => ({
  useAudio: () => ({ playAudio, activateAudio: vi.fn() }),
}))

vi.mock('@/contexts/settingsContext', () => ({
  useSettings: () => ({ endOfPoiNotification }),
}))

describe('useEndOfPoiNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    playAudio.mockClear()
    endOfPoiNotification = 'sound'
    document.documentElement.style.setProperty('--background', '#ffffff')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('plays the endOfPoi sound when the setting is "sound"', () => {
    const { result } = renderHook(() => useEndOfPoiNotification())

    result.current()

    expect(playAudio).toHaveBeenCalledWith('endOfPoi')
  })

  it('flashes the background and reverts it after 2s when the setting is "alert"', () => {
    endOfPoiNotification = 'alert'
    const { result } = renderHook(() => useEndOfPoiNotification())

    result.current()

    expect(
      document.documentElement.style.getPropertyValue('--background'),
    ).toBe('#dc2626')

    vi.advanceTimersByTime(2_000)

    expect(
      document.documentElement.style.getPropertyValue('--background'),
    ).toBe('#ffffff')
    expect(playAudio).not.toHaveBeenCalled()
  })

  it('an explicit type argument overrides the settings default', () => {
    endOfPoiNotification = 'alert'
    const { result } = renderHook(() => useEndOfPoiNotification())

    result.current('sound')

    expect(playAudio).toHaveBeenCalledWith('endOfPoi')
  })
})

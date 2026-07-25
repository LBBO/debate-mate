import {
  AudioPlayerContextProvider,
  useAudio,
} from '@/contexts/audioPlayerContext'
import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let muteAudio = false

vi.mock('@/contexts/settingsContext', () => ({
  useSettings: () => ({ muteAudio }),
}))

const wrapper = ({ children }: PropsWithChildren) => (
  <AudioPlayerContextProvider>{children}</AudioPlayerContextProvider>
)

describe('useAudio', () => {
  beforeEach(() => {
    muteAudio = false
  })

  it('throws when used outside an AudioPlayerContextProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAudio())).toThrow(
      'useAudioPlayerContext must be used within an AudioPlayerContextProvider',
    )

    consoleError.mockRestore()
  })

  it('plays the requested sound by setting the audio element src', () => {
    const { result } = renderHook(() => useAudio(), { wrapper })
    const audioElement = document.querySelector('audio')!
    const playSpy = vi.fn().mockResolvedValue(undefined)
    audioElement.play = playSpy

    act(() => result.current.playAudio('bell'))

    expect(audioElement.src).toContain('/bell.mp3')
    expect(playSpy).toHaveBeenCalled()
  })

  it('does not play when muted, unless overrideMute is set', () => {
    muteAudio = true
    const { result } = renderHook(() => useAudio(), { wrapper })
    const audioElement = document.querySelector('audio')!
    const playSpy = vi.fn().mockResolvedValue(undefined)
    audioElement.play = playSpy

    act(() => result.current.playAudio('bell'))
    expect(playSpy).not.toHaveBeenCalled()

    act(() => result.current.playAudio('bell', true))
    expect(playSpy).toHaveBeenCalled()
  })

  it('activateAudio only unlocks playback once', () => {
    const { result } = renderHook(() => useAudio(), { wrapper })
    const audioElement = document.querySelector('audio')!
    const playSpy = vi.fn().mockResolvedValue(undefined)
    audioElement.play = playSpy

    act(() => result.current.activateAudio())
    expect(playSpy).toHaveBeenCalledTimes(1)

    act(() => result.current.activateAudio())
    expect(playSpy).toHaveBeenCalledTimes(1)
  })
})

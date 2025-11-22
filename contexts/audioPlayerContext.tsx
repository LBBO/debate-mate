'use client'

import { useSettings } from '@/contexts/settingsContext'
import { addBasePath } from 'next/dist/client/add-base-path'
import {
  PropsWithChildren,
  RefObject,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'

const context = createContext<RefObject<HTMLAudioElement | null> | null>(null)

const audioSources = {
  bell: '/bell.mp3',
  friendlyReminder: '/friendly-reminder.mp3',
  regularTimeOver: '/regular-time-over.mp3',
  completelyOver: '/completely-over.mp3',
  endOfPoi: '/wrong-answer-boop-boop.mp3',
}

export const AudioPlayerContextProvider = ({ children }: PropsWithChildren) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  return (
    <context.Provider value={audioRef}>
      {children}
      <audio className="hidden" ref={audioRef} />
    </context.Provider>
  )
}

const useAudioPlayerContext = () => {
  const audioPlayerContext = useContext(context)
  if (!audioPlayerContext) {
    throw new Error(
      'useAudioPlayerContext must be used within an AudioPlayerContextProvider',
    )
  }
  return audioPlayerContext
}

export const useAudio = () => {
  const settings = useSettings()
  const audioPlayerContext = useAudioPlayerContext()

  const playAudio = (key: keyof typeof audioSources) => {
    if (!audioPlayerContext.current) {
      throw new Error('Attempted to play audio before audio element was ready')
    }

    if (settings.muteAudio) {
      return
    }

    const element = audioPlayerContext.current
    // This is a ref element, which is allowed to be mutated
    // eslint-disable-next-line react-hooks/immutability
    element.src = addBasePath(audioSources[key])
    element.pause()
    element.currentTime = 0
    void element.play()
  }

  const [hasBeenActivated, setHasBeenActivated] = useState(false)
  const activateAudio = () => {
    if (hasBeenActivated) {
      return
    }
    if (!audioPlayerContext.current) {
      throw new Error(
        'Attempted to activate audio before audio element was ready',
      )
    }

    const element = audioPlayerContext.current
    // This is a ref element, which is allowed to be mutated
    // eslint-disable-next-line react-hooks/immutability
    element.src =
      // 0-second sound file to unlock audio on iOS
      'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDkAAAAAAAAAGw9wrNaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxHYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
    void element.play()
    setHasBeenActivated(true)
  }

  return { playAudio, activateAudio }
}

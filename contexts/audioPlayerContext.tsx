'use client'

import {
  PropsWithChildren,
  RefObject,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'

const context = createContext<RefObject<HTMLAudioElement | null> | null>(null)

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

export const useAudio = <SourceMap extends Record<string, string>>(
  sourceMap: SourceMap,
) => {
  const audioPlayerContext = useAudioPlayerContext()

  const playAudio = (key: keyof SourceMap) => {
    if (!audioPlayerContext.current) {
      throw new Error('Attempted to play audio before audio element was ready')
    }
    console.log('Playing audio for key:', key)

    const element = audioPlayerContext.current
    // This is a ref element, which is allowed to be mutated
    // eslint-disable-next-line react-hooks/immutability
    element.src = sourceMap[key]
    element.pause()
    element.fastSeek(0)
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
    console.log('Activating audio')

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

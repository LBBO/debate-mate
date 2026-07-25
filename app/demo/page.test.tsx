import DemoPage from '@/app/demo/page'
import { AudioPlayerContextProvider } from '@/contexts/audioPlayerContext'
import { SettingsProvider } from '@/contexts/settingsContext'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

const wrapper = ({ children }: PropsWithChildren) => (
  <SettingsProvider>
    <AudioPlayerContextProvider>{children}</AudioPlayerContextProvider>
  </SettingsProvider>
)

describe('DemoPage', () => {
  it('renders a play button for every sound demo', () => {
    render(<DemoPage />, { wrapper })

    expect(screen.getAllByRole('button', { name: /play/i })).toHaveLength(5)
  })

  it('plays the underlying audio element when a demo is played', async () => {
    const user = userEvent.setup()
    render(<DemoPage />, { wrapper })

    const playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined)

    await user.click(screen.getAllByRole('button', { name: /play/i })[0])

    expect(playSpy).toHaveBeenCalled()

    const audioElement = document.querySelector('audio')!
    expect(audioElement.src).toContain('/bell.mp3')
  })
})

import SettingsPage from '@/app/settings/page'
import { AudioPlayerContextProvider } from '@/contexts/audioPlayerContext'
import { SettingsProvider } from '@/contexts/settingsContext'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const wrapper = ({ children }: PropsWithChildren) => (
  <SettingsProvider>
    <AudioPlayerContextProvider>{children}</AudioPlayerContextProvider>
  </SettingsProvider>
)

describe('SettingsPage', () => {
  beforeEach(() => {
    push.mockClear()
    localStorage.clear()
  })

  it('renders the default settings', () => {
    render(<SettingsPage />, { wrapper })

    expect(screen.getByLabelText(/enable screen lock/i)).toBeChecked()
    expect(screen.getByLabelText(/mute all audio/i)).not.toBeChecked()
  })

  it('toggling a switch and saving persists the change and navigates home', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper })

    await user.click(screen.getByLabelText(/mute all audio/i))
    expect(screen.getByLabelText(/mute all audio/i)).toBeChecked()

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(push).toHaveBeenCalledWith('/')
    expect(JSON.parse(localStorage.getItem('settings')!)).toMatchObject({
      muteAudio: true,
    })
  })

  it('the Test button next to the POI notification setting plays a preview', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper })

    const playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined)

    await user.click(screen.getByRole('button', { name: /test/i }))

    expect(playSpy).toHaveBeenCalled()
  })

  it('the Cancel button links back home without saving', async () => {
    render(<SettingsPage />, { wrapper })

    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/',
    )
  })
})

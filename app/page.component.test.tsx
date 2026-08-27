import Home from '@/app/page'
import { AudioPlayerContextProvider } from '@/contexts/audioPlayerContext'
import { SettingsProvider } from '@/contexts/settingsContext'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-screen-wake-lock', () => ({
  useWakeLock: () => ({
    request: vi.fn(),
    release: vi.fn(),
    released: true,
    isSupported: false,
  }),
}))

const wrapper = () => (
  <SettingsProvider>
    <AudioPlayerContextProvider>
      <Home />
    </AudioPlayerContextProvider>
  </SettingsProvider>
)

describe('Home', () => {
  let playSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts paused, showing a Start button and no phase badge', () => {
    render(wrapper())

    expect(
      screen.getByRole('button', { name: 'Start timer' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('00:00').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Point of information' }),
    ).toBeDisabled()
  })

  it('starting the timer immediately shows the protected-start phase', () => {
    render(wrapper())

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))

    expect(
      screen.getByRole('button', { name: 'Pause timer' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Protected')).toBeInTheDocument()
  })

  it('transitions to unprotected after the protected-start window and plays the bell', () => {
    render(wrapper())
    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))
    playSpy.mockClear()

    act(() => {
      vi.advanceTimersByTime(61_000)
    })

    expect(screen.getByText('Unprotected')).toBeInTheDocument()
    expect(playSpy).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Point of information' }),
    ).not.toBeDisabled()
  })

  it('allows starting and stopping a POI while unprotected', () => {
    render(wrapper())
    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))
    act(() => {
      vi.advanceTimersByTime(61_000)
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Point of information' }),
    )
    expect(
      screen.getByRole('button', { name: 'Stop point of information' }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Stop point of information' }),
    )
    expect(
      screen.getByRole('button', { name: 'Point of information' }),
    ).toBeInTheDocument()
  })

  it('soft-pauses into preparation time and can be stopped from there', () => {
    render(wrapper())
    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))
    act(() => {
      vi.advanceTimersByTime(61_000)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pause timer' }))

    expect(screen.getByText('Preparation time')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Stop timer' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Stop timer' }))
    expect(
      screen.getByRole('button', { name: 'Start timer' }),
    ).toBeInTheDocument()
  })

  it('switching speech type while running keeps the timer running', () => {
    render(wrapper())
    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))
    act(() => {
      vi.advanceTimersByTime(5_000)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Half (3.5 min)' }))

    expect(
      screen.getByRole('button', { name: 'Pause timer' }),
    ).toBeInTheDocument()
  })

  it('switching speech type while idle resets and reselects it', () => {
    render(wrapper())

    fireEvent.click(screen.getByRole('button', { name: 'Rebuttal (1 min)' }))

    expect(
      screen.getByRole('button', { name: 'Rebuttal (1 min)' }),
    ).toHaveAttribute('data-slot', 'button')
    expect(
      screen.getByRole('button', { name: 'Start timer' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('00:00').length).toBeGreaterThan(0)
  })

  it('shows the second-deduction wheel only while the timer is running', () => {
    render(wrapper())

    expect(screen.queryByText('Deduct')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))

    expect(screen.getByText('Deduct')).toBeInTheDocument()
  })

  it('shows a mute indicator that toggles the mute setting', () => {
    render(wrapper())

    expect(
      screen.getByRole('button', { name: 'Mute audio' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mute audio' }))

    expect(
      screen.getByRole('button', { name: 'Unmute audio' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Unmute audio' }))

    expect(
      screen.getByRole('button', { name: 'Mute audio' }),
    ).toBeInTheDocument()
  })
})

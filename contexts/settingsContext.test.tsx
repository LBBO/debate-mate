import {
  SettingsProvider,
  useSettings,
  useUpdateSettings,
} from '@/contexts/settingsContext'
import { act, render, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const wrapper = ({ children }: PropsWithChildren) => (
  <SettingsProvider>{children}</SettingsProvider>
)

const useSettingsPair = () => ({
  settings: useSettings(),
  updateSettings: useUpdateSettings(),
})

describe('SettingsProvider / useSettings / useUpdateSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('throws when useSettings is used outside a provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useSettings())).toThrow(
      'useSettings must be used within a SettingsProvider',
    )

    consoleError.mockRestore()
  })

  it('throws when useUpdateSettings is used outside a provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useUpdateSettings())).toThrow(
      'useUpdateSettings must be used within a SettingsProvider',
    )

    consoleError.mockRestore()
  })

  it('rejects nested providers', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <SettingsProvider>
          <SettingsProvider>child</SettingsProvider>
        </SettingsProvider>,
      ),
    ).toThrow('SettingsProvider already exists in the component tree')

    consoleError.mockRestore()
  })

  it('starts with the default settings when localStorage is empty', () => {
    const { result } = renderHook(() => useSettingsPair(), { wrapper })

    expect(result.current.settings).toEqual({
      enableScreenLock: true,
      endOfPoiNotification: 'sound',
      muteAudio: false,
    })
  })

  it('loads persisted settings from localStorage on mount', async () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        enableScreenLock: false,
        endOfPoiNotification: 'alert',
        muteAudio: true,
      }),
    )

    const { result } = renderHook(() => useSettingsPair(), { wrapper })

    await waitFor(() =>
      expect(result.current.settings.enableScreenLock).toBe(false),
    )
    expect(result.current.settings).toEqual({
      enableScreenLock: false,
      endOfPoiNotification: 'alert',
      muteAudio: true,
    })
  })

  it('merges partial updates and persists them to localStorage', () => {
    const { result } = renderHook(() => useSettingsPair(), { wrapper })

    act(() => result.current.updateSettings({ muteAudio: true }))

    expect(result.current.settings).toEqual({
      enableScreenLock: true,
      endOfPoiNotification: 'sound',
      muteAudio: true,
    })
    expect(JSON.parse(localStorage.getItem('settings')!)).toEqual({
      enableScreenLock: true,
      endOfPoiNotification: 'sound',
      muteAudio: true,
    })
  })
})

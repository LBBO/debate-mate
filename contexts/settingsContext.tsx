'use client'

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

export type Settings = {
  enableScreenLock: boolean
  endOfPoiNotification: 'sound' | 'alert'
  muteAudio: boolean
}

const defaultSettings: Settings = {
  enableScreenLock: true,
  endOfPoiNotification: 'sound' as 'sound' | 'alert',
  muteAudio: false,
}

const context = createContext<{
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
} | null>(null)

const localStorageKey = 'settings'

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  // Ensure there's only ever one settings provider in the app
  if (useContext(context) !== null) {
    throw new Error('SettingsProvider already exists in the component tree')
  }

  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    const fromLocalStorage = localStorage.getItem(localStorageKey)
    if (fromLocalStorage !== null) {
      // We only call this on mount, so it's fine
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(JSON.parse(fromLocalStorage))
    }
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem(localStorageKey, JSON.stringify(updatedSettings))
  }

  return (
    <context.Provider value={{ settings, updateSettings }}>
      {children}
    </context.Provider>
  )
}

export const useSettings = () => {
  const contextValue = useContext(context)
  if (contextValue === null) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return contextValue.settings
}

export const useUpdateSettings = () => {
  const contextValue = useContext(context)
  if (contextValue === null) {
    throw new Error('useUpdateSettings must be used within a SettingsProvider')
  }
  return contextValue.updateSettings
}

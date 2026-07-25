'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSettings, useUpdateSettings } from '@/contexts/settingsContext'
import { useAppForm } from '@/hooks/form'
import { useEndOfPoiNotification } from '@/hooks/useEndOfPoiNotification'
import {
  ChevronLeftIcon,
  LockIcon,
  MessageCircleQuestionMarkIcon,
  PlayIcon,
  SirenIcon,
  SpeakerIcon,
  VolumeXIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'

const poiNotificationOptions = [
  {
    value: 'sound',
    render: (
      <>
        <SpeakerIcon /> Sound notification
      </>
    ),
  },
  {
    value: 'alert',
    render: (
      <>
        <SirenIcon /> Visual alert
      </>
    ),
  },
] as const

export default function SettingsPage() {
  const router = useRouter()
  const { isSupported } = useWakeLock()
  // `isSupported` reads `navigator.wakeLock` directly, which isn't available
  // during SSR. Deferring it to a client-only state avoids a hydration
  // mismatch between the server render (unsupported) and the first client
  // render (supported).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // We only call this on mount, so it's fine
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  const screenLockSupported = !mounted || isSupported
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const demoPoiNotification = useEndOfPoiNotification()

  const form = useAppForm({
    defaultValues: settings,
    onSubmit: ({ value }) => {
      updateSettings(value)
      router.push('/')
    },
  })

  const enableScreenLockInputId = useId()
  const endOfPoiNotificationInputId = useId()
  const muteAudioInputId = useId()

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-6 p-8">
      <Button asChild variant="outline" className="w-fit">
        <Link href="/">
          <ChevronLeftIcon />
          Back
        </Link>
      </Button>

      <section className="grid gap-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          These settings are saved locally on your device.
        </p>
      </section>

      <form.AppForm>
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor={enableScreenLockInputId} className="font-medium">
                <LockIcon size={16} />
                Enable screen lock
              </Label>
              <p className="text-muted-foreground text-sm">
                Prevent your screen from sleeping while the app is open.
              </p>
              {!screenLockSupported ? (
                <p className="text-sm text-red-700">
                  Screen lock is not available on your device.
                </p>
              ) : null}
            </div>
            <form.AppField name="enableScreenLock">
              {(field) => (
                <field.Switch
                  id={enableScreenLockInputId}
                  disabled={!screenLockSupported}
                />
              )}
            </form.AppField>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label
                htmlFor={endOfPoiNotificationInputId}
                className="font-medium"
              >
                <MessageCircleQuestionMarkIcon size={16} />
                End of POI notification
              </Label>

              <form.Subscribe
                selector={(state) => state.values.endOfPoiNotification}
              >
                {(type) => (
                  <Button
                    variant="outline"
                    className="bg-secondary text-secondary-foreground outline-secondary-foreground"
                    size="sm"
                    onClick={(event) => {
                      event.preventDefault()
                      demoPoiNotification(type)
                    }}
                  >
                    <PlayIcon />
                    Test
                  </Button>
                )}
              </form.Subscribe>
            </div>
            <form.AppField name="endOfPoiNotification">
              {(field) => (
                <field.Select>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {poiNotificationOptions.map((option) => (
                      <SelectItem value={option.value} key={option.value}>
                        {option.render}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </field.Select>
              )}
            </form.AppField>
            <p className="text-muted-foreground text-sm">
              Choose how you are notified when a POI ends.
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor={muteAudioInputId} className="font-medium">
                <VolumeXIcon size={16} />
                Mute all audio notifications
              </Label>
              <p className="text-muted-foreground text-sm">
                Disable all audio notifications. Useful when this timer is used
                for a speaker.
              </p>
            </div>
            <form.AppField name="muteAudio">
              {(field) => <field.Switch id={muteAudioInputId} />}
            </form.AppField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button asChild type="button" variant="outline">
            <Link href="/">Cancel</Link>
          </Button>
          <Button onClick={form.handleSubmit} disabled={!form.state.canSubmit}>
            Save
          </Button>
        </div>
      </form.AppForm>
    </main>
  )
}

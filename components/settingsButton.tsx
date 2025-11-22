import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { IconButton } from '@/components/ui/shadcn-io/icon-button'
import { useSettings, useUpdateSettings } from '@/contexts/settingsContext'
import { useAppForm } from '@/hooks/form'
import { useEndOfPoiNotification } from '@/hooks/useEndOfPoiNotification'
import {
  LockIcon,
  MessageCircleQuestionMarkIcon,
  PlayIcon,
  SettingsIcon,
  SirenIcon,
  SpeakerIcon,
  VolumeXIcon,
} from 'lucide-react'
import * as React from 'react'
import { useId, useState } from 'react'
import { useWakeLock } from 'react-screen-wake-lock'

const poiNotificationOptions = [
  {
    value: 'sound',
    render: (
      <>
        <SpeakerIcon /> Sound Notification
      </>
    ),
  },
  {
    value: 'alert',
    render: (
      <>
        <SirenIcon /> Visual Alert
      </>
    ),
  },
]

export const SettingsButton = () => {
  const { isSupported } = useWakeLock()
  const [isOpen, setIsOpen] = useState(false)
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const demoPoiNotification = useEndOfPoiNotification()

  const form = useAppForm({
    defaultValues: settings,
    onSubmit: ({ value }) => {
      updateSettings(value)
      setIsOpen(false)
    },
  })

  const enableScreenLockInputId = useId()
  const endOfPoiNotificationInputId = useId()
  const muteAudioInputId = useId()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <IconButton
          icon={SettingsIcon}
          color={[64, 64, 64]}
          className="bg-neutral-200"
          size="lg"
        />
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] lg:max-w-md">
        <form.AppForm>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              These settings will be saved locally on you device.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor={enableScreenLockInputId}
                  className="font-medium"
                >
                  <LockIcon size={16} />
                  Enable screen lock
                </Label>
                <p className="text-muted-foreground text-sm">
                  Prevents your screen from going to sleep while the app is
                  open.
                </p>
                {!isSupported ? (
                  <p className="text-sm text-red-700">
                    Screen lock is not available on your device
                  </p>
                ) : null}
              </div>
              <form.AppField name="enableScreenLock">
                {(field) => (
                  <field.Switch
                    id={enableScreenLockInputId}
                    disabled={!isSupported}
                  />
                )}
              </form.AppField>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex gap-2">
                <Label
                  htmlFor={endOfPoiNotificationInputId}
                  className="font-medium"
                >
                  <MessageCircleQuestionMarkIcon size={16} />
                  End of POI Notification
                </Label>

                <form.Subscribe
                  selector={(state) => state.values.endOfPoiNotification}
                >
                  {(type) => (
                    <Button
                      variant="outline"
                      className="bg-secondary text-secondary-foreground outline-secondary-foreground"
                      size="sm"
                      onClick={() => demoPoiNotification(type)}
                    >
                      <PlayIcon /> Test
                    </Button>
                  )}
                </form.Subscribe>
              </div>
              <form.AppField name="endOfPoiNotification">
                {(field) => (
                  <field.Select>
                    <SelectTrigger className="w-full">
                      <SelectValue></SelectValue>
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
                How would you like to be notified when a POI ends?
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <Label htmlFor={muteAudioInputId} className="font-medium">
                  <VolumeXIcon size={16} />
                  Mute all audio notifications
                </Label>
                <p className="text-muted-foreground text-sm">
                  Disables all audio notifications. Useful for using the timer
                  as a speaker instead of a juror.
                </p>
              </div>
              <form.AppField name="muteAudio">
                {(field) => <field.Switch id={muteAudioInputId} />}
              </form.AppField>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={form.handleSubmit}
              disabled={!form.state.canSubmit}
            >
              Save
            </Button>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}

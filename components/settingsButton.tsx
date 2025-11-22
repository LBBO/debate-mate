import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { useAppForm } from '@/hooks/form'
import { PlayIcon, SettingsIcon, SirenIcon, SpeakerIcon } from 'lucide-react'
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

  const form = useAppForm({
    defaultValues: {
      enableScreenLock: true,
      endOfPoiNotification: 'sound',
    },
  })

  const enableScreenLockInputId = useId()
  const endOfPoiNotificationInputId = useId()

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
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <form.AppForm>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor={enableScreenLockInputId}
                  className="font-medium"
                >
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
                  End of POI Notification
                </Label>

                <Button
                  variant="outline"
                  className="bg-secondary text-secondary-foreground outline-secondary-foreground"
                  size="sm"
                >
                  <PlayIcon size={2} /> Test
                </Button>
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
          </div>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}

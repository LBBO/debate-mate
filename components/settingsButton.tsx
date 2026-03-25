import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconButton } from '@/components/ui/shadcn-io/icon-button'
import {
  EllipsisVerticalIcon,
  EyeIcon,
  ScaleIcon,
  SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'

export const SettingsButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          icon={EllipsisVerticalIcon}
          color={[64, 64, 64]}
          className="bg-neutral-200"
          size="lg"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/demo">
            <EyeIcon />
            Demo
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/licences">
            <ScaleIcon />
            Licenses
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

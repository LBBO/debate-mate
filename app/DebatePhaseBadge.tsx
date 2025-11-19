import { DebatePhase } from '@/app/debatePhase'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { P, match } from '@gabriel/ts-pattern'
import {
  AlarmClockIcon,
  CheckIcon,
  EarOffIcon,
  ShieldAlertIcon,
} from 'lucide-react'

export const DebatePhaseBadge = ({
  currentPhase,
}: {
  currentPhase?: DebatePhase
}) => {
  if (currentPhase === undefined) {
    return (
      <Badge className="invisible bg-transparent text-3xl text-transparent">
        Paused
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        'text-3xl [&>svg]:size-6',
        match(currentPhase)
          .with('unprotected', () => 'bg-emerald-800 text-white')
          .with(
            P.union('protected-start', 'protected-end'),
            () => 'bg-amber-300 text-slate-900',
          )
          .with('grace-period', () => 'bg-amber-400 text-slate-900')
          .with('ended', () => 'bg-red-700 text-white')
          .exhaustive(),
      )}
    >
      {match(currentPhase)
        .with(P.union('protected-start', 'protected-end'), () => (
          <>
            <ShieldAlertIcon />
            Protected
          </>
        ))
        .with(P.union('unprotected'), () => (
          <>
            <CheckIcon />
            Unprotected
          </>
        ))
        .with('grace-period', () => (
          <>
            <AlarmClockIcon />
            Grace period
          </>
        ))
        .with('ended', () => (
          <>
            <EarOffIcon />
            OVER
          </>
        ))
        .exhaustive()}
    </Badge>
  )
}

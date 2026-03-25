'use client'

import { DebatePhase } from '../debatePhase'
import { DebatePhaseBadge } from '@/app/DebatePhaseBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAudio } from '@/contexts/audioPlayerContext'
import { cn } from '@/lib/utils'
import { P, match } from '@gabriel/ts-pattern'
import {
  AlarmClockIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  MessageCircleQuestionMarkIcon,
  PlayIcon,
} from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

type OtherPhase = 'preparation-time' | 'poi'

const ExtendedBadge = ({
  currentPhase,
  className,
}: {
  currentPhase: OtherPhase | DebatePhase
  className?: string
}) => {
  if (currentPhase === 'preparation-time') {
    return (
      <Badge
        className={cn(
          'bg-slate-500 text-3xl text-white [&>svg]:size-6',
          className,
        )}
      >
        <AlarmClockIcon />
        Preparation time
      </Badge>
    )
  }
  if (currentPhase === 'poi') {
    return (
      <Badge
        variant="secondary"
        className={cn('text-3xl [&>svg]:size-6', className)}
      >
        <MessageCircleQuestionMarkIcon />
        POI
      </Badge>
    )
  }
  return <DebatePhaseBadge currentPhase={currentPhase} className={className} />
}

const soundDemos = [
  {
    key: 'bell',
    title: 'End & Beginning of Protected Time',
    description:
      'Played when protected time ends and when protected time starts again near the end.',
    when: ['protected-start', 'unprotected'],
  },
  {
    key: 'regularTimeOver',
    title: 'End of regular time',
    description:
      'Played when regular speech time is over and grace period starts.',
    when: ['protected-end', 'grace-period'],
  },
  {
    key: 'completelyOver',
    title: 'End of grace period',
    description:
      'Played when the grace period ends and the jury is no longer listening.',
    when: ['grace-period', 'ended'],
  },
  {
    key: 'friendlyReminder',
    title: 'End of preparation time',
    description:
      'Played when the preparation time ends and the next speaker must start.',
    when: 'preparation-time',
  },
  {
    key: 'endOfPoi',
    title: 'End of POI',
    description: 'Played when a POI timer reaches its limit.',
    when: 'poi',
  },
] as const satisfies ReadonlyArray<{
  key:
    | 'bell'
    | 'regularTimeOver'
    | 'friendlyReminder'
    | 'completelyOver'
    | 'endOfPoi'
  title: string
  description: string
  when: OtherPhase | [OtherPhase | DebatePhase, DebatePhase]
}>

export default function DemoPage() {
  const { activateAudio, playAudio } = useAudio()

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-8">
      <Button asChild variant="outline" className="w-fit">
        <Link href="/">
          <ChevronLeftIcon />
          Back
        </Link>
      </Button>

      <section className="grid gap-1">
        <h1 className="text-2xl font-semibold">Sound Demo</h1>
        <p className="text-muted-foreground text-sm">
          Tap each button to preview the exact sounds used by the timer.
        </p>
      </section>

      <section className="grid gap-3">
        {soundDemos.map((sound) => (
          <article
            key={sound.key}
            className="grid gap-3 rounded-lg border border-slate-200 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-medium">{sound.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {match(sound.when)
                .with(P.string, (phase) => (
                  <ExtendedBadge currentPhase={phase} className="text-xs" />
                ))
                .with(P.array(P._), (phases) => (
                  <>
                    <ExtendedBadge
                      currentPhase={phases[0]}
                      className="text-xs"
                    />
                    <ArrowRightIcon />
                    <DebatePhaseBadge
                      currentPhase={phases[1]}
                      className="text-xs"
                    />
                  </>
                ))
                .exhaustive()}
            </div>
            <p className="text-muted-foreground text-sm">{sound.description}</p>
            <Button
              onClick={() => {
                activateAudio()
                playAudio(sound.key, true)
              }}
            >
              <PlayIcon />
              Play
            </Button>
          </article>
        ))}
      </section>
    </main>
  )
}

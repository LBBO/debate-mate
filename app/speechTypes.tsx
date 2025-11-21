import { EyeIcon } from 'lucide-react'
import { ReactNode } from 'react'

const secondsPerMinute = 60

export type SpeechType = {
  name: ReactNode
  shortName: ReactNode
  timeLimits: {
    totalRegularTime: number // in seconds
    protectedStart: number // in seconds
    protectedEnd: number // in seconds
    gracePeriod: number // in seconds
  }
}

export const speechTypes = {
  normal: {
    name: 'British Parliamentary',
    shortName: 'Normal (7 min)',
    timeLimits: {
      totalRegularTime: 7 * secondsPerMinute,
      protectedStart: 1 * secondsPerMinute,
      protectedEnd: 1 * secondsPerMinute,
      gracePeriod: 15,
    },
  },
  half: {
    name: 'Open Parliamentary Debate',
    shortName: 'Half (3.5 min)',
    timeLimits: {
      totalRegularTime: 3.5 * secondsPerMinute,
      protectedStart: 0.5 * secondsPerMinute,
      protectedEnd: 0.5 * secondsPerMinute,
      gracePeriod: 15,
    },
  },
  demo: {
    name: 'Soundcheck',
    shortName: (
      <>
        <EyeIcon /> Demo
      </>
    ),
    timeLimits: {
      totalRegularTime: 7,
      protectedStart: 1,
      protectedEnd: 3,
      gracePeriod: 3,
    },
  },
} satisfies Record<string, SpeechType>

export type SpeechTypeKey = keyof typeof speechTypes

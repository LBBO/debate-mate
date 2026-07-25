import { speechTypes } from '@/app/speechTypes'
import { describe, expect, it } from 'vitest'

describe('speechTypes', () => {
  it.each(Object.entries(speechTypes))(
    '%s has non-negative time limits',
    (_key, type) => {
      Object.values(type.timeLimits).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0)
      })
    },
  )

  it.each(Object.entries(speechTypes))(
    '%s never protects longer than the total regular time',
    (_key, type) => {
      const { protectedStart, protectedEnd, totalRegularTime } = type.timeLimits
      expect(protectedStart + protectedEnd).toBeLessThanOrEqual(
        totalRegularTime,
      )
    },
  )
})

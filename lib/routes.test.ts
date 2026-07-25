import { allRoutes } from '@/lib/routes'
import { describe, expect, it } from 'vitest'

describe('allRoutes', () => {
  it('includes the root route', () => {
    expect(allRoutes).toContain('/')
  })

  it('has no duplicate entries', () => {
    expect(new Set(allRoutes).size).toBe(allRoutes.length)
  })

  it('every route starts with a slash', () => {
    allRoutes.forEach((route) => expect(route.startsWith('/')).toBe(true))
  })
})

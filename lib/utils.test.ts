import { cn } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('resolves conflicting tailwind classes to the last one', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('supports the conditional-object form', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })
})

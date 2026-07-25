import { DebatePhaseBadge } from '@/app/DebatePhaseBadge'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('DebatePhaseBadge', () => {
  it('renders an invisible placeholder when there is no current phase', () => {
    render(<DebatePhaseBadge />)

    const badge = screen.getByText('Paused')
    expect(badge).toHaveClass('invisible')
  })

  it.each([
    ['protected-start', 'Protected'],
    ['unprotected', 'Unprotected'],
    ['protected-end', 'Protected'],
    ['grace-period', 'Grace period'],
    ['ended', 'OVER'],
  ] as const)('shows "%s" as "%s"', (phase, label) => {
    render(<DebatePhaseBadge currentPhase={phase} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('applies the passed-through className', () => {
    render(<DebatePhaseBadge currentPhase="unprotected" className="my-class" />)

    expect(screen.getByText('Unprotected')).toHaveClass('my-class')
  })
})

import { TimeDisplay } from '@/components/timeDisplay'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('TimeDisplay', () => {
  it('pads minutes and seconds to two digits', () => {
    render(<TimeDisplay minutes={5} seconds={3} />)

    expect(screen.getByText('05:03')).toBeInTheDocument()
  })

  it('shows the absolute value of negative seconds', () => {
    render(<TimeDisplay minutes={-1} seconds={-30} />)

    expect(screen.getByText('-1:30')).toBeInTheDocument()
  })

  it('applies the gray variant styling', () => {
    render(<TimeDisplay minutes={0} seconds={0} variant="gray" />)

    expect(screen.getByText('00:00')).toHaveClass('text-slate-500')
  })
})

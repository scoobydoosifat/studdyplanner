import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressChart from './ProgressChart.jsx'

const day = (date, total, completed) => ({ date, total, completed, plannedMinutes: total * 45 })

describe('ProgressChart', () => {
  it('shows an empty state without daily data', () => {
    render(<ProgressChart summary={null} />)

    expect(screen.getByText(/momentum chart blooms/i)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders one bar per week day and labels the chart', () => {
    const { container } = render(
      <ProgressChart summary={{
        dailyProgress: [
          day('2026-11-02', 2, 1),
          day('2026-11-03', 4, 4),
          day('2026-11-04', 0, 0),
        ],
      }} />,
    )

    expect(screen.getByRole('img', { name: /daily completed cards/i })).toBeInTheDocument()
    expect(container.querySelectorAll('.bar-column')).toHaveLength(3)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('caps a month of data at seven sampled bars', () => {
    const dailyProgress = Array.from({ length: 30 }, (_, index) =>
      day(`2026-11-${String(index + 1).padStart(2, '0')}`, 1, index % 2))

    const { container } = render(<ProgressChart summary={{ dailyProgress }} />)

    expect(container.querySelectorAll('.bar-column')).toHaveLength(7)
  })

  it('fills the completed portion of each bar', () => {
    const { container } = render(
      <ProgressChart summary={{ dailyProgress: [day('2026-11-02', 4, 2)] }} />,
    )

    const fill = container.querySelector('.bar-track b')
    expect(fill).toHaveStyle({ height: '50%' })
  })
})

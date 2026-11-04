import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calendar from './Calendar.jsx'

const task = (date, completed) => ({
  id: `${date}-${completed}`, title: 'Task', subject: 'Math', date,
  startTime: '18:00:00', durationMinutes: 45, priority: 'HIGH', completed,
})

const renderCalendar = (overrides = {}) => {
  const onSelect = vi.fn()
  const utils = render(
    <Calendar
      month={10}
      tasks={[task('2026-11-05', true), task('2026-11-05', false), task('2026-11-07', true)]}
      selectedDate="2026-11-05"
      today="2026-11-05"
      onSelect={onSelect}
      {...overrides}
    />,
  )
  return { ...utils, onSelect }
}

describe('Calendar', () => {
  it('renders every day of the selected month with Monday-first weekdays', () => {
    const { container } = renderCalendar()
    expect(container.querySelectorAll('.day')).toHaveLength(30)
    ;['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('renders December with 31 days', () => {
    const { container } = renderCalendar({ month: 11 })
    expect(container.querySelectorAll('.day')).toHaveLength(31)
  })

  it('describes card counts and completion per day', () => {
    renderCalendar()
    expect(screen.getByRole('button', { name: 'November 5, 2 cards, 1 flipped' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'November 7, 1 card, all flipped' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'November 4, no cards' })).toBeInTheDocument()
  })

  it('marks the selected and today cells', () => {
    renderCalendar()
    const selected = screen.getByRole('button', { name: 'November 5, 2 cards, 1 flipped' })
    expect(selected).toHaveAttribute('aria-pressed', 'true')
    expect(selected).toHaveAttribute('aria-current', 'date')
    expect(selected).toHaveClass('selected', 'today')
  })

  it('only marks days with every card flipped as complete', () => {
    const { container } = renderCalendar()
    expect(screen.getByRole('button', { name: 'November 7, 1 card, all flipped' })).toHaveClass('complete')
    expect(container.querySelectorAll('.day.complete')).toHaveLength(1)
  })

  it('reports the chosen ISO date', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderCalendar()

    await user.click(screen.getByRole('button', { name: 'November 12, no cards' }))

    expect(onSelect).toHaveBeenCalledWith('2026-11-12')
  })

  it('renders leading blanks for the weekday offset', () => {
    const { container } = renderCalendar()
    expect(container.querySelectorAll('.blank')).toHaveLength(6)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskCard from './TaskCard.jsx'

const baseTask = {
  id: 'task-1', title: 'Practice algebra', subject: 'Mathematics', date: '2026-11-05',
  startTime: '18:00:00', durationMinutes: 45, priority: 'HIGH', notes: 'Chapter 3', completed: false,
}

const renderCard = (overrides = {}) => {
  const handlers = { onToggle: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() }
  const task = { ...baseTask, ...overrides }
  const utils = render(<TaskCard task={task} accent="violet" index={0} {...handlers} />)
  return { ...handlers, ...utils }
}

describe('TaskCard', () => {
  it('shows the card details', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'Practice algebra' })).toBeInTheDocument()
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('Chapter 3')).toBeInTheDocument()
    expect(screen.getByText(/6:00 PM/)).toBeInTheDocument()
    expect(screen.getByText('45m of focus')).toBeInTheDocument()
  })

  it('uses the accent class for the subject colour', () => {
    const { container } = render(
      <TaskCard task={baseTask} accent="cyan" index={2} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(container.querySelector('.task-card')).toHaveClass('accent-cyan')
    expect(container.querySelector('.task-index')).toHaveTextContent('03')
  })

  it('toggles completion from the check button', async () => {
    const user = userEvent.setup()
    const { onToggle } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Mark task done' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders a completed card as flipped', () => {
    const { container } = renderCard({ completed: true })

    expect(container.querySelector('.task-card')).toHaveClass('completed')
    expect(screen.getByRole('button', { name: 'Mark task pending' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('opens the actions menu and edits the card', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Card actions' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: /edit card/i }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens the actions menu and requests removal', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Card actions' }))
    await user.click(screen.getByRole('menuitem', { name: /remove/i }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('hides the notes row when there is no note', () => {
    renderCard({ notes: null })
    expect(screen.queryByText('Chapter 3')).not.toBeInTheDocument()
  })
})

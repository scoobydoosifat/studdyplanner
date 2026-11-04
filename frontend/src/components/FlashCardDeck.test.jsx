import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FlashCardDeck from './FlashCardDeck.jsx'

const existingTask = {
  id: 'task-1', title: 'Practice algebra', subject: 'Mathematics', date: '2026-11-05',
  startTime: '18:00:00', durationMinutes: 45, priority: 'HIGH', notes: 'Chapter 3', completed: false,
}

const setup = (task = { date: '2026-11-05' }) => {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const utils = render(<FlashCardDeck task={task} onSave={onSave} onClose={onClose} />)
  return { ...utils, onSave, onClose }
}

const advance = async user => user.click(screen.getByRole('button', { name: /continue/i }))

describe('FlashCardDeck', () => {
  it('opens on the intent step with the continue button locked', () => {
    setup()

    expect(screen.getByRole('heading', { name: 'What deserves your focus?' })).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    expect(screen.getByText('Add a title and subject to continue')).toBeInTheDocument()
  })

  it('unlocks once a title and subject exist', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByLabelText('What will you focus on?'), 'Revise optics')
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Physics' }))

    expect(screen.getByLabelText('Subject')).toHaveValue('Physics')
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
    expect(screen.queryByText('Add a title and subject to continue')).not.toBeInTheDocument()
  })

  it('walks all four steps and saves a trimmed payload', async () => {
    const user = userEvent.setup()
    const { onSave } = setup()

    await user.type(screen.getByLabelText('What will you focus on?'), '  Revise optics  ')
    await user.type(screen.getByLabelText('Subject'), 'Physics')
    await advance(user)

    expect(screen.getByRole('heading', { name: 'When will you sit down?' })).toBeInTheDocument()
    await advance(user)

    expect(screen.getByRole('heading', { name: 'How big is the block?' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '1 hour' }))
    await user.click(screen.getByRole('radio', { name: 'High priority' }))
    await advance(user)

    expect(screen.getByRole('heading', { name: 'Flip it and commit.' })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/little note/i), '  Chapter 4 — lenses  ')
    await user.click(screen.getByRole('button', { name: /add to my deck/i }))

    expect(onSave).toHaveBeenCalledWith({
      title: 'Revise optics',
      subject: 'Physics',
      date: '2026-11-05',
      startTime: '18:00',
      durationMinutes: 60,
      priority: 'HIGH',
      notes: 'Chapter 4 — lenses',
    })
  })

  it('keeps entered values when stepping back', async () => {
    const user = userEvent.setup()
    const { container } = setup()

    await user.type(screen.getByLabelText('What will you focus on?'), 'Revise optics')
    await user.click(screen.getByRole('button', { name: 'Physics' }))
    await advance(user)
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByLabelText('What will you focus on?')).toHaveValue('Revise optics')
    expect(screen.getByLabelText('Subject')).toHaveValue('Physics')
    expect(container.querySelector('.deck-card')).toHaveClass('back')
  })

  it('constrains the date field to the planner window', () => {
    setup()
    const user = userEvent.setup()
    return user.click(screen.getByRole('button', { name: 'Physics' }))
      .then(() => user.type(screen.getByLabelText('What will you focus on?'), 'Optics'))
      .then(() => advance(user))
      .then(() => {
        const date = screen.getByLabelText('Study date')
        expect(date).toHaveAttribute('min', '2026-11-01')
        expect(date).toHaveAttribute('max', '2026-12-31')
        expect(date).toHaveValue('2026-11-05')
      })
  })

  it('flips the preview card back and forth', async () => {
    const user = userEvent.setup()
    const { container } = setup()

    await user.type(screen.getByLabelText('What will you focus on?'), 'Revise optics')
    await user.click(screen.getByRole('button', { name: 'Physics' }))
    await advance(user)
    await advance(user)
    await advance(user)

    const toggle = screen.getByRole('button', { name: /flip the card/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)

    expect(screen.getByRole('button', { name: /show details/i })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.flip-card')).toHaveClass('is-flipped')

    await user.click(screen.getByRole('button', { name: /show details/i }))
    expect(container.querySelector('.flip-card')).not.toHaveClass('is-flipped')
  })

  it('prefills an existing card and saves changes', async () => {
    const user = userEvent.setup()
    const { onSave } = setup(existingTask)

    expect(screen.getByText('Edit focus card')).toBeInTheDocument()
    expect(screen.getByLabelText('What will you focus on?')).toHaveValue('Practice algebra')
    expect(screen.getByLabelText('Subject')).toHaveValue('Mathematics')

    await advance(user)
    expect(screen.getByLabelText('Study date')).toHaveValue('2026-11-05')
    expect(screen.getByLabelText('Start time')).toHaveValue('18:00')
    await advance(user)
    await advance(user)

    expect(screen.getByLabelText(/little note/i)).toHaveValue('Chapter 3')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Practice algebra',
      subject: 'Mathematics',
      startTime: '18:00',
      priority: 'HIGH',
      notes: 'Chapter 3',
    }))
  })

  it('sends null when the optional note is blank', async () => {
    const user = userEvent.setup()
    const { onSave } = setup()

    await user.type(screen.getByLabelText('What will you focus on?'), 'Read poetry')
    await user.type(screen.getByLabelText('Subject'), 'English')
    await advance(user)
    await advance(user)
    await advance(user)
    await user.click(screen.getByRole('button', { name: /add to my deck/i }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ notes: null }))
  })

  it('closes from the close button, the cancel button and the Escape key', async () => {
    const user = userEvent.setup()
    const { onClose } = setup()

    await user.click(screen.getByRole('button', { name: 'Close deck' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('reports progress through the step counter', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByLabelText('What will you focus on?'), 'Read poetry')
    await user.type(screen.getByLabelText('Subject'), 'English')

    await advance(user)
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
    await advance(user)
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument()
    await advance(user)
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument()
  })
})

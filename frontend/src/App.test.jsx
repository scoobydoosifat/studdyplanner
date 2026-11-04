import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import { plannerNow, summaryRange } from './lib/dates'

const { date: today, month: plannerMonth } = plannerNow()

const baseTask = {
  id: 'task-1', title: 'Practice vocabulary', subject: 'English', date: today,
  startTime: '18:00:00', durationMinutes: 45, priority: 'HIGH', notes: 'Chapter 3', completed: false,
}

const summary = {
  startDate: today, endDate: today, totalTasks: 1, completedTasks: 0,
  pendingTasks: 1, completionPercentage: 0, plannedMinutes: 45, completedMinutes: 0,
  studyStreak: 4, dailyProgress: [{ date: today, total: 1, completed: 0, plannedMinutes: 45 }],
  subjectProgress: [],
}

const response = (body, status = 200) => Promise.resolve({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
})

function mockBackend(initialTasks = [baseTask]) {
  let tasks = initialTasks.map(task => ({ ...task }))
  let counter = 0

  global.fetch = vi.fn((url, options = {}) => {
    const method = options.method || 'GET'
    const address = String(url)

    if (address.includes('/summary')) return response(summary)
    if (method === 'GET') return response(tasks)

    if (method === 'POST') {
      const task = { id: `new-${++counter}`, completed: false, ...JSON.parse(options.body) }
      tasks = [...tasks, task]
      return response(task, 201)
    }
    if (method === 'PUT') {
      const id = address.split('/').pop()
      const update = JSON.parse(options.body)
      tasks = tasks.map(task => task.id === id ? { ...task, ...update } : task)
      return response(tasks.find(task => task.id === id))
    }
    if (method === 'PATCH') {
      const parts = address.split('/')
      const id = parts[parts.length - 2]
      const { completed } = JSON.parse(options.body)
      tasks = tasks.map(task => task.id === id ? { ...task, completed } : task)
      return response(tasks.find(task => task.id === id))
    }
    if (method === 'DELETE') {
      const id = address.split('/').pop()
      tasks = tasks.filter(task => task.id !== id)
      return response(null, 204)
    }
    throw new Error(`Unexpected request: ${method} ${address}`)
  })

  return () => tasks
}

const deckStep = async (user, times = 1) => {
  for (let index = 0; index < times; index += 1) {
    await user.click(screen.getByRole('button', { name: /continue/i }))
  }
}

const enterPlanner = async user => {
  await user.click(screen.getByRole('button', { name: 'Planner' }))
}

describe('MahinPorteBosh dashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    window.history.replaceState(null, '', '#/home')
  })

  it('shows the deck loader, then today’s cards and summary', async () => {
    let release
    const pendingTasks = new Promise(resolve => {
      release = () => resolve({ ok: true, status: 200, json: () => Promise.resolve([baseTask]) })
    })
    global.fetch = vi.fn(url => String(url).includes('/summary') ? response(summary) : pendingTasks)

    render(<App />)

    expect(screen.getByText('Gathering your study cards…')).toBeInTheDocument()
    release()

    expect(await screen.findByRole('heading', { name: /make room for/i })).toBeInTheDocument()
    expect(screen.queryByText('Gathering your study cards…')).not.toBeInTheDocument()
    const user = userEvent.setup()
    await enterPlanner(user)
    expect(await screen.findByText('Practice vocabulary')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Progress' }))
    expect(screen.getByText('4 days')).toBeInTheDocument()
  })

  it('creates a task through the four flashcard steps', async () => {
    const getTasks = mockBackend([])
    const user = userEvent.setup()
    render(<App />)

    await enterPlanner(user)
    await screen.findByText('This card is blank')
    await user.click(screen.getByRole('button', { name: 'Draw a card' }))

    await user.type(screen.getByLabelText('What will you focus on?'), 'Friction notes')
    await user.click(screen.getByRole('button', { name: 'English' }))
    await deckStep(user, 2)

    await user.click(screen.getByRole('radio', { name: '1.5 hours' }))
    await user.click(screen.getByRole('radio', { name: 'High priority' }))
    await deckStep(user)

    await user.type(screen.getByLabelText(/little note/i), 'Chapter 5')
    await user.click(screen.getByRole('button', { name: /add to my deck/i }))

    await waitFor(() => expect(getTasks()).toHaveLength(1))

    const [, postCall] = global.fetch.mock.calls.find(([, options]) => options?.method === 'POST')
    expect(JSON.parse(postCall.body)).toEqual({
      title: 'Friction notes',
      subject: 'English',
      date: today,
      startTime: '18:00',
      durationMinutes: 90,
      priority: 'HIGH',
      notes: 'Chapter 5',
    })

    expect(await screen.findByText('Friction notes')).toBeInTheDocument()
    expect(screen.getByText('Your new study card is ready.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('marks a card complete and moves it back to pending', async () => {
    const getTasks = mockBackend()
    const user = userEvent.setup()
    render(<App />)

    await enterPlanner(user)
    await screen.findByText('Practice vocabulary')

    await user.click(screen.getByRole('button', { name: 'Mark task done' }))
    await waitFor(() => expect(getTasks()[0].completed).toBe(true))
    expect(await screen.findByRole('button', { name: 'Mark task pending' })).toBeInTheDocument()
    expect(screen.getByText('Lovely work — one gentle goal complete.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark task pending' }))
    await waitFor(() => expect(getTasks()[0].completed).toBe(false))
  })

  it('edits an existing card inside the deck', async () => {
    const getTasks = mockBackend()
    const user = userEvent.setup()
    render(<App />)

    await enterPlanner(user)
    await screen.findByText('Practice vocabulary')

    await user.click(screen.getByRole('button', { name: 'Card actions' }))
    await user.click(screen.getByRole('menuitem', { name: /edit card/i }))

    expect(screen.getByText('Edit focus card')).toBeInTheDocument()
    const title = screen.getByLabelText('What will you focus on?')
    await user.clear(title)
    await user.type(title, 'Master algebra')
    await deckStep(user, 3)

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Master algebra')).toBeInTheDocument()
    expect(getTasks()[0].title).toBe('Master algebra')
    expect(screen.getByText('Your card is beautifully updated.')).toBeInTheDocument()
  })

  it('requires confirmation, shows a loader and deletes the card', async () => {
    let tasks = [{ ...baseTask }]
    let releaseDelete
    const deleteRequest = new Promise(resolve => {
      releaseDelete = () => {
        tasks = []
        resolve({ ok: true, status: 204, json: () => Promise.resolve(null) })
      }
    })
    global.fetch = vi.fn((url, options = {}) => {
      if (String(url).includes('/summary')) return response(summary)
      if ((options.method || 'GET') === 'DELETE') return deleteRequest
      return response(tasks)
    })

    const user = userEvent.setup()
    render(<App />)
    await enterPlanner(user)
    await screen.findByText('Practice vocabulary')

    await user.click(screen.getByRole('button', { name: 'Card actions' }))
    await user.click(screen.getByRole('menuitem', { name: /remove/i }))

    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText('Remove this card?')).toBeInTheDocument()
    expect(within(dialog).getByText(/Practice vocabulary/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /yes, remove/i }))
    expect(screen.getByText('Tidying up your planner…')).toBeInTheDocument()

    releaseDelete()

    expect(await screen.findByText('This card is blank')).toBeInTheDocument()
    expect(screen.getByText('The card has been removed.')).toBeInTheDocument()
  })

  it('keeps the card when deletion is cancelled', async () => {
    mockBackend()
    const user = userEvent.setup()
    render(<App />)
    await enterPlanner(user)
    await screen.findByText('Practice vocabulary')

    await user.click(screen.getByRole('button', { name: 'Card actions' }))
    await user.click(screen.getByRole('menuitem', { name: /remove/i }))
    await user.click(screen.getByRole('button', { name: 'Keep it' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('Practice vocabulary')).toBeInTheDocument()
  })

  it('surfaces a backend error without losing the page', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    }))

    render(<App />)

    expect(await screen.findByText(/Is the backend running\?/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /make room for/i })).toBeInTheDocument()
  })

  it('switches months inside the planner window', async () => {
    mockBackend()
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    await enterPlanner(user)

    if (plannerMonth === 10) {
      expect(await screen.findByRole('heading', { name: 'November 2026' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Next month' }))
      expect(await screen.findByRole('heading', { name: 'December 2026' })).toBeInTheDocument()
      await waitFor(() => expect(
        global.fetch.mock.calls.some(([url]) => String(url).includes('start=2026-12-01')),
      ).toBe(true))
    } else {
      expect(await screen.findByRole('heading', { name: 'December 2026' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Previous month' }))
      expect(await screen.findByRole('heading', { name: 'November 2026' })).toBeInTheDocument()
      await waitFor(() => expect(
        global.fetch.mock.calls.some(([url]) => String(url).includes('start=2026-11-01')),
      ).toBe(true))
    }
  })

  it('reloads the summary when switching between week and month', async () => {
    mockBackend()
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: /make room for/i })
    await user.click(screen.getByRole('button', { name: 'Progress' }))

    const monthRange = summaryRange(today, 'month')
    await user.click(screen.getByRole('button', { name: 'Month' }))

    await waitFor(() => expect(
      global.fetch.mock.calls.some(([url]) => String(url).includes(
        `/summary?start=${monthRange.start}&end=${monthRange.end}`,
      )),
    ).toBe(true))
    expect(screen.getByRole('button', { name: 'Month' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('navigates between the landing, planner, progress and inspiration pages', async () => {
    mockBackend()
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('heading', { name: /make room for/i })).toBeInTheDocument()
    await enterPlanner(user)
    expect(screen.getByRole('heading', { name: /gentle plan/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Progress' }))
    expect(screen.getByRole('heading', { name: /progress, not/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Inspiration' }))
    expect(screen.getByRole('heading', { name: /words for the days/i })).toBeInTheDocument()
  })

  it('persists dark mode preference', async () => {
    mockBackend()
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('mahin-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })

  it('moves the study cat when approached', async () => {
    mockBackend()
    render(<App />)
    const cat = screen.getByRole('button', { name: /Mochi the study cat/i })
    expect(cat.style.getPropertyValue('--cat-x')).toContain('100vw')
    fireEvent.pointerEnter(cat)
    expect(cat.style.getPropertyValue('--cat-x')).toBe('24px')
  })
})

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Clock3, Flame, Plus, Sparkles, Target, X,
} from 'lucide-react'
import { api } from './lib/api'
import { accentFor } from './lib/palette'
import {
  PLANNER_MONTHS, PLANNER_YEAR, formatDate, formatMonth, minutesLabel,
  monthRange, plannerNow, summaryRange, todayIso,
} from './lib/dates'
import Logo from './components/Logo'
import Loader from './components/Loader'
import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import Calendar from './components/Calendar'
import ProgressChart from './components/ProgressChart'
import TaskCard from './components/TaskCard'
import EmptyDeck from './components/EmptyDeck'
import FlashCardDeck from './components/FlashCardDeck'
import DeleteDialog from './components/DeleteDialog'

const CUES = [
  'Focus is a muscle. One card at a time.',
  'Done beats perfect — flip the card.',
  'Twenty-five honest minutes outlast three distracted hours.',
]

function CueCard() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex(value => (value + 1) % CUES.length), 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <aside className="cue-card">
      <div className="cue-glow" aria-hidden="true" />
      <span className="cue-label">Today’s cue</span>
      <p key={index} className="cue-text">“{CUES[index]}”</p>
      <div className="cue-dots" aria-hidden="true">
        {CUES.map((cue, dot) => <i key={cue} className={dot === index ? 'on' : ''} />)}
      </div>
    </aside>
  )
}

export default function App() {
  const initial = useMemo(() => plannerNow(), [])
  const today = useMemo(() => todayIso(), [])

  const [month, setMonth] = useState(initial.month)
  const [selectedDate, setSelectedDate] = useState(initial.date)
  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState(null)
  const [summaryMode, setSummaryMode] = useState('week')
  const [loader, setLoader] = useState('Shuffling your focus deck…')
  const [notice, setNotice] = useState(null)
  const [deck, setDeck] = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)

  const runAction = useCallback(async (message, action) => {
    setLoader(message)
    setNotice(null)
    try {
      return await action()
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
      throw error
    } finally {
      setLoader(null)
    }
  }, [])

  const loadMonth = useCallback(async (targetMonth, quiet = false) => {
    const range = monthRange(targetMonth)
    if (!quiet) setLoader('Arranging your cards…')
    try {
      setTasks(await api(`/api/tasks?start=${range.start}&end=${range.end}`))
      setNotice(null)
    } catch (error) {
      setNotice({ type: 'error', text: `${error.message} Is the backend running?` })
    } finally {
      if (!quiet) setLoader(null)
    }
  }, [])

  useEffect(() => { loadMonth(month) }, [month, loadMonth])

  useEffect(() => {
    const { start, end } = summaryRange(selectedDate, summaryMode)
    let active = true
    api(`/api/tasks/summary?start=${start}&end=${end}`)
      .then(data => { if (active) setSummary(data) })
      .catch(() => { if (active) setSummary(null) })
    return () => { active = false }
  }, [selectedDate, summaryMode, tasks])

  const dayTasks = useMemo(
    () => tasks.filter(task => task.date === selectedDate),
    [tasks, selectedDate],
  )
  const completedToday = dayTasks.filter(task => task.completed).length
  const progress = dayTasks.length ? Math.round((completedToday * 100) / dayTasks.length) : 0
  const focusMinutes = dayTasks.reduce((sum, task) => sum + task.durationMinutes, 0)

  const changeMonth = direction => {
    const next = month + direction
    if (!PLANNER_MONTHS.includes(next)) return
    setMonth(next)
    setSelectedDate(`${PLANNER_YEAR}-${String(next + 1).padStart(2, '0')}-01`)
  }

  const saveTask = async form => {
    const editing = Boolean(deck?.id)
    try {
      await runAction(editing ? 'Updating your card…' : 'Dealing a fresh card…', () =>
        api(editing ? `/api/tasks/${deck.id}` : '/api/tasks', {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify(form),
        }))
      setDeck(null)
      await loadMonth(month, true)
      setNotice({
        type: 'success',
        text: editing ? 'Card updated — sharper already.' : 'New card dealt into your deck.',
      })
    } catch { /* runAction surfaces the error */ }
  }

  const toggleTask = async task => {
    try {
      await runAction(task.completed ? 'Returning the card to play…' : 'Flipping your card…', () =>
        api(`/api/tasks/${task.id}/completion`, {
          method: 'PATCH',
          body: JSON.stringify({ completed: !task.completed }),
        }))
      await loadMonth(month, true)
      setNotice({
        type: 'success',
        text: task.completed ? 'Card is back in play.' : 'Beautiful — one more card flipped.',
      })
    } catch { /* runAction surfaces the error */ }
  }

  const removeTask = async () => {
    if (!deleteTask) return
    try {
      await runAction('Removing the card…', () => api(`/api/tasks/${deleteTask.id}`, { method: 'DELETE' }))
      setDeleteTask(null)
      await loadMonth(month, true)
      setNotice({ type: 'success', text: 'Card removed from your deck.' })
    } catch { /* runAction surfaces the error */ }
  }

  return (
    <div className="app-shell">
      <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
      {loader && <Loader message={loader} />}

      <Sidebar onAdd={() => setDeck({ date: selectedDate })} />

      <main className="dashboard">
        <header className="mobile-header">
          <Logo compact />
          <button
            type="button"
            className="icon-button"
            aria-label="New focus card"
            onClick={() => setDeck({ date: selectedDate })}
          >
            <Plus />
          </button>
        </header>

        <section className="hero reveal">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={15} /> Your focus deck</p>
            <h1>Small cards.<br /><em>Big momentum.</em></h1>
            <p className="hero-sub">
              Every study session is a flashcard. Plan it, flip it, and watch your deck of wins grow.
            </p>
          </div>
          <CueCard />
        </section>

        {notice && (
          <div className={`notice ${notice.type}`} role="status" aria-live="polite">
            <span aria-hidden="true">{notice.type === 'success' ? '✓' : '!'}</span>
            <p>{notice.text}</p>
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)}><X size={15} /></button>
          </div>
        )}

        <section className="stats-grid reveal delay-1">
          <StatCard
            icon={<Target />}
            tone="violet"
            label="Today’s progress"
            value={`${progress}%`}
            detail={`${completedToday} of ${dayTasks.length} cards flipped`}
            progress={progress}
          />
          <StatCard
            icon={<Clock3 />}
            tone="cyan"
            label="Focus minutes"
            value={minutesLabel(focusMinutes)}
            detail="Planned for this day"
          />
          <StatCard
            icon={<Flame />}
            tone="amber"
            label="Current streak"
            value={`${summary?.studyStreak ?? 0} days`}
            detail="Keep the deck moving"
          />
        </section>

        <section className="planner-grid reveal delay-2">
          <div className="panel calendar-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Plan your days</p>
                <h2>{formatMonth(month)}</h2>
              </div>
              <div className="month-controls">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={month === PLANNER_MONTHS[0]}
                  aria-label="Previous month"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  disabled={month === PLANNER_MONTHS[PLANNER_MONTHS.length - 1]}
                  aria-label="Next month"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
            <Calendar
              month={month}
              tasks={tasks}
              selectedDate={selectedDate}
              today={today}
              onSelect={setSelectedDate}
            />
          </div>

          <div className="panel summary-panel">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow">Your rhythm</p>
                <h2>Momentum</h2>
              </div>
              <div className="segmented" role="group" aria-label="Summary range">
                <button
                  type="button"
                  className={summaryMode === 'week' ? 'active' : ''}
                  aria-pressed={summaryMode === 'week'}
                  onClick={() => setSummaryMode('week')}
                >
                  Week
                </button>
                <button
                  type="button"
                  className={summaryMode === 'month' ? 'active' : ''}
                  aria-pressed={summaryMode === 'month'}
                  onClick={() => setSummaryMode('month')}
                >
                  Month
                </button>
              </div>
            </div>
            <ProgressChart summary={summary} />
            <div className="summary-bottom">
              <div><span>Flipped</span><strong>{summary?.completedTasks ?? 0}</strong></div>
              <div><span>Focus time</span><strong>{minutesLabel(summary?.completedMinutes ?? 0)}</strong></div>
              <div><span>Success rate</span><strong>{summary?.completionPercentage ?? 0}%</strong></div>
            </div>
          </div>
        </section>

        <section className="tasks-section reveal delay-3">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Daily focus</p>
              <h2>{selectedDate === today ? 'Today’s deck' : formatDate(selectedDate)}</h2>
              <p>
                {dayTasks.length
                  ? `${dayTasks.length} card${dayTasks.length > 1 ? 's' : ''} in play · ${completedToday} flipped`
                  : 'A blank card is waiting for you'}
              </p>
            </div>
            <button type="button" className="primary-button" onClick={() => setDeck({ date: selectedDate })}>
              <Plus /> Draw a new card
            </button>
          </div>

          {dayTasks.length ? (
            <div className="task-list">
              {dayTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  accent={accentFor(task.subject)}
                  onToggle={() => toggleTask(task)}
                  onEdit={() => setDeck(task)}
                  onDelete={() => setDeleteTask(task)}
                />
              ))}
            </div>
          ) : (
            <EmptyDeck onAdd={() => setDeck({ date: selectedDate })} />
          )}
        </section>

        <footer>Made with care for Mahin <span aria-hidden="true">✦</span> One focused card at a time.</footer>
      </main>

      {deck && (
        <FlashCardDeck task={deck} onClose={() => setDeck(null)} onSave={saveTask} />
      )}
      {deleteTask && (
        <DeleteDialog task={deleteTask} onClose={() => setDeleteTask(null)} onConfirm={removeTask} />
      )}
    </div>
  )
}

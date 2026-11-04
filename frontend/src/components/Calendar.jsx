import { useMemo } from 'react'
import { PLANNER_YEAR, isoDate } from '../lib/dates'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calendar({ month, tasks, selectedDate, today, onSelect }) {
  const byDate = useMemo(() => {
    const map = new Map()
    tasks.forEach(task => {
      const entry = map.get(task.date) || { total: 0, done: 0 }
      entry.total += 1
      if (task.completed) entry.done += 1
      map.set(task.date, entry)
    })
    return map
  }, [tasks])

  const firstDay = new Date(PLANNER_YEAR, month, 1)
  const blanks = (firstDay.getDay() + 6) % 7
  const days = new Date(PLANNER_YEAR, month + 1, 0).getDate()

  return (
    <div className="calendar">
      <div className="weekdays" aria-hidden="true">
        {WEEKDAYS.map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-days">
        {Array.from({ length: blanks }, (_, index) => (
          <span className="blank" key={`blank-${index}`} aria-hidden="true" />
        ))}
        {Array.from({ length: days }, (_, index) => index + 1).map(day => {
          const date = isoDate(new Date(PLANNER_YEAR, month, day))
          const entry = byDate.get(date)
          const count = entry?.total || 0
          const complete = count > 0 && entry.done === count
          const status = count === 0 ? 'no cards' : `${count} card${count > 1 ? 's' : ''}, ${complete ? 'all flipped' : `${entry.done} flipped`}`
          return (
            <button
              key={date}
              type="button"
              className={`day ${selectedDate === date ? 'selected' : ''} ${date === today ? 'today' : ''} ${complete ? 'complete' : ''}`}
              aria-label={`${MONTH_NAMES[month]} ${day}, ${status}`}
              aria-pressed={selectedDate === date}
              aria-current={date === today ? 'date' : undefined}
              onClick={() => onSelect(date)}
              style={{ '--stagger': `${Math.min(day, 31) * 12}ms` }}
            >
              <span>{day}</span>
              {count > 0 && <i className={complete ? 'done' : ''}>{count}</i>}
            </button>
          )
        })}
      </div>
      <div className="calendar-legend">
        <span><i className="legend-dot" /> Planned</span>
        <span><i className="legend-dot done" /> All flipped</span>
      </div>
    </div>
  )
}

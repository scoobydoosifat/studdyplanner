import { BarChart3 } from 'lucide-react'
import { fromIso } from '../lib/dates'

const WEEKDAY_INITIAL = date =>
  fromIso(date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)

export default function ProgressChart({ summary }) {
  const points = summary?.dailyProgress || []
  const display = points.length > 7
    ? Array.from({ length: 7 }, (_, index) =>
      points[Math.round((index * (points.length - 1)) / 6)])
    : points

  if (!display.length) {
    return (
      <div className="chart-empty">
        <BarChart3 aria-hidden="true" />
        <p>Your momentum chart blooms after the first card.</p>
      </div>
    )
  }

  const peak = Math.max(1, ...display.map(day => day.total))

  return (
    <div className="progress-chart" role="img" aria-label="Daily completed cards">
      {display.map((day, index) => {
        const totalHeight = day.total ? Math.max(18, Math.round((day.total / peak) * 100)) : 6
        const doneHeight = day.total ? Math.round((day.completed / day.total) * 100) : 0
        return (
          <div className="bar-column" key={day.date} title={`${day.completed} of ${day.total} flipped`}>
            <div className="bar-track">
              <i style={{ height: `${totalHeight}%`, '--grow': `${index * 70}ms` }}>
                <b style={{ height: `${doneHeight}%` }} />
              </i>
            </div>
            <span>{WEEKDAY_INITIAL(day.date)}</span>
          </div>
        )
      })}
    </div>
  )
}

import { useState } from 'react'
import { Check, Clock3, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatTime, minutesLabel } from '../lib/dates'

export default function TaskCard({ task, accent, index, onToggle, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false)

  const choose = action => {
    setMenu(false)
    action()
  }

  return (
    <article
      className={`task-card accent-${accent} ${task.completed ? 'completed' : ''}`}
      style={{ '--delay': `${index * 80}ms` }}
    >
      <span className="task-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>

      <button
        type="button"
        className="task-check"
        onClick={onToggle}
        aria-label={task.completed ? 'Mark task pending' : 'Mark task done'}
        aria-pressed={task.completed}
      >
        {task.completed && <Check />}
      </button>

      <div className="task-main">
        <div className="task-top">
          <span className="subject-chip">{task.subject}</span>
          <b className={`priority ${task.priority.toLowerCase()}`}>{task.priority.toLowerCase()}</b>
        </div>
        <h3>{task.title}</h3>
        {task.notes && <p className="task-note">{task.notes}</p>}
        <div className="task-meta">
          <span><Clock3 /> {formatTime(task.startTime)}</span>
          <span>{minutesLabel(task.durationMinutes)} of focus</span>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          aria-label="Card actions"
          aria-expanded={menu}
          onClick={() => setMenu(value => !value)}
        >
          <MoreHorizontal />
        </button>
        {menu && (
          <div className="action-menu" role="menu">
            <button type="button" role="menuitem" onClick={() => choose(onEdit)}>
              <Pencil /> Edit card
            </button>
            <button type="button" role="menuitem" className="danger" onClick={() => choose(onDelete)}>
              <Trash2 /> Remove
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

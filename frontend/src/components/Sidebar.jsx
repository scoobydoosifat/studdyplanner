import { BarChart3, CalendarDays, LayoutDashboard, Plus, Sparkles } from 'lucide-react'
import Logo from './Logo'

export default function Sidebar({ onAdd }) {
  const jump = selector => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="sidebar">
      <Logo />

      <nav aria-label="Main navigation">
        <button className="active">
          <LayoutDashboard />
          <span>My deck</span>
        </button>
        <button onClick={() => jump('.calendar-panel')}>
          <CalendarDays />
          <span>Calendar</span>
        </button>
        <button onClick={() => jump('.summary-panel')}>
          <BarChart3 />
          <span>Momentum</span>
        </button>
      </nav>

      <button className="side-add" onClick={onAdd}>
        <Plus />
        <span>New focus card</span>
      </button>

      <div className="side-note">
        <Sparkles />
        <strong>Keep flipping.</strong>
        <p>Every completed card is a vote for the student you are becoming.</p>
      </div>

      <p className="version">November · December 2026</p>
    </aside>
  )
}

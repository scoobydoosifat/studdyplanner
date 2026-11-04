import { BookOpen } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <div className="logo">
      <span className="logo-mark" aria-hidden="true">
        <BookOpen size={22} />
        <i className="logo-ring" />
        <i className="logo-spark" />
      </span>
      <span className="logo-text">
        <strong>MahinPorteBosh</strong>
        {!compact && <small>focus, one card at a time</small>}
      </span>
    </div>
  )
}

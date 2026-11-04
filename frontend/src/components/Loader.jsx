import { Sparkles } from 'lucide-react'

export default function Loader({ message }) {
  return (
    <div className="loader-screen" role="status" aria-live="polite">
      <div className="loader-deck" aria-hidden="true">
        <i />
        <i />
        <i />
        <span><Sparkles size={26} /></span>
      </div>
      <strong className="loader-brand">MahinPorteBosh</strong>
      <p>{message}</p>
      <div className="loader-line"><span /></div>
    </div>
  )
}

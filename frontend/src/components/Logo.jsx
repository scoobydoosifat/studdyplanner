export default function Logo({ compact = false }) {
  return (
    <div className="logo">
      <span className="logo-mark" aria-hidden="true">
        A_
      </span>
      <span className="logo-text">
        <strong>Mahin_<em>PorteBosh</em></strong>
        {!compact && <small>focus, one card at a time</small>}
      </span>
    </div>
  )
}

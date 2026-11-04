export default function StatCard({ icon, tone, label, value, detail, progress }) {
  return (
    <article className={`stat-card ${tone}`}>
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <div className="stat-body">
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
        {progress !== undefined && (
          <div className="mini-progress" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </article>
  )
}

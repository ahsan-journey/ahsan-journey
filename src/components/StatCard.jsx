export default function StatCard({ label, value, note }) {
  return (
    <section className="card stat-card">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      <span className="stat-note">{note}</span>
    </section>
  )
}

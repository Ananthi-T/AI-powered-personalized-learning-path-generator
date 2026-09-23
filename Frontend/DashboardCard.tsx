export default function DashboardCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}


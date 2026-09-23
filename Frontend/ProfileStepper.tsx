export default function ProfileStepper({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100)
  return (
    <div className="mt-4 h-2 w-full rounded-full bg-white/5">
      <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }}></div>
    </div>
  )
}


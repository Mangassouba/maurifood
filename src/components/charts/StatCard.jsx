import { cardClass } from '../../styles/ui'

export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className={cardClass}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <Icon className="h-5 w-5 text-brand-700" />
        </span>
        <p className="text-sm font-medium text-ink-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}

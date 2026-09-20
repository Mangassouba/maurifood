import { cardClass } from '../../styles/ui'
import { STATUS_LABELS } from '../../lib/orderStatus'

const STATUS_COLOR = {
  pending: '#8a8377',
  confirmed: '#f7a30f',
  preparing: '#f7a30f',
  out_for_delivery: '#f7a30f',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

export default function StatusBreakdownChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className={cardClass}>
      <h3 className="font-bold text-ink-900">Commandes par statut</h3>

      {total === 0 ? (
        <p className="mt-6 text-sm text-ink-400">Aucune commande pour le moment.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm text-ink-600">{STATUS_LABELS[d.status]}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(d.count / max) * 100}%`,
                    backgroundColor: STATUS_COLOR[d.status],
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-sm font-semibold text-ink-900">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

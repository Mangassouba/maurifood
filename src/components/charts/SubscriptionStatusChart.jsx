import { cardClass } from '../../styles/ui'

const STATUS_LABELS = {
  trialing: "À l'essai",
  active: 'Actif',
  past_due: 'Paiement en retard',
  cancelled: 'Annulé',
  none: 'Sans abonnement',
}

const STATUS_COLOR = {
  trialing: '#f7a30f',
  active: '#22c55e',
  past_due: '#ef4444',
  cancelled: '#8a8377',
  none: '#d8d3ca',
}

export default function SubscriptionStatusChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className={cardClass}>
      <h3 className="font-bold text-ink-900">Restaurants par statut d'abonnement</h3>

      {total === 0 ? (
        <p className="mt-6 text-sm text-ink-400">Aucun restaurant pour le moment.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-ink-600">{STATUS_LABELS[d.status]}</span>
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

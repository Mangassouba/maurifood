import { useState } from 'react'
import { cardClass } from '../../styles/ui'

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'short' })
}

function formatMoney(n) {
  return `${Math.round(n).toLocaleString('fr-FR')} MRU`
}

export default function MonthlyRevenueChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const max = Math.max(1, ...data.map((d) => d.revenue))
  const total = data.reduce((sum, d) => sum + d.revenue, 0)
  const active = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className={cardClass}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-ink-900">Chiffre d'affaires par mois (12 derniers mois)</h3>
        {active && (
          <p className="text-sm font-semibold text-ink-700">
            {formatMonthLabel(active.month)} · {formatMoney(active.revenue)}
          </p>
        )}
      </div>

      {total === 0 ? (
        <p className="mt-6 text-sm text-ink-400">Aucune vente sur cette période.</p>
      ) : (
        <div className="mt-4 flex h-40 items-end gap-1.5" onMouseLeave={() => setHoverIndex(null)}>
          {data.map((d, i) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="flex w-full flex-1 items-end"
                onMouseEnter={() => setHoverIndex(i)}
              >
                <div
                  className={`w-full rounded-t-md transition-colors ${
                    hoverIndex === i ? 'bg-brand-600' : 'bg-brand-500'
                  }`}
                  style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-ink-400">{formatMonthLabel(d.month)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

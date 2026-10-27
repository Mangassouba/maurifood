import { cardClass } from '../../styles/ui'
import { getLocale, t } from '../../i18n'

function formatMoney(n) {
  return `${Math.round(n).toLocaleString(getLocale())} MRU`
}

export default function TopRestaurantsChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.revenue))

  return (
    <div className={cardClass}>
      <h3 className="font-bold text-ink-900">{t('Restaurants les plus actifs')}</h3>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-ink-400">{t('Aucune vente pour le moment.')}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm text-ink-600" title={d.name}>
                {d.name}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${(d.revenue / max) * 100}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-end text-sm font-semibold text-ink-900">
                {formatMoney(d.revenue)}
              </span>
              <span className="w-20 shrink-0 text-end text-xs text-ink-400">
                {d.quantity > 1 ? t('{n} commandes', { n: d.quantity }) : t('{n} commande', { n: d.quantity })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

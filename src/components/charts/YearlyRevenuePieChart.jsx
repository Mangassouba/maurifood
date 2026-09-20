import { useState } from 'react'
import { cardClass } from '../../styles/ui'

const RAMP = ['#ffe08a', '#ffcb4d', '#ffb92b', '#f7a30f', '#d98407', '#b3660a']
const SIZE = 160
const R = 72
const CX = SIZE / 2
const CY = SIZE / 2

function formatMoney(n) {
  return `${Math.round(n).toLocaleString('fr-FR')} MRU`
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

export default function YearlyRevenuePieChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const total = data.reduce((sum, d) => sum + d.revenue, 0)

  const slices = data.reduce((acc, d, i) => {
    const cumulative = acc.length ? acc[acc.length - 1].cumulative : 0
    const fraction = total > 0 ? d.revenue / total : 0
    const startAngle = cumulative * 360
    const endAngle = (cumulative + fraction) * 360
    acc.push({
      ...d,
      color: RAMP[Math.min(i, RAMP.length - 1)],
      fraction,
      cumulative: cumulative + fraction,
      path:
        data.length === 1
          ? null
          : arcPath(CX, CY, R, startAngle, Math.max(endAngle, startAngle + 0.001)),
    })
    return acc
  }, [])

  return (
    <div className={cardClass}>
      <h3 className="font-bold text-ink-900">Chiffre d'affaires par année</h3>

      {total === 0 ? (
        <p className="mt-6 text-sm text-ink-400">Aucune vente pour le moment.</p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-40 w-40 shrink-0">
            {slices.length === 1 ? (
              <circle cx={CX} cy={CY} r={R} fill={slices[0].color} />
            ) : (
              slices.map((s, i) => (
                <path
                  key={s.year}
                  d={s.path}
                  fill={s.color}
                  stroke="#fffdf8"
                  strokeWidth="2"
                  opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.55}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              ))
            )}
          </svg>

          <div className="flex flex-1 flex-col gap-2">
            {slices.map((s, i) => (
              <div
                key={s.year}
                className="flex items-center gap-2 text-sm"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-semibold text-ink-900">{s.year}</span>
                <span className="text-ink-500">
                  {formatMoney(s.revenue)} · {Math.round(s.fraction * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

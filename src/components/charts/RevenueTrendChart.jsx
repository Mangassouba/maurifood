import { useMemo, useState } from 'react'
import { cardClass } from '../../styles/ui'

const WIDTH = 640
const HEIGHT = 200
const PAD_LEFT = 8
const PAD_RIGHT = 8
const PAD_TOP = 16
const PAD_BOTTOM = 28

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatMoney(n) {
  return `${Math.round(n).toLocaleString('fr-FR')} MRU`
}

export default function RevenueTrendChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  const { points, areaPath, linePath, maxRevenue } = useMemo(() => {
    const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT
    const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
    const max = Math.max(1, ...data.map((d) => d.revenue))
    const step = data.length > 1 ? innerWidth / (data.length - 1) : 0

    const pts = data.map((d, i) => ({
      x: PAD_LEFT + step * i,
      y: PAD_TOP + innerHeight * (1 - d.revenue / max),
      ...d,
    }))

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const baseline = PAD_TOP + innerHeight
    const area =
      pts.length > 0
        ? `M ${pts[0].x} ${baseline} ` +
          pts.map((p) => `L ${p.x} ${p.y}`).join(' ') +
          ` L ${pts[pts.length - 1].x} ${baseline} Z`
        : ''

    return { points: pts, areaPath: area, linePath: line, maxRevenue: max }
  }, [data])

  const active = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className={cardClass}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-ink-900">Chiffre d'affaires (14 derniers jours)</h3>
        {active && (
          <p className="text-sm font-semibold text-ink-700">
            {formatShortDate(active.date)} · {formatMoney(active.revenue)}
          </p>
        )}
      </div>

      {maxRevenue <= 1 && data.every((d) => d.revenue === 0) ? (
        <p className="mt-6 text-sm text-ink-400">Aucune vente sur cette période.</p>
      ) : (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mt-2 w-full"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7a30f" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f7a30f" stopOpacity="0" />
            </linearGradient>
          </defs>

          <line
            x1={PAD_LEFT}
            y1={HEIGHT - PAD_BOTTOM}
            x2={WIDTH - PAD_RIGHT}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="#ece9e4"
            strokeWidth="1"
          />

          <path d={areaPath} fill="url(#revenueFill)" stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke="#d98407"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {active && (
            <line
              x1={active.x}
              y1={PAD_TOP}
              x2={active.x}
              y2={HEIGHT - PAD_BOTTOM}
              stroke="#d8d3ca"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {points.map((p, i) => (
            <g key={p.date}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? 4 : 3}
                fill="#d98407"
                stroke="#fffdf8"
                strokeWidth="1.5"
              />
              {(i === 0 || i === points.length - 1 || i % 3 === 0) && (
                <text x={p.x} y={HEIGHT - 8} textAnchor="middle" fontSize="9" fill="#8a8377">
                  {formatShortDate(p.date)}
                </text>
              )}
              <rect
                x={p.x - (WIDTH / points.length) / 2}
                y={0}
                width={WIDTH / points.length}
                height={HEIGHT}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}

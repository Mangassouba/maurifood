import { useEffect, useMemo, useState } from 'react'
import { FileSpreadsheet, Printer } from 'lucide-react'
import api from '../../api/client'
import Pagination from '../../components/Pagination'
import { downloadReceiptPdf } from '../../lib/receiptPdf'
import { downloadSalesXlsx } from '../../lib/salesXlsx'
import { btnGhost, cardClass } from '../../styles/ui'

const PAGE_SIZE = 15
const DAY_MS = 24 * 60 * 60 * 1000

const PAYMENT_LABELS = { cash: 'Espèces', card: 'Carte', mobile_money: 'Mobile money' }

const PERIODS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: 'all', label: 'Tout' },
]

function periodStart(period) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  if (period === 'today') return startOfToday
  if (period === '7d') return new Date(startOfToday - 6 * DAY_MS)
  if (period === '30d') return new Date(startOfToday - 29 * DAY_MS)
  return null
}

function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAmount(value) {
  return `${value.toFixed(2)} MRU`
}

export default function PosSalesTable({ restaurantName }) {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api
      .get('/dashboard/orders')
      .then(({ data }) => setSales(data.filter((o) => o.source === 'pos')))
      .catch(() => setSales([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredSales = useMemo(() => {
    const start = periodStart(period)
    return sales.filter(
      (s) => s.status !== 'cancelled' && (!start || new Date(s.createdAt) >= start),
    )
  }, [sales, period])

  const totals = useMemo(() => {
    const byMethod = { cash: 0, card: 0, mobile_money: 0 }
    let revenue = 0
    for (const sale of filteredSales) {
      revenue += Number(sale.total)
      byMethod[sale.paymentMethod] = (byMethod[sale.paymentMethod] ?? 0) + Number(sale.total)
    }
    return { revenue, byMethod }
  }, [filteredSales])

  async function exportXlsx() {
    setExporting(true)
    try {
      await downloadSalesXlsx(filteredSales, {
        restaurantName,
        periodLabel: PERIODS.find((p) => p.value === period)?.label,
      })
    } finally {
      setExporting(false)
    }
  }

  const pageCount = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedSales = filteredSales.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const summary = [
    { label: 'Ventes', value: filteredSales.length },
    { label: "Chiffre d'affaires", value: formatAmount(totals.revenue) },
    { label: 'Espèces', value: formatAmount(totals.byMethod.cash) },
    { label: 'Carte / Mobile', value: formatAmount(totals.byMethod.card + totals.byMethod.mobile_money) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              setPeriod(p.value)
              setPage(1)
            }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              period === p.value
                ? 'bg-ink-900 text-white'
                : 'border border-ink-100 bg-white text-ink-600 hover:bg-ink-50'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={exportXlsx}
          disabled={filteredSales.length === 0 || exporting}
          className={`${btnGhost} ml-auto inline-flex items-center gap-1.5 disabled:opacity-40`}
        >
          <FileSpreadsheet className="h-4 w-4 text-green-700" />
          {exporting ? 'Export…' : 'Exporter Excel'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className={cardClass}>
            <p className="text-xs font-semibold text-ink-400">{s.label}</p>
            <p className="mt-1 font-mono text-lg font-extrabold text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-xs font-bold tracking-wider text-ink-500 uppercase">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Articles</th>
                <th className="px-5 py-3">Paiement</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {pagedSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-5 py-3 font-mono font-bold tracking-wider text-green-700">
                    {sale.code}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-ink-600">
                    {formatDate(sale.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-ink-900">{sale.guestName}</td>
                  <td className="px-5 py-3 text-ink-600">
                    {sale.items
                      .map((item) => `${item.quantity} × ${item.dish?.name ?? 'Plat'}`)
                      .join(', ')}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-ink-600">
                    {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap font-mono font-bold text-ink-900">
                    {formatAmount(Number(sale.total))}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        downloadReceiptPdf({ ...sale, restaurant: { name: restaurantName } })
                      }
                      aria-label={`Télécharger le reçu ${sale.code}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredSales.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-ink-400">
            Aucune vente sur cette période.
          </p>
        )}
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
          total={filteredSales.length}
        />
      </div>
    </div>
  )
}

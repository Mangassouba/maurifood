import { useEffect, useMemo, useState } from 'react'
import { Banknote, CreditCard, Printer, Search, Smartphone, Trash2 } from 'lucide-react'
import api from '../../api/client'
import DishImage from '../../components/DishImage'
import Modal from '../../components/Modal'
import QuantityStepper from '../../components/QuantityStepper'
import PosSalesTable from './PosSalesTable'
import { downloadReceiptPdf } from '../../lib/receiptPdf'
import { btnDark, btnGhost, btnPrimary, cardClass, inputClass } from '../../styles/ui'
import { t } from '../../i18n'

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Espèces', icon: Banknote },
  { value: 'card', label: 'Carte', icon: CreditCard },
  { value: 'mobile_money', label: 'Mobile money', icon: Smartphone },
]

export default function PosPage() {
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [amountReceived, setAmountReceived] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [completedSale, setCompletedSale] = useState(null)
  const [tab, setTab] = useState('sale')
  const [restaurantName, setRestaurantName] = useState('')

  useEffect(() => {
    api.get('/dashboard/dishes').then(({ data }) => setDishes(data))
    api.get('/dashboard/categories').then(({ data }) => setCategories(data))
    api
      .get('/dashboard/restaurant')
      .then(({ data }) => setRestaurantName(data.name))
      .catch(() => {})
  }, [])

  const visibleDishes = useMemo(() => {
    const query = search.trim().toLowerCase()
    return dishes.filter(
      (d) =>
        d.isAvailable &&
        (categoryFilter === 'all' || d.categoryId === categoryFilter) &&
        (!query || d.name.toLowerCase().includes(query)),
    )
  }, [dishes, categoryFilter, search])

  const total = cart.reduce((sum, line) => sum + Number(line.dish.price) * line.quantity, 0)
  const change = Number(amountReceived) - total

  function addDish(dish) {
    setCart((lines) => {
      const existing = lines.find((l) => l.dish.id === dish.id)
      if (existing) {
        return lines.map((l) => (l.dish.id === dish.id ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...lines, { dish, quantity: 1 }]
    })
  }

  function changeQuantity(dishId, delta) {
    setCart((lines) =>
      lines
        .map((l) => (l.dish.id === dishId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    )
  }

  function resetSale() {
    setCart([])
    setCustomerName('')
    setAmountReceived('')
    setPaymentMethod('cash')
    setError('')
  }

  async function checkout() {
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.post('/dashboard/pos/sales', {
        items: cart.map((l) => ({ dishId: l.dish.id, quantity: l.quantity })),
        paymentMethod,
        customerName,
      })
      setCompletedSale({ order: data, change: paymentMethod === 'cash' && amountReceived ? change : null })
      resetSale()
    } catch (err) {
      setError(err.response?.data?.error ?? t("La vente n'a pas pu être enregistrée."))
    } finally {
      setSubmitting(false)
    }
  }

  const categoryButton = (active) =>
    `whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
      active ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 border border-ink-100 hover:bg-ink-50'
    }`

  const tabs = [
    { value: 'sale', label: 'Nouvelle vente' },
    { value: 'history', label: 'Ventes' },
  ]

  return (
    <div>
      <div className="mb-5 inline-flex rounded-full border border-ink-100 bg-white p-1">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.value}
            type="button"
            onClick={() => setTab(tabItem.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              tab === tabItem.value ? 'bg-brand-500 text-ink-900' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {t(tabItem.label)}
          </button>
        ))}
      </div>

      {tab === 'history' ? (
        <PosSalesTable restaurantName={restaurantName} />
      ) : (
    <div className="grid gap-6 pb-20 lg:grid-cols-[1fr_340px] lg:pb-0">
      <section className="min-w-0">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            className={`${inputClass} ps-9`}
            placeholder={t('Rechercher un plat…')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={categoryButton(categoryFilter === 'all')}
          >
            {t('Tous')}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={categoryButton(categoryFilter === c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {visibleDishes.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-400">{t('Aucun plat disponible.')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visibleDishes.map((dish) => {
              const inCart = cart.find((l) => l.dish.id === dish.id)?.quantity
              return (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => addDish(dish)}
                  className="relative overflow-hidden rounded-2xl border border-ink-100 bg-white text-start shadow-sm transition hover:border-brand-300 hover:shadow-md active:scale-[0.98]"
                >
                  <DishImage src={dish.imageUrl} alt={dish.name} className="h-24 w-full" />
                  {inCart && (
                    <span className="absolute end-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-ink-900">
                      {inCart}
                    </span>
                  )}
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-sm font-semibold text-ink-900">{dish.name}</p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-green-700">
                      {Number(dish.price)} MRU
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Le ticket reste visible en entier à l'écran : seule la liste des articles défile. */}
      <aside
        id="pos-ticket"
        className={`${cardClass} flex h-fit flex-col gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink-900">{t('Ticket')}</h2>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={resetSale}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t('Vider')}
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-400">
            {t("Touchez un plat pour l'ajouter au ticket.")}
          </p>
        ) : (
          <ul className="flex max-h-72 min-h-0 flex-col divide-y divide-ink-100 overflow-y-auto lg:max-h-none">
            {cart.map((line) => (
              <li key={line.dish.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{line.dish.name}</p>
                  <p className="font-mono text-xs text-ink-500">
                    {(Number(line.dish.price) * line.quantity).toFixed(2)} MRU
                  </p>
                </div>
                <QuantityStepper
                  size="sm"
                  value={line.quantity}
                  onIncrement={() => changeQuantity(line.dish.id, 1)}
                  onDecrement={() => changeQuantity(line.dish.id, -1)}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
          <span className="text-sm font-semibold text-ink-600">{t('Total')}</span>
          <span className="font-mono text-2xl font-extrabold text-ink-900">{total.toFixed(2)} MRU</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPaymentMethod(option.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${
                paymentMethod === option.value
                  ? 'border-brand-500 bg-brand-50 text-ink-900'
                  : 'border-ink-100 text-ink-500 hover:bg-ink-50'
              }`}
            >
              <option.icon className="h-4 w-4" />
              {t(option.label)}
            </button>
          ))}
        </div>

        {paymentMethod === 'cash' && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-500">{t('Montant reçu (MRU)')}</label>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              className={inputClass}
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
            />
            {amountReceived !== '' && cart.length > 0 && (
              <p className={`mt-1.5 text-sm font-semibold ${change < 0 ? 'text-red-600' : 'text-green-700'}`}>
                {change < 0
                  ? t('Manque {amount} MRU', { amount: Math.abs(change).toFixed(2) })
                  : t('Monnaie à rendre : {amount} MRU', { amount: change.toFixed(2) })}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">{t('Nom du client (optionnel)')}</label>
          <input
            className={inputClass}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t('Client comptoir')}
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="button"
          onClick={checkout}
          disabled={
            cart.length === 0 ||
            submitting ||
            (paymentMethod === 'cash' && amountReceived !== '' && change < 0)
          }
          className={`${btnPrimary} py-3 text-base`}
        >
          {submitting ? t('Enregistrement…') : t('Encaisser {amount} MRU', { amount: total.toFixed(2) })}
        </button>
      </aside>

      {cart.length > 0 && (
        <button
          type="button"
          onClick={() =>
            document.getElementById('pos-ticket')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="fixed inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-2xl bg-ink-900 px-5 py-3.5 text-white shadow-lg lg:hidden"
        >
          <span className="text-sm font-semibold">
            {t('Voir le ticket ({n})', { n: cart.reduce((n, l) => n + l.quantity, 0) })}
          </span>
          <span className="font-mono text-base font-extrabold">{total.toFixed(2)} MRU</span>
        </button>
      )}

      <Modal open={Boolean(completedSale)} onClose={() => setCompletedSale(null)} title={t('Vente enregistrée')}>
        {completedSale && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-green-50 p-4 text-center">
              <p className="font-mono text-lg font-bold tracking-wider text-green-700">
                {completedSale.order.code}
              </p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-ink-900">
                {Number(completedSale.order.total).toFixed(2)} MRU
              </p>
              {completedSale.change !== null && (
                <p className="mt-1 text-sm font-semibold text-green-700">
                  {t('Monnaie à rendre : {amount} MRU', { amount: completedSale.change.toFixed(2) })}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => downloadReceiptPdf(completedSale.order)}
                className={`${btnGhost} inline-flex items-center gap-1.5`}
              >
                <Printer className="h-4 w-4" /> {t('Reçu PDF')}
              </button>
              <button type="button" onClick={() => setCompletedSale(null)} className={btnDark}>
                {t('Nouvelle vente')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
      )}
    </div>
  )
}

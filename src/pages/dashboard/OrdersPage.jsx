import { useEffect, useMemo, useState } from 'react'
import { CircleCheck, RotateCw, Search } from 'lucide-react'
import api from '../../api/client'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import {
  FINAL_STATUSES,
  STATUS_FLOW,
  genericStatusLabel,
  nextStatus,
  statusLabel,
  statusesFor,
} from '../../lib/orderStatus'
import { badgeClass, btnDark, cardClass, inputClass } from '../../styles/ui'
import { getLocale, t } from '../../i18n'

const ALL_STATUSES = [...STATUS_FLOW, 'cancelled']

const STATUS_TONE = {
  pending: 'brand',
  confirmed: 'ink',
  preparing: 'ink',
  ready: 'green',
  out_for_delivery: 'ink',
  delivered: 'green',
  cancelled: 'red',
}

const PAGE_SIZE = 10

const btnValidate =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50'

const btnAdvance =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50'

function advanceLabel(status, orderType) {
  if (status === 'confirmed') return t('Confirmer')
  if (status === 'preparing') return t('Mettre en préparation')
  if (status === 'ready') return t('Marquer Prête')
  if (status === 'out_for_delivery') return t('Envoyer en livraison')
  return statusLabel(status, orderType)
}

function validateLabel(orderType) {
  return orderType === 'delivery' ? t('Valider la livraison') : t('Valider le retrait')
}

function normalizeCode(value) {
  const code = value.trim().toUpperCase().replace(/\s+/g, '')
  if (!code) return ''
  return code.startsWith('MF-') ? code : `MF-${code.replace(/^MF/, '')}`
}

function formatDate(value) {
  return new Date(value).toLocaleString(getLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function itemCount(order) {
  return order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [detailsOrder, setDetailsOrder] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [actionError, setActionError] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')

  function load() {
    setLoading(true)
    api
      .get('/dashboard/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api
      .get('/dashboard/drivers')
      .then(({ data }) => setDrivers(data))
      .catch(() => setDrivers([]))
  }, [])

  async function updateStatus(id, status) {
    try {
      await api.put(`/dashboard/orders/${id}/status`, { status })
    } catch (err) {
      setActionError(err.response?.data?.error ?? t('Impossible de modifier le statut'))
      return
    }
    load()
    setDetailsOrder((current) => (current?.id === id ? { ...current, status } : current))
  }

  async function assignDriver(id, driverId) {
    try {
      await api.put(`/dashboard/orders/${id}/driver`, { driverId: driverId || null })
    } catch (err) {
      setActionError(err.response?.data?.error ?? t("Impossible d'assigner le livreur"))
      return
    }
    const driver = drivers.find((d) => d.id === Number(driverId)) ?? null
    load()
    setDetailsOrder((current) =>
      current?.id === id ? { ...current, driverId: driver?.id ?? null, driver } : current,
    )
  }

  function advance(order, next) {
    // Impossible de partir en livraison sans livreur : on ouvre le détail pour en choisir un
    if (next === 'out_for_delivery' && !order.driverId) {
      setDetailsOrder(order)
      return
    }
    updateStatus(order.id, next)
  }

  function verifyCode(e) {
    e.preventDefault()
    const code = normalizeCode(codeInput)
    const order = orders.find((o) => o.code === code)
    if (!order) {
      setCodeError(t('Aucune commande trouvée pour le code {code}', { code }))
      return
    }
    setCodeError('')
    setCodeInput('')
    setDetailsOrder(order)
  }

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (statusFilter === 'all' || order.status === statusFilter) &&
          (typeFilter === 'all' || order.orderType === typeFilter),
      ),
    [orders, statusFilter, typeFilter],
  )

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={verifyCode} className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-100 bg-green-50 text-ink-900">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-ink-900">{t('Vérifier un code de retrait')}</h2>
            <p className="text-sm text-ink-500">
              {t('Le client vous présente un code du type')}{' '}
              <span className="font-mono font-bold text-ink-600">MF-XXXXXX</span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <input
            placeholder={t('Ex : MF-ABC123')}
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value)
              setCodeError('')
            }}
            className={`${inputClass} font-mono text-lg tracking-widest uppercase min-w-0 flex-1 sm:max-w-md`}
          />
          <button
            type="submit"
            disabled={!codeInput.trim()}
            className="whitespace-nowrap rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {t('Vérifier le code')}
          </button>
        </div>
        {codeError && <p className="mt-2 text-sm font-semibold text-red-600">{codeError}</p>}
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-ink-100" />
        <span className="text-xs font-bold tracking-widest text-ink-400 uppercase">
          {t('Commandes en ligne')}
        </span>
        <div className="h-px flex-1 bg-ink-100" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink-900">{t('Commandes passées via la vitrine')}</h2>
            <p className="text-sm text-ink-500">{t('{n} commande(s)', { n: filteredOrders.length })}</p>
          </div>
          <div className="flex flex-nowrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className={`${inputClass} w-44 min-w-0 shrink`}
            >
              <option value="all">{t('Tous les types')}</option>
              <option value="delivery">{t('Livraison')}</option>
              <option value="pickup">{t('À emporter')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className={`${inputClass} w-44 min-w-0 shrink`}
            >
              <option value="all">{t('Tous les statuts')}</option>
              {(typeFilter === 'all' ? ALL_STATUSES : [...statusesFor(typeFilter), 'cancelled']).map((s) => (
                <option key={s} value={s}>
                  {typeFilter === 'all' ? genericStatusLabel(s) : statusLabel(s, typeFilter)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-ink-100 px-4 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-ink-50 disabled:opacity-50"
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t('Actualiser')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-start text-sm">
            <thead className="border-y border-ink-100 bg-ink-50 text-xs font-bold tracking-wider text-ink-500 uppercase">
              <tr>
                <th className="px-5 py-3">{t('Code retrait')}</th>
                <th className="px-5 py-3">{t('Client')}</th>
                <th className="px-5 py-3">{t('Date')}</th>
                <th className="px-5 py-3">{t('Articles')}</th>
                <th className="px-5 py-3">{t('Total')}</th>
                <th className="px-5 py-3">{t('Statut')}</th>
                <th className="px-5 py-3">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {pagedOrders.map((order) => {
                const next = nextStatus(order.status, order.orderType)
                const isOpen = !FINAL_STATUSES.includes(order.status)
                return (
                  <tr key={order.id} className={isOpen ? 'bg-green-50/60' : ''}>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setDetailsOrder(order)}
                        className="font-mono text-lg font-bold tracking-wider text-green-700 hover:underline"
                      >
                        {order.code}
                      </button>
                      <p className="text-xs text-ink-400">
                        {order.source === 'pos'
                          ? t('Vente caisse')
                          : order.orderType === 'delivery'
                            ? t('Livraison')
                            : t('À emporter')}
                        {order.driver && ` · ${order.driver.name}`}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink-900">{order.guestName}</p>
                      <p className="font-mono text-xs text-ink-500">{order.guestPhone}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-ink-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-ink-600">
                      {t('{n} produit(s)', { n: itemCount(order) })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-green-700">
                      {Number(order.total)} MRU
                    </td>
                    <td className="px-5 py-4">
                      <span className={`${badgeClass(STATUS_TONE[order.status])} whitespace-nowrap uppercase`}>
                        {statusLabel(order.status, order.orderType)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-nowrap items-center gap-2">
                        {isOpen && (
                          <button type="button" onClick={() => setDetailsOrder(order)} className={btnValidate}>
                            <Search className="h-4 w-4" /> {t('Vérifier & Valider')}
                          </button>
                        )}
                        {next && next !== 'delivered' && (
                          <button
                            type="button"
                            onClick={() => advance(order, next)}
                            className={btnAdvance}
                          >
                            <CircleCheck className="h-4 w-4" /> {advanceLabel(next, order.orderType)}
                          </button>
                        )}
                        {!isOpen && (
                          <button
                            type="button"
                            onClick={() => setDetailsOrder(order)}
                            className="text-sm font-semibold text-ink-600 hover:text-ink-900"
                          >
                            {t('Détails')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <p className="px-5 py-8 text-center text-ink-400">{t('Aucune commande pour ces filtres.')}</p>
        )}

        {pageCount > 1 && (
          <div className="border-t border-ink-100">
            <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} total={filteredOrders.length} />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(detailsOrder)}
        onClose={() => setDetailsOrder(null)}
        title={detailsOrder ? t('Commande {code}', { code: detailsOrder.code }) : ''}
      >
        {detailsOrder && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className={badgeClass(STATUS_TONE[detailsOrder.status])}>
                {statusLabel(detailsOrder.status, detailsOrder.orderType)}
              </span>
              <span className="text-sm text-ink-500">
                {detailsOrder.orderType === 'delivery' ? t('Livraison') : t('À emporter')}
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">{detailsOrder.guestName}</p>
              <p className="text-sm text-ink-500">{detailsOrder.guestPhone}</p>
              {detailsOrder.guestAddress && (
                <p className="text-sm text-ink-500">{detailsOrder.guestAddress}</p>
              )}
            </div>

            {detailsOrder.orderType === 'delivery' && (
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wide text-ink-400 uppercase">
                  {t('Livreur')}
                </label>
                <select
                  value={detailsOrder.driverId ?? ''}
                  onChange={(e) => assignDriver(detailsOrder.id, e.target.value)}
                  disabled={FINAL_STATUSES.includes(detailsOrder.status)}
                  className={inputClass}
                >
                  <option value="">{t('Aucun livreur assigné')}</option>
                  {drivers
                    .filter((d) => d.isActive || d.id === detailsOrder.driverId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.phone}
                        {d.vehicle ? ` (${d.vehicle})` : ''}
                      </option>
                    ))}
                </select>
                {!detailsOrder.driverId && !FINAL_STATUSES.includes(detailsOrder.status) && (
                  <p className="mt-1 text-xs text-brand-700">
                    {drivers.some((d) => d.isActive)
                      ? t('Assignez un livreur pour pouvoir envoyer la commande en livraison.')
                      : t('Aucun livreur actif : ajoutez-en un dans la page Livraison.')}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 border-y border-ink-100 py-3">
              {detailsOrder.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">
                    {item.quantity}× {item.dish?.name}
                  </span>
                  <span className="font-semibold text-ink-900">
                    {(Number(item.unitPrice) * item.quantity).toFixed(2)} MRU
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>{t('Sous-total')}</span>
                <span>{detailsOrder.subtotal} MRU</span>
              </div>
              {detailsOrder.orderType === 'delivery' && (
                <div className="flex justify-between text-ink-500">
                  <span>{t('Frais de livraison')}</span>
                  <span>{detailsOrder.deliveryFee} MRU</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-ink-900">
                <span>{t('Total')}</span>
                <span>{detailsOrder.total} MRU</span>
              </div>
            </div>

            {!FINAL_STATUSES.includes(detailsOrder.status) && (
              <button
                type="button"
                onClick={() => updateStatus(detailsOrder.id, 'delivered')}
                className={`${btnValidate} justify-center py-2.5`}
              >
                <CircleCheck className="h-4 w-4" /> {validateLabel(detailsOrder.orderType)}
              </button>
            )}

            <select
              value={detailsOrder.status}
              onChange={(e) => updateStatus(detailsOrder.id, e.target.value)}
              className={inputClass}
            >
              {[...statusesFor(detailsOrder.orderType), 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s, detailsOrder.orderType)}
                </option>
              ))}
            </select>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(actionError)} onClose={() => setActionError('')} title={t('Action impossible')}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-600">{actionError}</p>
          <button type="button" onClick={() => setActionError('')} className={`${btnDark} self-end`}>
            OK
          </button>
        </div>
      </Modal>
    </div>
  )
}

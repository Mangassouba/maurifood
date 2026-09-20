import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { STATUS_LABELS } from '../../lib/orderStatus'
import { badgeClass, cardClass, inputClass } from '../../styles/ui'

const STATUS_FLOW = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

const STATUS_TONE = {
  pending: 'ink',
  confirmed: 'brand',
  preparing: 'brand',
  out_for_delivery: 'brand',
  delivered: 'green',
  cancelled: 'red',
}

const PAGE_SIZE = 10

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [detailsOrder, setDetailsOrder] = useState(null)

  function load() {
    api
      .get('/dashboard/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
  }

  useEffect(load, [])

  async function updateStatus(id, status) {
    await api.put(`/dashboard/orders/${id}/status`, { status })
    load()
    setDetailsOrder((current) => (current?.id === id ? { ...current, status } : current))
  }

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (typeFilter !== 'all' && order.orderType !== typeFilter) return false
      if (term) {
        const haystack = `${order.code} ${order.guestName ?? ''} ${order.guestPhone ?? ''}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [orders, search, statusFilter, typeFilter])

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          placeholder="Rechercher par code, nom ou téléphone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-48 shrink-0 sm:w-72`}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-36 shrink-0`}
        >
          <option value="all">Tous les statuts</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-36 shrink-0`}
        >
          <option value="all">Tous les types</option>
          <option value="delivery">Livraison</option>
          <option value="pickup">À emporter</option>
        </select>
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-ink-400">Aucune commande ne correspond à votre recherche.</p>
      )}

      <div className="flex flex-col gap-3">
        {pagedOrders.map((order) => (
          <div key={order.id} className={cardClass}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailsOrder(order)}
                    className="font-bold text-ink-900 hover:underline"
                  >
                    {order.code}
                  </button>
                  <span className="text-sm text-ink-500">
                    · {order.orderType === 'delivery' ? 'Livraison' : 'À emporter'}
                  </span>
                  <span className={badgeClass(STATUS_TONE[order.status])}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-ink-700">
                  {order.guestName} · {order.guestPhone}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {order.items?.map((i) => `${i.quantity}× ${i.dish?.name}`).join(', ')}
                </p>
              </div>
              <p className="whitespace-nowrap text-lg font-extrabold text-brand-600">
                {order.total} MRU
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-3">
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className={`${inputClass} w-auto`}
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              {order.orderType === 'delivery' && order.guestAddress && (
                <span className="text-sm text-ink-500">→ {order.guestAddress}</span>
              )}
              <button
                type="button"
                onClick={() => setDetailsOrder(order)}
                className="ml-auto text-sm font-semibold text-ink-600 hover:text-ink-900"
              >
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className={`${cardClass} mt-3 p-0`}>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} total={filteredOrders.length} />
        </div>
      )}

      <Modal
        open={Boolean(detailsOrder)}
        onClose={() => setDetailsOrder(null)}
        title={detailsOrder ? `Commande ${detailsOrder.code}` : ''}
      >
        {detailsOrder && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className={badgeClass(STATUS_TONE[detailsOrder.status])}>
                {STATUS_LABELS[detailsOrder.status]}
              </span>
              <span className="text-sm text-ink-500">
                {detailsOrder.orderType === 'delivery' ? 'Livraison' : 'À emporter'}
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">{detailsOrder.guestName}</p>
              <p className="text-sm text-ink-500">{detailsOrder.guestPhone}</p>
              {detailsOrder.guestAddress && (
                <p className="text-sm text-ink-500">{detailsOrder.guestAddress}</p>
              )}
            </div>

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
                <span>Sous-total</span>
                <span>{detailsOrder.subtotal} MRU</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Frais de livraison</span>
                <span>{detailsOrder.deliveryFee} MRU</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-ink-900">
                <span>Total</span>
                <span>{detailsOrder.total} MRU</span>
              </div>
            </div>

            <select
              value={detailsOrder.status}
              onChange={(e) => updateStatus(detailsOrder.id, e.target.value)}
              className={inputClass}
            >
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        )}
      </Modal>
    </div>
  )
}

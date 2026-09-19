import { useEffect, useState } from 'react'
import api from '../../api/client'
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

export default function OrdersPage() {
  const [orders, setOrders] = useState([])

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
  }

  return (
    <div>
      {orders.length === 0 && <p className="text-ink-400">Aucune commande pour le moment.</p>}

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <div key={order.id} className={cardClass}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink-900">
                    {order.code} ·{' '}
                    {order.orderType === 'delivery' ? 'Livraison' : 'À emporter'}
                  </p>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadOrderHistory } from '../../lib/orderHistory'
import { cardClass } from '../../styles/ui'

export default function MyOrdersPage() {
  const [orders] = useState(loadOrderHistory)

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">Mes commandes</h1>
      <p className="mb-6 text-sm text-ink-400">Historique conservé sur cet appareil.</p>

      {orders.length === 0 && (
        <p className="text-ink-400">Aucune commande passée depuis cet appareil pour le moment.</p>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.code}
            to={`/commandes/${order.code}`}
            className={`${cardClass} flex items-center justify-between transition hover:shadow-md`}
          >
            <div>
              <p className="font-bold text-ink-900">{order.code}</p>
              <p className="text-sm text-ink-400">{order.restaurantName}</p>
            </div>
            <p className="font-extrabold text-brand-600">{order.total} MRU</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

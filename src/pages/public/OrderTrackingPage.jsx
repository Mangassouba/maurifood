import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Download } from 'lucide-react'
import api from '../../api/client'
import { STATUS_LABELS } from '../../lib/orderStatus'
import { downloadReceiptPdf } from '../../lib/receiptPdf'
import { btnGhost, cardClass } from '../../styles/ui'

export default function OrderTrackingPage() {
  const { code } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setOrder(null)
    setError('')
    api
      .get(`/orders/code/${code}`)
      .then(({ data }) => setOrder(data))
      .catch((err) =>
        setError(err.response?.data?.error ?? 'Impossible de charger cette commande'),
      )
  }, [code])

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-ink-500">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-brand-600 underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  if (!order) {
    return <div className="mx-auto max-w-lg px-6 py-16 text-center text-ink-400">Chargement...</div>
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col items-center rounded-3xl bg-ink-900 px-6 py-8 text-center text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500">
          <Check className="h-7 w-7 text-ink-900" />
        </span>
        <p className="mt-4 text-sm text-white/60">Commande confirmée</p>
        <p className="mt-1 text-3xl font-extrabold tracking-wide">{order.code}</p>
        <p className="mt-2 text-sm text-white/70">
          Présentez ce code au restaurant : <strong>{order.restaurant?.name}</strong>
        </p>
      </div>

      <button
        type="button"
        onClick={() => downloadReceiptPdf(order)}
        className={`${btnGhost} mb-4 flex w-full items-center justify-center gap-2`}
      >
        <Download className="h-4 w-4" />
        Télécharger le reçu (PDF)
      </button>

      <div className={`${cardClass} mb-4`}>
        <p className="mb-3 text-sm font-bold text-ink-900">Vos informations</p>
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-400">Nom</dt>
            <dd className="font-medium text-ink-900">{order.guestName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-400">Téléphone</dt>
            <dd className="font-medium text-ink-900">{order.guestPhone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-400">Type</dt>
            <dd className="font-medium text-ink-900">
              {order.orderType === 'delivery' ? 'Livraison' : 'À emporter'}
            </dd>
          </div>
          {order.guestAddress && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink-400">Adresse</dt>
              <dd className="text-right font-medium text-ink-900">{order.guestAddress}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-400">Statut</dt>
            <dd className="font-medium text-brand-600">
              {STATUS_LABELS[order.status] ?? order.status}
            </dd>
          </div>
        </dl>
      </div>

      <div className={cardClass}>
        <p className="mb-3 text-sm font-bold text-ink-900">Récapitulatif</p>
        <div className="flex flex-col gap-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-ink-600">
                {item.quantity} × {item.dish?.name ?? `Plat #${item.dishId}`}
              </span>
              <span className="font-medium text-ink-900">
                {(Number(item.unitPrice) * item.quantity).toFixed(2)} MRU
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-ink-100 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-400">Sous-total</span>
            <span className="text-ink-900">{order.subtotal} MRU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400">Livraison</span>
            <span className="text-ink-900">{order.deliveryFee} MRU</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-ink-900">
            <span>Total</span>
            <span>{order.total} MRU</span>
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="mt-6 block rounded-full bg-brand-500 py-3 text-center text-sm font-bold text-ink-900 transition hover:bg-brand-400"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}

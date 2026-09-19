import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { addOrderToHistory } from '../../lib/orderHistory'
import { btnGhost, btnPrimary, cardClass, inputClass } from '../../styles/ui'
import api from '../../api/client'

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [orderType, setOrderType] = useState('pickup')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestAddress, setGuestAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (cart.items.length === 0 && !submitted) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!guestName.trim() || !guestPhone.trim()) {
      setError('Veuillez indiquer votre nom et votre numéro de téléphone')
      return
    }
    if (orderType === 'delivery' && !guestAddress.trim()) {
      setError('Veuillez indiquer votre adresse de livraison')
      return
    }

    setLoading(true)
    try {
      const { data: order } = await api.post('/orders', {
        restaurantId: cart.restaurantId,
        orderType,
        guestName,
        guestPhone,
        guestAddress: orderType === 'delivery' ? guestAddress : undefined,
        items: cart.items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
      })

      addOrderToHistory({
        code: order.code,
        restaurantName: cart.restaurantName,
        total: order.total,
        createdAt: order.createdAt,
      })

      setSubmitted(true)
      clearCart()
      navigate(`/commandes/${order.code}`)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Impossible de créer la commande')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    if (!window.confirm('Annuler la commande et vider le panier ?')) return
    clearCart()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">Finaliser la commande</h1>
      <p className="mb-6 text-sm text-ink-400">{cart.restaurantName}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-bold text-ink-900">Type de commande</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderType('pickup')}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                orderType === 'pickup'
                  ? 'bg-ink-900 text-white'
                  : 'border border-ink-100 text-ink-600'
              }`}
            >
              À emporter
            </button>
            <button
              type="button"
              onClick={() => setOrderType('delivery')}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                orderType === 'delivery'
                  ? 'bg-ink-900 text-white'
                  : 'border border-ink-100 text-ink-600'
              }`}
            >
              Livraison
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-ink-900">Vos coordonnées</p>
          <input
            placeholder="Nom complet"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="tel"
            placeholder="Numéro de téléphone"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className={inputClass}
            required
          />
          {orderType === 'delivery' && (
            <textarea
              placeholder="Adresse de livraison"
              value={guestAddress}
              onChange={(e) => setGuestAddress(e.target.value)}
              className={inputClass}
              required
            />
          )}
        </div>

        <div className={`${cardClass} flex items-center justify-between`}>
          <span className="font-semibold text-ink-600">Sous-total</span>
          <span className="text-lg font-extrabold text-ink-900">{subtotal} MRU</span>
        </div>

        <p className="text-sm text-ink-400">Paiement à la livraison / au retrait (espèces).</p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className={`${btnPrimary} flex-1`}>
            {loading ? 'Envoi...' : 'Confirmer la commande'}
          </button>
          <button type="button" onClick={handleCancel} className={btnGhost}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

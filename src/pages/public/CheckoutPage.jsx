import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import { useCart } from '../../context/CartContext'
import { addOrderToHistory } from '../../lib/orderHistory'
import { btnGhost, btnPrimary, cardClass, inputClass } from '../../styles/ui'
import api from '../../api/client'
import { t } from '../../i18n'

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
  const [offersDelivery, setOffersDelivery] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    if (!cart.restaurantId) return
    api
      .get('/public/restaurants')
      .then(({ data }) => {
        const restaurant = data.find((r) => r.id === cart.restaurantId)
        setOffersDelivery(Boolean(restaurant?.offersDelivery))
      })
      .catch(() => setOffersDelivery(false))
  }, [cart.restaurantId])

  // Le restaurant peut avoir désactivé la livraison entre-temps
  const effectiveOrderType = offersDelivery ? orderType : 'pickup'

  if (cart.items.length === 0 && !submitted) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!guestName.trim() || !guestPhone.trim()) {
      setError(t('Veuillez indiquer votre nom et votre numéro de téléphone'))
      return
    }
    if (effectiveOrderType === 'delivery' && !guestAddress.trim()) {
      setError(t('Veuillez indiquer votre adresse de livraison'))
      return
    }

    setLoading(true)
    try {
      const { data: order } = await api.post('/orders', {
        restaurantId: cart.restaurantId,
        orderType: effectiveOrderType,
        guestName,
        guestPhone,
        guestAddress: effectiveOrderType === 'delivery' ? guestAddress : undefined,
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
      setError(err.response?.data?.error ?? t('Impossible de créer la commande'))
    } finally {
      setLoading(false)
    }
  }

  function cancelOrder() {
    clearCart()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">{t('Finaliser la commande')}</h1>
      <p className="mb-6 text-sm text-ink-400">{cart.restaurantName}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-bold text-ink-900">{t('Type de commande')}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderType('pickup')}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                effectiveOrderType === 'pickup'
                  ? 'bg-ink-900 text-white'
                  : 'border border-ink-100 text-ink-600'
              }`}
            >
              {t('À emporter')}
            </button>
            {offersDelivery && (
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                  effectiveOrderType === 'delivery'
                    ? 'bg-ink-900 text-white'
                    : 'border border-ink-100 text-ink-600'
                }`}
              >
                {t('Livraison')}
              </button>
            )}
          </div>
          {!offersDelivery && (
            <p className="mt-2 text-xs text-ink-400">
              {t('Ce restaurant ne propose pas la livraison : commande à retirer sur place.')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-ink-900">{t('Vos coordonnées')}</p>
          <input
            placeholder={t('Nom complet')}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="tel"
            placeholder={t('Numéro de téléphone')}
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className={inputClass}
            required
          />
          {effectiveOrderType === 'delivery' && (
            <textarea
              placeholder={t('Adresse de livraison')}
              value={guestAddress}
              onChange={(e) => setGuestAddress(e.target.value)}
              className={inputClass}
              required
            />
          )}
        </div>

        <div className={`${cardClass} flex items-center justify-between`}>
          <span className="font-semibold text-ink-600">{t('Sous-total')}</span>
          <span className="text-lg font-extrabold text-ink-900">{subtotal} MRU</span>
        </div>

        <p className="text-sm text-ink-400">{t('Paiement à la livraison / au retrait (espèces).')}</p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className={`${btnPrimary} flex-1`}>
            {loading ? t('Envoi...') : t('Confirmer la commande')}
          </button>
          <button type="button" onClick={() => setConfirmCancel(true)} className={btnGhost}>
            {t('Annuler')}
          </button>
        </div>
      </form>

      <ConfirmModal
        open={confirmCancel}
        title={t('Annuler la commande ?')}
        message={t('Tous les plats de votre panier seront retirés.')}
        confirmLabel={t('Vider le panier')}
        cancelLabel={t('Garder mon panier')}
        onConfirm={cancelOrder}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  )
}

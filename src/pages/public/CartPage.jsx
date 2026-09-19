import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import DishImage from '../../components/DishImage'
import QuantityStepper from '../../components/QuantityStepper'
import { cardClass } from '../../styles/ui'

export default function CartPage() {
  const { cart, updateQuantity, clearCart, subtotal } = useCart()
  const navigate = useNavigate()

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl">
          🛒
        </div>
        <p className="text-ink-500">Votre panier est vide.</p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-ink-700"
        >
          Voir les plats
        </Link>
      </div>
    )
  }

  function handleCancelOrder() {
    if (!window.confirm('Annuler la commande et vider le panier ?')) return
    clearCart()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold text-ink-900">Votre panier</h1>
          <p className="text-sm text-ink-400">{cart.restaurantName}</p>
        </div>
        <button
          type="button"
          onClick={handleCancelOrder}
          className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          Annuler la commande
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {cart.items.map((item) => (
          <div
            key={item.dishId}
            className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-sm"
          >
            <DishImage alt={item.name} className="h-14 w-14 shrink-0 rounded-xl" />
            <div className="flex-1">
              <p className="font-bold text-ink-900">{item.name}</p>
              <p className="text-sm font-semibold text-brand-600">{item.price} MRU</p>
            </div>
            <QuantityStepper
              size="sm"
              value={item.quantity}
              onDecrement={() => updateQuantity(item.dishId, item.quantity - 1)}
              onIncrement={() => updateQuantity(item.dishId, item.quantity + 1)}
            />
          </div>
        ))}
      </div>

      <div className={`${cardClass} mt-6`}>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-ink-600">Sous-total</span>
          <span className="text-lg font-extrabold text-ink-900">{subtotal} MRU</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="w-full rounded-full bg-brand-500 py-3 text-sm font-bold text-ink-900 shadow-md transition hover:bg-brand-400"
        >
          Commander
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/client'
import { useCart } from '../../context/CartContext'
import DishImage from '../../components/DishImage'
import QuantityStepper from '../../components/QuantityStepper'

const SIZES = [
  { id: 'small', label: 'Petit', factor: 0.85 },
  { id: 'medium', label: 'Moyen', factor: 1 },
  { id: 'big', label: 'Grand', factor: 1.15 },
]

export default function DishDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, updateQuantity } = useCart()

  const [dish, setDish] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState('medium')

  useEffect(() => {
    setDish(null)
    setNotFound(false)
    setQty(1)
    setSize('medium')
    api
      .get(`/public/dishes/${id}`)
      .then(({ data }) => setDish(data))
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-500">
        Ce plat n'existe pas ou n'est plus disponible.
      </div>
    )
  }

  if (!dish) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-400">Chargement...</div>
  }

  const selectedFactor = SIZES.find((s) => s.id === size)?.factor ?? 1
  const unitPrice = Math.round(Number(dish.price) * selectedFactor)
  const total = unitPrice * qty

  function handleAdd() {
    addItem({
      id: dish.id,
      name: dish.name,
      price: unitPrice,
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurant?.name,
    })
    if (qty > 1) updateQuantity(dish.id, qty)
    navigate('/panier')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md"
        aria-label="Retour"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <DishImage
        src={dish.imageUrl}
        alt={dish.name}
        className="mb-6 h-64 w-full rounded-3xl sm:h-80"
      />

      <p className="text-xs font-bold uppercase tracking-wide text-ink-400">
        {dish.restaurant?.name}
        {dish.category?.name ? ` · ${dish.category.name}` : ''}
      </p>

      <div className="mt-1 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{dish.name}</h1>
        <QuantityStepper
          value={qty}
          onDecrement={() => setQty((q) => Math.max(1, q - 1))}
          onIncrement={() => setQty((q) => q + 1)}
        />
      </div>

      {dish.description && (
        <div className="mt-6">
          <h2 className="mb-1 text-sm font-bold text-ink-900">À propos du plat</h2>
          <p className="text-sm leading-relaxed text-ink-500">{dish.description}</p>
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-bold text-ink-900">Taille</h2>
        <div className="flex gap-2">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSize(s.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                size === s.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-ink-100 text-ink-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs text-ink-400">Prix</p>
            <p className="text-xl font-extrabold text-ink-900">{total} MRU</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full bg-brand-500 px-8 py-3 text-sm font-bold text-ink-900 shadow-md transition hover:bg-brand-400"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import { useCart } from '../../context/CartContext'
import FoodCard from '../../components/FoodCard'

export default function HomePage() {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const { addItem } = useCart()

  useEffect(() => {
    api
      .get('/public/dishes')
      .then(({ data }) => setDishes(data.items ?? data))
      .catch(() => setDishes([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const map = new Map()
    for (const dish of dishes) {
      if (dish.category?.id) map.set(dish.category.id, dish.category.name)
    }
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [dishes])

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory = activeCategory === 'all' || dish.category?.id === activeCategory
      const matchesSearch = dish.name.toLowerCase().includes(search.trim().toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [dishes, search, activeCategory])

  function quickAdd(dish) {
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurant?.name,
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un plat..."
          className="w-full rounded-2xl border border-ink-100 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>

      {/* Promo banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 px-6 py-8">
        <div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-white/15" />
        <div className="absolute -right-2 top-4 h-16 w-16 rounded-full bg-white/10" />
        <p className="relative text-xs font-bold uppercase tracking-wide text-ink-900/70">
          Offre limitée
        </p>
        <h2 className="relative mt-1 max-w-xs text-2xl font-extrabold text-ink-900 sm:text-3xl">
          -20% sur votre première commande
        </h2>
        <button
          type="button"
          className="relative mt-4 rounded-full bg-ink-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-ink-700"
        >
          Commander
        </button>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-lg font-extrabold text-ink-900">Catégories</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === 'all'
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-600 border border-ink-100'
              }`}
            >
              Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === cat.id
                    ? 'bg-ink-900 text-white'
                    : 'bg-white text-ink-600 border border-ink-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular food */}
      <div>
        <h3 className="mb-4 text-lg font-extrabold text-ink-900">Plats populaires</h3>

        {loading && <p className="text-ink-400">Chargement...</p>}

        {!loading && filteredDishes.length === 0 && (
          <p className="text-ink-400">Aucun plat disponible pour le moment.</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredDishes.map((dish) => (
            <FoodCard key={dish.id} dish={dish} onQuickAdd={quickAdd} />
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Clock, ShoppingBag, Truck } from 'lucide-react'
import api from '../../api/client'
import { useCart } from '../../context/CartContext'
import FoodCard from '../../components/FoodCard'
import ReviewsCarousel from '../../components/ReviewsCarousel'
import { t } from '../../i18n'

// Atouts affichés dans la bannière d'accueil
const HIGHLIGHTS = [
  { icon: ShoppingBag, label: 'Sans création de compte' },
  { icon: Truck, label: 'Livraison ou retrait' },
  { icon: Banknote, label: 'Paiement à la réception' },
  { icon: Clock, label: 'Suivi avec votre code' },
]

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
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-400"
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
          placeholder={t('Rechercher un plat...')}
          className="w-full rounded-2xl border border-ink-100 bg-white py-3 ps-11 pe-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>

      {/* Bannière de présentation */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 px-6 py-8 sm:px-8">
        <div className="absolute -bottom-10 -end-8 h-40 w-40 rounded-full bg-white/15" />
        <div className="absolute -end-2 top-4 h-16 w-16 rounded-full bg-white/10" />
        <p className="relative text-xs font-bold uppercase tracking-wide text-ink-900/70">
          {t('Commandez en ligne sur MauriFood')}
        </p>
        <h2 className="relative mt-1 max-w-lg text-2xl font-extrabold text-ink-900 sm:text-3xl">
          {t('Les restaurants de Nouakchott, à portée de main')}
        </h2>
        <p className="relative mt-2 max-w-xl text-sm text-ink-900/80 sm:text-base">
          {t('MauriFood réunit les restaurants de la ville en un seul endroit : parcourez les menus, commandez en quelques clics, puis faites-vous livrer ou retirez votre commande sur place.')}
        </p>
        <ul className="relative mt-4 flex flex-wrap gap-2">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 rounded-full bg-white/30 px-3 py-1 text-xs font-semibold text-ink-900"
            >
              <Icon size={14} />
              {t(label)}
            </li>
          ))}
        </ul>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <a
            href="#plats"
            className="rounded-full bg-ink-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-ink-700"
          >
            {t('Commander')}
          </a>
          <Link
            to="/restaurants"
            className="rounded-full bg-white/80 px-5 py-2 text-sm font-bold text-ink-900 transition hover:bg-white"
          >
            {t('Voir les restaurants')}
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-lg font-extrabold text-ink-900">{t('Catégories')}</h3>
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
              {t('Tout')}
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
      <div id="plats" className="scroll-mt-24">
        <h3 className="mb-4 text-lg font-extrabold text-ink-900">{t('Plats populaires')}</h3>

        {loading && <p className="text-ink-400">{t('Chargement...')}</p>}

        {!loading && filteredDishes.length === 0 && (
          <p className="text-ink-400">{t('Aucun plat disponible pour le moment.')}</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredDishes.map((dish) => (
            <FoodCard key={dish.id} dish={dish} onQuickAdd={quickAdd} />
          ))}
        </div>
      </div>

      <ReviewsCarousel />
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Phone, Search, ShoppingBag, Truck } from 'lucide-react'
import api from '../../api/client'
import { useCart } from '../../context/CartContext'
import FoodCard from '../../components/FoodCard'
import Pagination from '../../components/Pagination'
import { t } from '../../i18n'

const PAGE_SIZE = 12
// Valeur du filtre pour les plats rangés dans aucune catégorie
const NO_CATEGORY = 'none'

const chipClass = (active) =>
  `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
    active ? 'bg-ink-900 text-white' : 'border border-ink-100 bg-white text-ink-600'
  }`

export default function RestaurantPage() {
  const { slug } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const listRef = useRef(null)
  const { addItem } = useCart()

  useEffect(() => {
    api
      .get(`/public/restaurants/${slug}`)
      .then(({ data }) => setRestaurant(data))
      .catch(() => setRestaurant(null))
    setActiveCategory('all')
    setSearch('')
    setPage(1)
  }, [slug])

  const dishes = useMemo(() => restaurant?.dishes ?? [], [restaurant])

  // Seules les catégories qui contiennent au moins un plat disponible sont proposées
  const categories = useMemo(() => {
    const used = new Set(dishes.map((dish) => dish.categoryId))
    const list = (restaurant?.categories ?? [])
      .filter((cat) => used.has(cat.id))
      .map((cat) => ({ id: cat.id, name: cat.name }))
    if (used.has(null) && list.length > 0) list.push({ id: NO_CATEGORY, name: t('Sans catégorie') })
    return list
  }, [restaurant, dishes])

  // Recherche sur le nom et la description, combinée au filtre de catégorie
  const filteredDishes = useMemo(() => {
    const term = search.trim().toLowerCase()
    const categoryId = activeCategory === NO_CATEGORY ? null : activeCategory
    return dishes.filter((dish) => {
      if (activeCategory !== 'all' && dish.categoryId !== categoryId) return false
      if (term) {
        const haystack = `${dish.name} ${dish.description ?? ''}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [dishes, activeCategory, search])

  const pageCount = Math.max(1, Math.ceil(filteredDishes.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedDishes = filteredDishes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function selectCategory(id) {
    setActiveCategory(id)
    setPage(1)
  }

  function changePage(next) {
    setPage(next)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!restaurant) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-center text-ink-400">{t('Chargement...')}</div>
  }

  function quickAdd(dish) {
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-8 flex items-center gap-4 rounded-3xl bg-ink-900 px-6 py-6 text-white">
        {restaurant.logoUrl ? (
          <img
            src={restaurant.logoUrl}
            alt={restaurant.name}
            className="h-16 w-16 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-xl font-extrabold text-ink-900">
            {restaurant.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="mt-1 text-sm text-white/70">{restaurant.description}</p>
          )}
          {(restaurant.address || restaurant.phone) && (
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
              {restaurant.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {restaurant.address}
                </span>
              )}
              {restaurant.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {restaurant.phone}
                </span>
              )}
            </p>
          )}
          {/* Le client sait dès le menu s'il pourra se faire livrer */}
          {restaurant.offersDelivery ? (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
              <Truck className="h-3.5 w-3.5" /> {t('Livraison disponible')}
            </span>
          ) : (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              <ShoppingBag className="h-3.5 w-3.5" /> {t('À emporter uniquement — pas de livraison')}
            </span>
          )}
        </div>
      </div>

      <div ref={listRef} className="scroll-mt-24">
        {/* Recherche et catégories sur une seule ligne (empilées sur mobile) ;
            les catégories défilent horizontalement si elles débordent */}
        {dishes.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative shrink-0 sm:w-64">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder={t('Rechercher un plat...')}
                aria-label={t('Rechercher un plat...')}
                className="w-full rounded-full border border-ink-100 bg-white py-2 ps-10 pe-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => selectCategory('all')}
                  className={chipClass(activeCategory === 'all')}
                >
                  {t('Tout')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(cat.id)}
                    className={chipClass(activeCategory === cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {filteredDishes.length === 0 && (
          <p className="text-ink-400">
            {search.trim() ? t('Aucun plat ne correspond à votre recherche.') : t('Aucun plat disponible.')}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pagedDishes.map((dish) => (
            <FoodCard
              key={dish.id}
              dish={{ ...dish, restaurant: { name: restaurant.name } }}
              onQuickAdd={quickAdd}
            />
          ))}
        </div>

        <div className="mt-6">
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={changePage}
            total={filteredDishes.length}
          />
        </div>
      </div>
    </div>
  )
}

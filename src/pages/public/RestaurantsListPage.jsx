import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Search, ShoppingBag, Truck } from 'lucide-react'
import api from '../../api/client'
import { t } from '../../i18n'

export default function RestaurantsListPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/public/restaurants')
      .then(({ data }) => setRestaurants(data))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false))
  }, [])

  // Recherche sur le nom, la description et l'adresse (quartier)
  const filteredRestaurants = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return restaurants
    return restaurants.filter((restaurant) =>
      `${restaurant.name} ${restaurant.description ?? ''} ${restaurant.address ?? ''}`
        .toLowerCase()
        .includes(term),
    )
  }, [restaurants, search])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold text-ink-900">{t('Restaurants')}</h1>
          <p className="text-sm text-ink-400">{t('Choisissez un restaurant pour voir son menu.')}</p>
        </div>

        {restaurants.length > 0 && (
          <div className="relative shrink-0 sm:w-72">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Rechercher un restaurant...')}
              aria-label={t('Rechercher un restaurant...')}
              className="w-full rounded-full border border-ink-100 bg-white py-2 ps-10 pe-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        )}
      </div>

      {loading && <p className="text-ink-400">{t('Chargement...')}</p>}

      {!loading && restaurants.length === 0 && (
        <p className="text-ink-400">{t('Aucun restaurant disponible pour le moment.')}</p>
      )}

      {restaurants.length > 0 && filteredRestaurants.length === 0 && (
        <p className="text-ink-400">{t('Aucun restaurant ne correspond à votre recherche.')}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRestaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/restaurants/${restaurant.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-xl font-extrabold text-ink-900">
                {restaurant.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-bold text-ink-900">{restaurant.name}</h2>
              {restaurant.description && (
                <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">
                  {restaurant.description}
                </p>
              )}
              {restaurant.address && (
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </p>
              )}
              {restaurant.phone && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {restaurant.phone}
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-brand-600">
                  {restaurant.dishCount > 1
                    ? t('{n} plats', { n: restaurant.dishCount })
                    : t('{n} plat', { n: restaurant.dishCount })}
                </span>
                {restaurant.offersDelivery ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                    <Truck className="h-3 w-3" /> {t('Livraison disponible')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 text-xs font-semibold text-ink-500">
                    <ShoppingBag className="h-3 w-3" /> {t('À emporter uniquement')}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

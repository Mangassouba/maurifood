import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'

export default function RestaurantsListPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/public/restaurants')
      .then(({ data }) => setRestaurants(data))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">Restaurants</h1>
      <p className="mb-6 text-sm text-ink-400">Choisissez un restaurant pour voir son menu.</p>

      {loading && <p className="text-ink-400">Chargement...</p>}

      {!loading && restaurants.length === 0 && (
        <p className="text-ink-400">Aucun restaurant disponible pour le moment.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
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
              <p className="mt-1 text-xs font-semibold text-brand-600">
                {restaurant.dishCount} {restaurant.dishCount > 1 ? 'plats' : 'plat'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/client'
import { useCart } from '../../context/CartContext'
import FoodCard from '../../components/FoodCard'

export default function RestaurantPage() {
  const { slug } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const { addItem } = useCart()

  useEffect(() => {
    api
      .get(`/public/restaurants/${slug}`)
      .then(({ data }) => setRestaurant(data))
      .catch(() => setRestaurant(null))
  }, [slug])

  if (!restaurant) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-center text-ink-400">Chargement...</div>
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
              {restaurant.address && <span>📍 {restaurant.address}</span>}
              {restaurant.phone && <span>📞 {restaurant.phone}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {restaurant.dishes?.map((dish) => (
          <FoodCard
            key={dish.id}
            dish={{ ...dish, restaurant: { name: restaurant.name } }}
            onQuickAdd={quickAdd}
          />
        ))}
      </div>
    </div>
  )
}

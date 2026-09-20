import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DishImage from './DishImage'

export default function FoodCard({ dish, onQuickAdd }) {
  return (
    <Link
      to={`/plats/${dish.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-32 sm:h-36">
        <DishImage src={dish.imageUrl} alt={dish.name} className="h-full w-full" />
        {dish.category?.name && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink-600 shadow-sm">
            {dish.category.name}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onQuickAdd(dish)
          }}
          className="absolute -bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-ink-900 shadow-md transition hover:bg-brand-400"
          aria-label="Ajouter au panier"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
          {dish.restaurant?.name}
        </p>
        <h3 className="line-clamp-1 text-sm font-bold text-ink-900">{dish.name}</h3>
        <p className="mt-auto text-sm font-extrabold text-brand-600">{dish.price} MRU</p>
      </div>
    </Link>
  )
}

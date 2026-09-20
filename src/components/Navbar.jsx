import { Link } from 'react-router-dom'
import { ShoppingCart, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()

  return (
    <nav className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
            <UtensilsCrossed className="h-5 w-5 text-ink-900" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">MauriFood</span>
        </Link>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            to="/restaurants"
            className="hidden font-medium text-ink-600 hover:text-brand-600 sm:inline"
          >
            Restaurants
          </Link>

          <Link
            to="/mes-commandes"
            className="hidden font-medium text-ink-600 hover:text-brand-600 sm:inline"
          >
            Mes commandes
          </Link>

          {!user && (
            <Link
              to="/login"
              className="hidden font-medium text-ink-600 hover:text-brand-600 sm:inline"
            >
              Espace restaurant
            </Link>
          )}

          {user?.role === 'restaurant_owner' && (
            <Link
              to="/dashboard"
              className="hidden font-medium text-ink-600 hover:text-brand-600 sm:inline"
            >
              Mon espace
            </Link>
          )}
          {user?.role === 'super_admin' && (
            <Link
              to="/admin"
              className="hidden font-medium text-ink-600 hover:text-brand-600 sm:inline"
            >
              Administration
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={logout}
              className="hidden font-medium text-ink-600 hover:text-brand-600 sm:inline"
            >
              Déconnexion
            </button>
          )}

          <Link
            to="/panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white transition hover:bg-ink-700"
            aria-label="Panier"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-ink-900">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}

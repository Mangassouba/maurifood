import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LogOut, Menu, ShoppingCart, UtensilsCrossed, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { t } from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'

const desktopLinkClass = 'hidden font-medium text-ink-600 hover:text-brand-600 sm:inline'

const mobileLinkClass = ({ isActive }) =>
  `block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  // Liens communs au menu ordinateur et au menu mobile
  const links = [
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/mes-commandes', label: 'Mes commandes' },
    !user && { to: '/login', label: 'Espace restaurant' },
    user?.role === 'restaurant_owner' && { to: '/dashboard', label: 'Mon espace' },
    user?.role === 'super_admin' && { to: '/admin', label: 'Administration' },
  ].filter(Boolean)

  // Le menu mobile se ferme avec Échap ou un clic en dehors de la barre
  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    function onPointerDown(e) {
      if (!navRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav ref={navRef} className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
            <UtensilsCrossed className="h-5 w-5 text-ink-900" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">MauriFood</span>
        </Link>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={desktopLinkClass}>
              {t(link.label)}
            </Link>
          ))}
          {user && (
            <button type="button" onClick={logout} className={desktopLinkClass}>
              {t('Déconnexion')}
            </button>
          )}

          <LanguageSwitcher />

          <Link
            to="/panier"
            onClick={closeMenu}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white transition hover:bg-ink-700"
            aria-label={t('Panier')}
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-ink-900">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t('Fermer le menu') : t('Ouvrir le menu')}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-900 transition hover:bg-ink-50 sm:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="public-mobile-menu" className="border-t border-ink-100 bg-white px-4 py-3 shadow-lg sm:hidden">
          <NavLink to="/" end onClick={closeMenu} className={mobileLinkClass}>
            {t('Accueil')}
          </NavLink>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={closeMenu} className={mobileLinkClass}>
              {t(link.label)}
            </NavLink>
          ))}
          {user && (
            <button
              type="button"
              onClick={() => {
                closeMenu()
                logout()
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-ink-100 px-3 py-2.5 text-start text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t('Déconnexion')}
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, LogOut, Menu, PanelLeftClose, PanelLeftOpen, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getLang, t } from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationBell from './NotificationBell'
import RestaurantNotificationBell from './RestaurantNotificationBell'

const COLLAPSED_KEY = 'maurifood.sidebarCollapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

const ROLE_LABELS = {
  restaurant_owner: 'Propriétaire',
  staff: 'Équipe',
  super_admin: 'Super admin',
}

export default function AdminShell({ sectionLabel, links, banner }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Barre latérale réduite aux icônes (ordinateur uniquement ; sur mobile c'est un tiroir)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch {
      // stockage indisponible : le choix ne sera simplement pas mémorisé
    }
  }, [collapsed])

  // Libellés masqués seulement en mode réduit sur grand écran
  const labelClass = collapsed ? 'lg:hidden' : ''
  // Le tiroir fermé sort de l'écran du côté où il est ancré (droite en arabe)
  const drawerHidden = getLang() === 'ar' ? 'translate-x-full' : '-translate-x-full'

  const activeLink = links.find((link) =>
    link.end ? location.pathname === link.to : location.pathname.startsWith(link.to),
  )
  const initial = (user?.name || user?.email || '?').slice(0, 1).toUpperCase()

  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside
        className={`fixed inset-y-0 start-0 z-30 flex w-64 shrink-0 flex-col bg-ink-900 text-white transition-all duration-200 lg:translate-x-0 ${collapsed ? 'lg:w-20' : ''} ${
          drawerOpen ? 'translate-x-0' : drawerHidden
        }`}
      >
        <Link to="/" className={`flex h-16 items-center gap-2 px-5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
            <UtensilsCrossed className="h-5 w-5 text-ink-900" />
          </span>
          <span className={`text-lg font-extrabold tracking-tight ${labelClass}`}>MauriFood</span>
        </Link>

        <p className={`px-5 pb-2 pt-2 text-xs font-bold uppercase tracking-wide text-white/40 ${labelClass}`}>
          {t(sectionLabel)}
        </p>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setDrawerOpen(false)}
              title={collapsed ? t(link.label) : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${collapsed ? 'lg:justify-center' : ''} ${
                  isActive ? 'bg-brand-500 text-ink-900' : 'text-white/70 hover:bg-white/10'
                }`
              }
            >
              <link.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className={labelClass}>{t(link.label)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-white/10 p-3">
          <Link
            to="/"
            title={collapsed ? t('Retour au site') : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 ${collapsed ? 'lg:justify-center' : ''}`}
          >
            <Home className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={labelClass}>{t('Retour au site')}</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            title={collapsed ? t('Déconnexion') : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-semibold text-white/70 hover:bg-white/10 ${collapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut className="h-5 w-5 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
            <span className={labelClass}>{t('Déconnexion')}</span>
          </button>
        </div>
      </aside>

      {drawerOpen && (
        <button
          type="button"
          aria-label={t('Fermer le menu')}
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
        />
      )}

      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-200 ${collapsed ? 'lg:ps-20' : 'lg:ps-64'}`}>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 lg:hidden"
              aria-label={t('Ouvrir le menu')}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 lg:flex"
              aria-label={collapsed ? t('Agrandir le menu') : t('Réduire le menu')}
              title={collapsed ? t('Agrandir le menu') : t('Réduire le menu')}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5 rtl:-scale-x-100" />
              ) : (
                <PanelLeftClose className="h-5 w-5 rtl:-scale-x-100" />
              )}
            </button>
            <h1 className="text-base font-bold text-ink-900 sm:text-lg">
              {t(activeLink?.label ?? sectionLabel)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user?.role === 'super_admin' && <NotificationBell />}
            {['restaurant_owner', 'staff'].includes(user?.role) && <RestaurantNotificationBell />}
            <div className="hidden text-end sm:block">
              <p className="text-sm font-semibold leading-tight text-ink-900">
                {user?.name || user?.email}
              </p>
              <p className="text-xs leading-tight text-ink-400">
                {ROLE_LABELS[user?.role] ? t(ROLE_LABELS[user?.role]) : user?.role}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {initial}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            {banner}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

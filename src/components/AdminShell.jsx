import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const ROLE_LABELS = {
  restaurant_owner: 'Propriétaire',
  staff: 'Équipe',
  super_admin: 'Super admin',
}

export default function AdminShell({ sectionLabel, links, banner }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeLink = links.find((link) =>
    link.end ? location.pathname === link.to : location.pathname.startsWith(link.to),
  )
  const initial = (user?.name || user?.email || '?').slice(0, 1).toUpperCase()

  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col bg-ink-900 text-white transition-transform duration-200 lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" className="flex h-16 items-center gap-2 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg">
            🍔
          </span>
          <span className="text-lg font-extrabold tracking-tight">MauriFood</span>
        </Link>

        <p className="px-5 pb-2 pt-2 text-xs font-bold uppercase tracking-wide text-white/40">
          {sectionLabel}
        </p>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-500 text-ink-900' : 'text-white/70 hover:bg-white/10'
                }`
              }
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-white/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10"
          >
            <span aria-hidden="true">🏠</span>
            Retour au site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/70 hover:bg-white/10"
          >
            <span aria-hidden="true">↩</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {drawerOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base font-bold text-ink-900 sm:text-lg">
              {activeLink?.label ?? sectionLabel}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'super_admin' && <NotificationBell />}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink-900">
                {user?.name || user?.email}
              </p>
              <p className="text-xs leading-tight text-ink-400">
                {ROLE_LABELS[user?.role] ?? user?.role}
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

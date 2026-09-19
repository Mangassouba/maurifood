import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  function load() {
    api
      .get('/admin/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications([]))
  }

  useEffect(load, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markRead(id) {
    await api.put(`/admin/notifications/${id}/read`)
    load()
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-50"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-ink-100 bg-white p-2 shadow-lg">
          <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
            Demandes de renouvellement
          </p>
          {notifications.length === 0 && (
            <p className="px-2 py-3 text-sm text-ink-400">Aucune notification.</p>
          )}
          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl p-2.5 text-sm ${n.isRead ? 'text-ink-400' : 'bg-brand-50 text-ink-900'}`}
              >
                <p className="font-medium">{n.message}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Voir dans Restaurants
                  </Link>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="text-xs font-semibold text-ink-500 hover:underline"
                    >
                      Marquer comme traité
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

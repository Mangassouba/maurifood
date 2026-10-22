import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ClipboardList, CreditCard } from 'lucide-react'
import api from '../api/client'

const REFRESH_MS = 30 * 1000

function timeAgo(value) {
  const minutes = Math.floor((Date.now() - new Date(value)) / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return new Date(value).toLocaleDateString('fr-FR')
}

export default function RestaurantNotificationBell() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  function load() {
    api
      .get('/dashboard/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications([]))
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function openNotification(n) {
    setOpen(false)
    if (!n.isRead) {
      setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
      api.put(`/dashboard/notifications/${n.id}/read`).catch(load)
    }
    if (n.link) navigate(n.link)
  }

  async function markAllRead() {
    setNotifications((list) => list.map((x) => ({ ...x, isRead: true })))
    await api.put('/dashboard/notifications/read-all').catch(load)
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
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink-100 bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <p className="px-2 py-3 text-sm text-ink-400">Aucune notification.</p>
          )}
          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = n.type.startsWith('subscription') ? CreditCard : ClipboardList
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openNotification(n)}
                  className={`flex gap-2.5 rounded-xl p-2.5 text-left text-sm transition ${
                    n.isRead ? 'text-ink-400 hover:bg-ink-50' : 'bg-brand-50 text-ink-900 hover:bg-brand-100'
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${n.isRead ? '' : 'text-brand-600'}`} />
                  <span>
                    <span className="block font-medium">{n.message}</span>
                    <span className="text-xs text-ink-400">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

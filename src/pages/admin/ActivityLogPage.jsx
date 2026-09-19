import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import { cardClass, inputClass } from '../../styles/ui'

const ACTION_ICONS = {
  'restaurant.registered': '🆕',
  'restaurant.activated': '✅',
  'restaurant.deactivated': '⛔',
  'restaurant.profile_updated': '✏️',
  'subscription.updated': '💳',
  'subscription.expired': '⏰',
  'renewal.requested': '🔔',
  'auth.login': '🔓',
  'auth.logout': '🔒',
  'dish.created': '➕',
  'dish.updated': '✏️',
  'dish.deleted': '🗑️',
  'category.created': '➕',
  'category.deleted': '🗑️',
  'delivery_zone.created': '➕',
  'delivery_zone.updated': '✏️',
  'delivery_zone.deleted': '🗑️',
  'staff.created': '👤',
  'staff.deleted': '🗑️',
}

const FILTERS = [
  { value: 'all', label: 'Tout' },
  { value: 'auth', label: 'Connexions' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'subscription', label: 'Abonnements' },
  { value: 'renewal', label: 'Renouvellements' },
  { value: 'dish', label: 'Plats' },
  { value: 'category', label: 'Catégories' },
  { value: 'delivery_zone', label: 'Livraison' },
  { value: 'staff', label: 'Équipe' },
]

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days} j`
  return new Date(dateString).toLocaleDateString('fr-FR')
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api
      .get('/admin/activity-logs')
      .then(({ data }) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs
    return logs.filter((log) => log.action.startsWith(filter))
  }, [logs, filter])

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">Journal d'activité</h1>
      <p className="mb-4 text-sm text-ink-400">
        Inscriptions, connexions/déconnexions, ajouts/modifications/suppressions et abonnements
        (100 derniers événements).
      </p>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={`${inputClass} mb-6 w-auto`}
      >
        {FILTERS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {loading && <p className="text-ink-400">Chargement...</p>}
      {!loading && filteredLogs.length === 0 && (
        <p className="text-ink-400">Aucune activité pour le moment.</p>
      )}

      <div className={`${cardClass} divide-y divide-ink-50 p-0`}>
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg">
              {ACTION_ICONS[log.action] ?? '•'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-900">{log.message}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                <span>{formatRelativeTime(log.createdAt)}</span>
                {log.restaurant?.name && (
                  <>
                    <span>·</span>
                    <span>{log.restaurant.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

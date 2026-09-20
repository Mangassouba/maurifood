import { useEffect, useMemo, useState } from 'react'
import {
  Ban,
  Bell,
  CheckCircle2,
  CreditCard,
  Clock,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
  Dot,
} from 'lucide-react'
import api from '../../api/client'
import Pagination from '../../components/Pagination'
import { cardClass, inputClass } from '../../styles/ui'

const PAGE_SIZE = 15

const ACTION_ICONS = {
  'restaurant.registered': Sparkles,
  'restaurant.activated': CheckCircle2,
  'restaurant.deactivated': Ban,
  'restaurant.profile_updated': Pencil,
  'subscription.updated': CreditCard,
  'subscription.expired': Clock,
  'renewal.requested': Bell,
  'auth.login': LogIn,
  'auth.logout': LogOut,
  'dish.created': Plus,
  'dish.updated': Pencil,
  'dish.deleted': Trash2,
  'category.created': Plus,
  'category.deleted': Trash2,
  'delivery_zone.created': Plus,
  'delivery_zone.updated': Pencil,
  'delivery_zone.deleted': Trash2,
  'staff.created': UserPlus,
  'staff.deleted': Trash2,
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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api
      .get('/admin/activity-logs')
      .then(({ data }) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase()
    return logs.filter((log) => {
      if (filter !== 'all' && !log.action.startsWith(filter)) return false
      if (term) {
        const haystack = `${log.message} ${log.restaurant?.name ?? ''}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [logs, filter, search])

  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">Journal d'activité</h1>
      <p className="mb-4 text-sm text-ink-400">
        Inscriptions, connexions/déconnexions, ajouts/modifications/suppressions et abonnements
        (100 derniers événements).
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          placeholder="Rechercher dans le journal..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-48 shrink-0 sm:w-72`}
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-36 shrink-0`}
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-ink-400">Chargement...</p>}
      {!loading && filteredLogs.length === 0 && (
        <p className="text-ink-400">Aucune activité ne correspond à votre recherche.</p>
      )}

      <div className={`${cardClass} divide-y divide-ink-50 p-0`}>
        {pagedLogs.map((log) => {
          const Icon = ACTION_ICONS[log.action] ?? Dot
          return (
          <div key={log.id} className="flex items-start gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
              <Icon className="h-4 w-4 text-brand-700" />
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
          )
        })}
        <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} total={filteredLogs.length} />
      </div>
    </div>
  )
}

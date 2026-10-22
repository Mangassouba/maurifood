import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import {
  formatSubscriptionDate,
  isSubscriptionExpired,
  remainingLabel,
} from '../../lib/subscription'
import { badgeClass, btnDark, btnGhost, cardClass, inputClass } from '../../styles/ui'

const STATUS_OPTIONS = ['trialing', 'active', 'past_due', 'cancelled']
const PAGE_SIZE = 8

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [plans, setPlans] = useState([])
  const [notifications, setNotifications] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ planId: '', status: 'active', renew: false })

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  function load() {
    api
      .get('/admin/restaurants')
      .then(({ data }) => setRestaurants(data))
      .catch(() => setRestaurants([]))
    api
      .get('/admin/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications([]))
  }

  // Dernière demande de renouvellement non traitée de chaque restaurant.
  const pendingRequests = useMemo(() => {
    const byRestaurant = {}
    for (const n of notifications) {
      if (n.isRead || !n.planId) continue
      const current = byRestaurant[n.restaurantId]
      if (!current || new Date(n.createdAt) > new Date(current.createdAt)) {
        byRestaurant[n.restaurantId] = n
      }
    }
    return byRestaurant
  }, [notifications])

  useEffect(() => {
    load()
    api
      .get('/admin/plans')
      .then(({ data }) => setPlans(data))
      .catch(() => setPlans([]))
  }, [])

  async function toggleActive(restaurant) {
    await api.put(`/admin/restaurants/${restaurant.id}/active`, {
      isActive: !restaurant.isActive,
    })
    load()
  }

  function startEditSubscription(restaurant) {
    setEditingId(restaurant.id)
    setForm({
      planId:
        pendingRequests[restaurant.id]?.planId ??
        restaurant.subscription?.planId ??
        plans[0]?.id ??
        '',
      // Une demande en attente correspond à un paiement à valider.
      status: pendingRequests[restaurant.id]
        ? 'active'
        : (restaurant.subscription?.status ?? 'active'),
      // Coché d'office quand il y a un paiement à valider ou plus de période en cours.
      renew:
        Boolean(pendingRequests[restaurant.id]) ||
        !restaurant.subscription?.currentPeriodEnd ||
        isSubscriptionExpired(restaurant.subscription),
    })
  }

  async function saveSubscription(restaurantId) {
    await api.put(`/admin/restaurants/${restaurantId}/subscription`, {
      planId: Number(form.planId),
      status: form.status,
      renew: form.status === 'active' && form.renew,
    })
    setEditingId(null)
    load()
  }

  const filteredRestaurants = useMemo(() => {
    const term = search.trim().toLowerCase()
    return restaurants.filter((r) => {
      if (term && !r.name.toLowerCase().includes(term)) return false
      if (activeFilter === 'active' && !r.isActive) return false
      if (activeFilter === 'inactive' && r.isActive) return false
      if (statusFilter !== 'all' && r.subscription?.status !== statusFilter) return false
      return true
    })
  }, [restaurants, search, activeFilter, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredRestaurants.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const editingRestaurant = restaurants.find((r) => r.id === editingId)
  const selectedPlan = plans.find((p) => p.id === Number(form.planId))
  const currentEnd = editingRestaurant?.subscription?.currentPeriodEnd

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          placeholder="Rechercher un restaurant..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-40 shrink-0 sm:w-64`}
        />
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-36 shrink-0`}
        >
          <option value="all">Actif et inactif</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className={`${inputClass} w-36 shrink-0`}
        >
          <option value="all">Tous les abonnements</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {pagedRestaurants.map((r) => (
          <div key={r.id} className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink-900">{r.name}</p>
                  <span className={badgeClass(r.isActive ? 'green' : 'ink')}>
                    {r.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  Plan : {r.subscription?.plan?.name ?? 'Aucun'} · Statut abo. :{' '}
                  {r.subscription?.status ?? '-'}
                </p>
                {r.subscription?.currentPeriodEnd && (
                  <p className="mt-0.5 text-sm text-ink-500">
                    {r.subscription.currentPeriodStart &&
                      `Du ${formatSubscriptionDate(r.subscription.currentPeriodStart)} `}
                    {r.subscription.currentPeriodStart ? 'au' : "Jusqu'au"}{' '}
                    {formatSubscriptionDate(r.subscription.currentPeriodEnd)} ·{' '}
                    <span
                      className={
                        isSubscriptionExpired(r.subscription)
                          ? 'font-semibold text-red-600'
                          : 'font-semibold text-ink-900'
                      }
                    >
                      {remainingLabel(r.subscription.currentPeriodEnd)}
                    </span>
                  </p>
                )}
                {pendingRequests[r.id] && (
                  <span className={`${badgeClass('brand')} mt-1`}>
                    Demande en attente : {pendingRequests[r.id].plan?.name}
                  </span>
                )}
                <p className="mt-0.5 text-sm text-ink-500">
                  Tél. : {r.phone || '-'} · Adresse : {r.address || '-'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(r)}
                  className={r.isActive ? btnGhost : btnDark}
                >
                  {r.isActive ? 'Désactiver' : 'Activer'}
                </button>
                <button type="button" onClick={() => startEditSubscription(r)} className={btnGhost}>
                  Abonnement
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredRestaurants.length === 0 && (
          <p className="text-ink-400">Aucun restaurant ne correspond à votre recherche.</p>
        )}
      </div>

      {pageCount > 1 && (
        <div className={`${cardClass} mt-3 p-0`}>
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
            total={filteredRestaurants.length}
          />
        </div>
      )}

      <Modal
        open={Boolean(editingRestaurant)}
        onClose={() => setEditingId(null)}
        title={editingRestaurant ? `Abonnement — ${editingRestaurant.name}` : ''}
      >
        <div className="flex flex-col gap-3">
          {editingRestaurant?.subscription?.currentPeriodEnd && (
            <p className="text-sm text-ink-500">
              Période actuelle : jusqu'au{' '}
              <strong className="text-ink-900">
                {formatSubscriptionDate(editingRestaurant.subscription.currentPeriodEnd)}
              </strong>{' '}
              ({remainingLabel(editingRestaurant.subscription.currentPeriodEnd)})
            </p>
          )}
          <select
            value={form.planId}
            onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
            className={inputClass}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.price} MRU
              </option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {editingRestaurant && pendingRequests[editingRestaurant.id] && (
            <p className="text-sm text-ink-500">
              Formule demandée par le restaurant :{' '}
              <strong className="text-ink-900">
                {pendingRequests[editingRestaurant.id].plan?.name}
              </strong>
            </p>
          )}
          {form.status === 'active' && selectedPlan && (
            <label className="flex items-start gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={form.renew}
                onChange={(e) => setForm((f) => ({ ...f, renew: e.target.checked }))}
                className="mt-0.5 h-4 w-4 accent-ink-900"
              />
              <span>
                <span className="font-semibold text-ink-900">Prolonger la période</span>
                <span className="block text-ink-500">
                  {form.renew
                    ? `${selectedPlan.durationMonths} mois ${
                        currentEnd && new Date(currentEnd) > new Date()
                          ? `ajoutés après le ${formatSubscriptionDate(currentEnd)}`
                          : "à partir d'aujourd'hui"
                      }.`
                    : currentEnd
                      ? `Les dates actuelles sont conservées (fin le ${formatSubscriptionDate(currentEnd)}).`
                      : 'Aucune période ne sera définie.'}
                </span>
              </span>
            </label>
          )}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => saveSubscription(editingId)} className={btnDark}>
              Enregistrer
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="text-sm text-ink-500">
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

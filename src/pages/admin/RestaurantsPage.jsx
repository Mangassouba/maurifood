import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { badgeClass, btnDark, btnGhost, cardClass, inputClass } from '../../styles/ui'

const STATUS_OPTIONS = ['trialing', 'active', 'past_due', 'cancelled']
const PAGE_SIZE = 8

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [plans, setPlans] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ planId: '', status: 'active' })

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  function load() {
    api
      .get('/admin/restaurants')
      .then(({ data }) => setRestaurants(data))
      .catch(() => setRestaurants([]))
  }

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
      planId: restaurant.subscription?.planId ?? plans[0]?.id ?? '',
      status: restaurant.subscription?.status ?? 'active',
    })
  }

  async function saveSubscription(restaurantId) {
    await api.put(`/admin/restaurants/${restaurantId}/subscription`, {
      planId: Number(form.planId),
      status: form.status,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

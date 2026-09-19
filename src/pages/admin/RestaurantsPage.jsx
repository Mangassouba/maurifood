import { useEffect, useState } from 'react'
import api from '../../api/client'
import { badgeClass, btnDark, btnGhost, cardClass, inputClass } from '../../styles/ui'

const STATUS_OPTIONS = ['trialing', 'active', 'past_due', 'cancelled']

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [plans, setPlans] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ planId: '', status: 'active' })

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

  return (
    <div>
      <div className="flex flex-col gap-3">
        {restaurants.map((r) => (
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

            {editingId === r.id && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                <select
                  value={form.planId}
                  onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
                  className={`${inputClass} w-auto`}
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
                  className={`${inputClass} w-auto`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => saveSubscription(r.id)} className={btnDark}>
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm text-ink-500"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        ))}
        {restaurants.length === 0 && (
          <p className="text-ink-400">Aucun restaurant pour le moment.</p>
        )}
      </div>
    </div>
  )
}

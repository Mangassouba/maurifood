import { useEffect, useState } from 'react'
import api from '../../api/client'
import { btnDanger, btnDark, btnPrimary, cardClass, inputClass } from '../../styles/ui'

const EMPTY_FORM = { zoneName: '', fee: '', estimatedTimeMinutes: '' }

export default function DeliveryPage() {
  const [zones, setZones] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function load() {
    api
      .get('/dashboard/delivery-zones')
      .then(({ data }) => setZones(data))
      .catch(() => setZones([]))
  }

  useEffect(load, [])

  async function handleSubmit(e) {
    e.preventDefault()
    await api.post('/dashboard/delivery-zones', {
      zoneName: form.zoneName,
      fee: form.fee,
      estimatedTimeMinutes: form.estimatedTimeMinutes ? Number(form.estimatedTimeMinutes) : null,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    load()
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette zone ?')) return
    await api.delete(`/dashboard/delivery-zones/${id}`)
    load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button type="button" onClick={() => setShowForm((v) => !v)} className={btnPrimary}>
          Nouvelle zone
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${cardClass} mb-6 flex flex-col gap-3`}>
          <input
            placeholder="Nom de la zone"
            value={form.zoneName}
            onChange={(e) => setForm((f) => ({ ...f, zoneName: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Frais de livraison (MRU)"
            value={form.fee}
            onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            type="number"
            placeholder="Délai estimé (minutes)"
            value={form.estimatedTimeMinutes}
            onChange={(e) => setForm((f) => ({ ...f, estimatedTimeMinutes: e.target.value }))}
            className={inputClass}
          />
          <button type="submit" className={`${btnDark} self-start`}>
            Créer
          </button>
        </form>
      )}

      <div className={`${cardClass} overflow-x-auto p-0`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Frais</th>
              <th className="px-4 py-3">Délai</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-semibold text-ink-900">{zone.zoneName}</td>
                <td className="px-4 py-3 text-ink-600">{zone.fee} MRU</td>
                <td className="px-4 py-3 text-ink-600">
                  {zone.estimatedTimeMinutes ? `${zone.estimatedTimeMinutes} min` : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => handleDelete(zone.id)} className={btnDanger}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {zones.length === 0 && <p className="px-4 py-6 text-ink-400">Aucune zone pour le moment.</p>}
      </div>
    </div>
  )
}

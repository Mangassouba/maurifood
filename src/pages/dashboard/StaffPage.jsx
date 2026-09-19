import { useEffect, useState } from 'react'
import api from '../../api/client'
import { badgeClass, btnDanger, btnDark, btnPrimary, cardClass, inputClass } from '../../styles/ui'

const EMPTY_FORM = { name: '', email: '', password: '' }

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function load() {
    api
      .get('/dashboard/users')
      .then(({ data }) => setStaff(data))
      .catch(() => setStaff([]))
  }

  useEffect(load, [])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/dashboard/users', form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Impossible de créer cet utilisateur')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Retirer cet utilisateur de votre équipe ?')) return
    await api.delete(`/dashboard/users/${id}`)
    load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink-900">Équipe</h1>
        <button type="button" onClick={() => setShowForm((v) => !v)} className={btnPrimary}>
          Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${cardClass} mb-6 flex flex-col gap-3`}>
          <input
            placeholder="Nom"
            value={form.name}
            onChange={update('name')}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update('email')}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={update('password')}
            className={inputClass}
            required
            minLength={6}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={loading} className={btnDark}>
              {loading ? 'Création...' : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-500">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className={`${cardClass} overflow-x-auto p-0`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-semibold text-ink-900">{member.name || '-'}</td>
                <td className="px-4 py-3 text-ink-600">{member.email}</td>
                <td className="px-4 py-3">
                  <span className={badgeClass('ink')}>Équipe</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => handleDelete(member.id)} className={btnDanger}>
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <p className="px-4 py-6 text-ink-400">Aucun membre d'équipe pour le moment.</p>
        )}
      </div>
    </div>
  )
}

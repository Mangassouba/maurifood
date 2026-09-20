import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { badgeClass, btnDanger, btnDark, btnPrimary, cardClass, inputClass } from '../../styles/ui'

const EMPTY_FORM = { name: '', email: '', password: '' }
const PAGE_SIZE = 8

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

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

  const filteredStaff = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return staff
    return staff.filter((member) =>
      `${member.name ?? ''} ${member.email}`.toLowerCase().includes(term),
    )
  }, [staff, search])

  const pageCount = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedStaff = filteredStaff.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink-900">Équipe</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className={`${inputClass} w-56`}
          />
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY_FORM)
              setError('')
              setShowForm(true)
            }}
            className={btnPrimary}
          >
            Nouvel utilisateur
          </button>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvel utilisateur">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
      </Modal>

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
            {pagedStaff.map((member) => (
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
        {filteredStaff.length === 0 && (
          <p className="px-4 py-6 text-ink-400">Aucun membre d'équipe ne correspond à votre recherche.</p>
        )}
        <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} total={filteredStaff.length} />
      </div>
    </div>
  )
}

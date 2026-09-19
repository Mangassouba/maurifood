import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { btnPrimary, cardClass, inputClass } from '../../styles/ui'

const EMPTY_FORM = { restaurantName: '', name: '', email: '', password: '' }

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Impossible de créer le compte')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
          ✓
        </span>
        <h1 className="mb-2 text-xl font-extrabold text-ink-900">Demande envoyée</h1>
        <p className="text-sm text-ink-500">
          Votre compte a été créé. Pour activer votre restaurant, choisissez une formule (1, 3, 6
          ou 12 mois à partir de 1 500 MRU/mois) et envoyez le paiement via{' '}
          <strong className="text-ink-900">Bankily</strong> ou{' '}
          <strong className="text-ink-900">Masrivi</strong> au numéro{' '}
          <strong className="text-ink-900">44896920</strong>, puis contactez l'administrateur.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-ink-700"
        >
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">Inscrire mon restaurant</h1>
      <p className="mb-6 text-sm text-ink-400">
        Créez votre compte pour commencer à vendre sur MauriFood.
      </p>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
        <input
          placeholder="Nom du restaurant"
          value={form.restaurantName}
          onChange={update('restaurantName')}
          className={inputClass}
          required
        />
        <input
          placeholder="Votre nom"
          value={form.name}
          onChange={update('name')}
          className={inputClass}
          required
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
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? 'Envoi...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Connectez-vous
        </Link>
      </p>
    </div>
  )
}

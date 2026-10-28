import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import api from '../../api/client'
import PasswordInput from '../../components/PasswordInput'
import { btnPrimary, cardClass, inputClass } from '../../styles/ui'
import { t } from '../../i18n'

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
      setError(err.response?.data?.error ?? t('Impossible de créer le compte'))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
          <Check className="h-7 w-7 text-brand-700" />
        </span>
        <h1 className="mb-2 text-xl font-extrabold text-ink-900">{t('Compte activé')}</h1>
        <p className="text-sm text-ink-500">
          {t('Votre restaurant est actif avec un essai gratuit de 15 jours. Pour continuer après l’essai, choisissez une formule (1, 3, 6 ou 12 mois à partir de 1 500 MRU/mois) et envoyez le paiement via')}{' '}
          <strong className="text-ink-900">Bankily</strong> {t('ou')}{' '}
          <strong className="text-ink-900">Masrivi</strong> {t('au numéro')}{' '}
          <strong className="text-ink-900">44896920</strong>{t(", puis contactez l'administrateur.")}
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-ink-700"
        >
          {t('Retour à la connexion')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">{t('Inscrire mon restaurant')}</h1>
      <p className="mb-6 text-sm text-ink-400">
        {t('Créez votre compte pour commencer à vendre sur MauriFood.')}
      </p>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
        <input
          placeholder={t('Nom du restaurant')}
          value={form.restaurantName}
          onChange={update('restaurantName')}
          className={inputClass}
          required
        />
        <input
          placeholder={t('Votre nom')}
          value={form.name}
          onChange={update('name')}
          className={inputClass}
          required
        />
        <input
          type="email"
          placeholder={t('Email')}
          value={form.email}
          onChange={update('email')}
          className={inputClass}
          required
        />
        <PasswordInput
          placeholder={t('Mot de passe')}
          value={form.password}
          onChange={update('password')}
          autoComplete="new-password"
          required
          minLength={6}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? t('Envoi...') : t('Créer mon compte')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {t('Déjà inscrit ?')}{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          {t('Connectez-vous')}
        </Link>
      </p>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PasswordInput from '../../components/PasswordInput'
import { btnDark, cardClass, inputClass } from '../../styles/ui'
import { t } from '../../i18n'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'super_admin') navigate('/admin')
      else navigate('/dashboard')
    } catch {
      setError(t('Identifiants invalides'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">{t('Espace restaurant')}</h1>
      <p className="mb-6 text-sm text-ink-400">{t('Connectez-vous pour gérer votre restaurant.')}</p>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
        <input
          type="email"
          placeholder={t('Email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
        <PasswordInput
          placeholder={t('Mot de passe')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className={btnDark}>
          {loading ? t('Connexion...') : t('Se connecter')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {t('Vous gérez un restaurant ?')}{' '}
        <Link to="/inscription" className="font-semibold text-brand-600 hover:underline">
          {t('Inscrivez-le')}
        </Link>
      </p>
    </div>
  )
}

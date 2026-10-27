import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { inputClass } from '../styles/ui'
import { t } from '../i18n'

// Champ mot de passe avec un bouton œil pour afficher / masquer la saisie
export default function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${inputClass} pe-11 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t('Masquer le mot de passe') : t('Afficher le mot de passe')}
        aria-pressed={visible}
        className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-xl text-ink-400 transition hover:text-ink-700"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  )
}

import { Languages } from 'lucide-react'
import { LANGUAGES, t, useI18n } from '../i18n'

export default function LanguageSwitcher({ dark = false }) {
  const { lang, setLang } = useI18n()

  return (
    <label
      className={`relative flex items-center gap-1 rounded-full border px-2 py-1.5 text-sm font-semibold ${
        dark ? 'border-white/20 text-white/80' : 'border-ink-100 text-ink-600'
      }`}
    >
      <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t('Langue')}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className={`cursor-pointer appearance-none bg-transparent pe-1 outline-none ${dark ? 'text-white' : ''}`}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-ink-900">
            {l.label}
          </option>
        ))}
      </select>
    </label>
  )
}

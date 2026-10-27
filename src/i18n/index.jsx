import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import en from './en'
import ar from './ar'

// Le français est la langue source : les clés de traduction sont les textes français,
// et une clé absente d'un dictionnaire retombe simplement sur le français.
export const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'ع' },
]

const DICTIONARIES = { fr: {}, en, ar }
const LOCALES = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-u-nu-latn' }
const LANG_KEY = 'maurifood.lang'

function readLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (DICTIONARIES[saved]) return saved
  } catch {
    // stockage indisponible : langue par défaut
  }
  return 'fr'
}

let currentLang = readLang()

function applyDocumentLang(lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}
applyDocumentLang(currentLang)

// Traduit un texte français dans la langue donnée ; `{nom}` est remplacé par vars.nom.
export function tIn(lang, text, vars) {
  const translated = DICTIONARIES[lang]?.[text] ?? text
  if (!vars) return translated
  return translated.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match))
}

// Traduit un texte français dans la langue courante
export function t(text, vars) {
  return tIn(currentLang, text, vars)
}

export function getLang() {
  return currentLang
}

// Locale à passer à toLocaleString / Intl selon la langue choisie
export function getLocale(lang = currentLang) {
  return LOCALES[lang]
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(currentLang)

  const setLang = useCallback((next) => {
    if (!DICTIONARIES[next]) return
    currentLang = next
    applyDocumentLang(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      // stockage indisponible : le choix ne sera simplement pas mémorisé
    }
    setLangState(next)
  }, [])

  useEffect(() => applyDocumentLang(lang), [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {/* La clé force le re-rendu de toute l'application quand la langue change */}
      <div key={lang} className="contents">
        {children}
      </div>
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

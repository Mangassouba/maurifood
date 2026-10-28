import { Link } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone, UtensilsCrossed } from 'lucide-react'
import { t } from '../i18n'

// Coordonnées affichées dans le pied de page. Une valeur à null n'est pas affichée.
const CONTACT = {
  phone: '44896920', // numéro local mauritanien (indicatif +222)
  whatsapp: '22244896920', // format international sans « + » pour wa.me
  email: null, // ex. 'contact@maurifood.mr'
  city: 'Nouakchott, Mauritanie',
}

const contactLinkClass = 'flex items-center gap-2 hover:text-brand-400'

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
              <UtensilsCrossed className="h-5 w-5 text-ink-900" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Mauri<span className="text-brand-500">Food</span></span>
          </Link>
          <p className="mt-3 text-sm text-white/60">
            {t('Commandez vos plats préférés auprès des restaurants de Mauritanie, sans compte, en quelques clics.')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              {t('Commander')}
            </p>
            <nav className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/" className="hover:text-brand-400">
                {t('Accueil')}
              </Link>
              <Link to="/restaurants" className="hover:text-brand-400">
                {t('Restaurants')}
              </Link>
              <Link to="/panier" className="hover:text-brand-400">
                {t('Panier')}
              </Link>
              <Link to="/mes-commandes" className="hover:text-brand-400">
                {t('Mes commandes')}
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              {t('Professionnels')}
            </p>
            <nav className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/login" className="hover:text-brand-400">
                {t('Espace restaurant')}
              </Link>
              <Link to="/inscription" className="hover:text-brand-400">
                {t('Inscrire mon restaurant')}
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              {t('Contact')}
            </p>
            <address className="flex flex-col gap-2 text-sm not-italic text-white/70">
              {CONTACT.phone && (
                <a href={`tel:+222${CONTACT.phone}`} className={contactLinkClass}>
                  <Phone className="h-4 w-4 shrink-0" />
                  {/* Chiffres toujours lus de gauche à droite, même en arabe */}
                  <span dir="ltr">+222 {CONTACT.phone}</span>
                </a>
              )}
              {CONTACT.whatsapp && (
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactLinkClass}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  WhatsApp
                </a>
              )}
              {CONTACT.email && (
                <a href={`mailto:${CONTACT.email}`} className={contactLinkClass}>
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="break-all">{CONTACT.email}</span>
                </a>
              )}
              {CONTACT.city && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {t(CONTACT.city)}
                </span>
              )}
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-6xl text-xs text-white/40">
          © {new Date().getFullYear()} MauriFood. {t('Tous droits réservés.')}
        </p>
      </div>
    </footer>
  )
}

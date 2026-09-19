import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg">
              🍔
            </span>
            <span className="text-lg font-extrabold tracking-tight">MauriFood</span>
          </Link>
          <p className="mt-3 text-sm text-white/60">
            Commandez vos plats préférés auprès des restaurants de Nouakchott, sans compte, en
            quelques clics.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              Commander
            </p>
            <nav className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/" className="hover:text-brand-400">
                Accueil
              </Link>
              <Link to="/restaurants" className="hover:text-brand-400">
                Restaurants
              </Link>
              <Link to="/panier" className="hover:text-brand-400">
                Panier
              </Link>
              <Link to="/mes-commandes" className="hover:text-brand-400">
                Mes commandes
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              Professionnels
            </p>
            <nav className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/login" className="hover:text-brand-400">
                Espace restaurant
              </Link>
              <Link to="/inscription" className="hover:text-brand-400">
                Inscrire mon restaurant
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-6xl text-xs text-white/40">
          © {new Date().getFullYear()} MauriFood. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}

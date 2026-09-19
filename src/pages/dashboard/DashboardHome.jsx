export default function DashboardHome() {
  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
          👋
        </span>
        <p className="text-ink-500">
          Bienvenue dans l'espace de gestion de votre restaurant. Utilisez le menu pour gérer vos
          plats, suivre vos commandes et vos livraisons.
        </p>
      </div>
    </div>
  )
}

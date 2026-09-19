import AdminShell from '../../components/AdminShell'
import SubscriptionBanner from '../../components/SubscriptionBanner'
import { useAuth } from '../../context/AuthContext'

const baseLinks = [
  { to: '/dashboard', label: 'Aperçu', end: true, icon: '📊' },
  { to: '/dashboard/dishes', label: 'Plats', icon: '🍽️' },
  { to: '/dashboard/orders', label: 'Commandes', icon: '🧾' },
  { to: '/dashboard/delivery', label: 'Livraison', icon: '🛵' },
  { to: '/dashboard/subscription', label: 'Abonnement', icon: '💳' },
  { to: '/dashboard/profil', label: 'Profil', icon: '🏬' },
]

const ownerOnlyLinks = [{ to: '/dashboard/equipe', label: 'Équipe', icon: '👥' }]

export default function DashboardLayout() {
  const { user } = useAuth()
  const links = user?.role === 'restaurant_owner' ? [...baseLinks, ...ownerOnlyLinks] : baseLinks

  return (
    <AdminShell
      sectionLabel="Espace restaurant"
      links={links}
      banner={<SubscriptionBanner />}
    />
  )
}

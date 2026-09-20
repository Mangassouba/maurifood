import { LayoutDashboard, UtensilsCrossed, ClipboardList, Bike, CreditCard, Store, Users } from 'lucide-react'
import AdminShell from '../../components/AdminShell'
import SubscriptionBanner from '../../components/SubscriptionBanner'
import { useAuth } from '../../context/AuthContext'

const baseLinks = [
  { to: '/dashboard', label: 'Aperçu', end: true, icon: LayoutDashboard },
  { to: '/dashboard/dishes', label: 'Plats', icon: UtensilsCrossed },
  { to: '/dashboard/orders', label: 'Commandes', icon: ClipboardList },
  { to: '/dashboard/delivery', label: 'Livraison', icon: Bike },
  { to: '/dashboard/subscription', label: 'Abonnement', icon: CreditCard },
  { to: '/dashboard/profil', label: 'Profil', icon: Store },
]

const ownerOnlyLinks = [{ to: '/dashboard/equipe', label: 'Équipe', icon: Users }]

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

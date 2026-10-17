import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Bike, CreditCard, Store, Users } from 'lucide-react'
import api from '../../api/client'
import AdminShell from '../../components/AdminShell'
import SubscriptionBanner from '../../components/SubscriptionBanner'
import { useAuth } from '../../context/AuthContext'

const SUBSCRIPTION_PATH = '/dashboard/subscription'

const subscriptionLink = { to: SUBSCRIPTION_PATH, label: 'Abonnement', icon: CreditCard }

const baseLinks = [
  { to: '/dashboard', label: 'Aperçu', end: true, icon: LayoutDashboard },
  { to: '/dashboard/dishes', label: 'Plats', icon: UtensilsCrossed },
  { to: '/dashboard/orders', label: 'Commandes', icon: ClipboardList },
  { to: '/dashboard/delivery', label: 'Livraison', icon: Bike },
  subscriptionLink,
  { to: '/dashboard/profil', label: 'Profil', icon: Store },
]

const ownerOnlyLinks = [{ to: '/dashboard/equipe', label: 'Équipe', icon: Users }]

// Même règle que le middleware subscriptionActive côté API.
function isExpired(subscription) {
  if (!subscription) return false
  if (['past_due', 'cancelled'].includes(subscription.status)) return true
  return Boolean(
    subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date(),
  )
}

export default function DashboardLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [loaded, setLoaded] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    api
      .get('/dashboard/subscription')
      .then(({ data }) => setExpired(isExpired(data)))
      .catch(() => setExpired(false))
      .finally(() => setLoaded(true))
  }, [location.pathname])

  if (!loaded) return null

  if (expired && location.pathname !== SUBSCRIPTION_PATH) {
    return <Navigate to={SUBSCRIPTION_PATH} replace />
  }

  const links = expired
    ? [subscriptionLink]
    : user?.role === 'restaurant_owner'
      ? [...baseLinks, ...ownerOnlyLinks]
      : baseLinks

  return (
    <AdminShell
      sectionLabel="Espace restaurant"
      links={links}
      banner={<SubscriptionBanner />}
    />
  )
}

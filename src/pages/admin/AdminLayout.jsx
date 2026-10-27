import { LayoutDashboard, Store, ScrollText, Star } from 'lucide-react'
import AdminShell from '../../components/AdminShell'

const links = [
  { to: '/admin', label: 'Aperçu', end: true, icon: LayoutDashboard },
  { to: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { to: '/admin/avis', label: 'Avis clients', icon: Star },
  { to: '/admin/activite', label: 'Activité', icon: ScrollText },
]

export default function AdminLayout() {
  return <AdminShell sectionLabel="Administration" links={links} />
}

import { Store, ScrollText } from 'lucide-react'
import AdminShell from '../../components/AdminShell'

const links = [
  { to: '/admin', label: 'Restaurants', end: true, icon: Store },
  { to: '/admin/activite', label: 'Activité', icon: ScrollText },
]

export default function AdminLayout() {
  return <AdminShell sectionLabel="Administration" links={links} />
}

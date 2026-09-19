import AdminShell from '../../components/AdminShell'

const links = [
  { to: '/admin', label: 'Restaurants', end: true, icon: '🏪' },
  { to: '/admin/activite', label: 'Activité', icon: '📜' },
]

export default function AdminLayout() {
  return <AdminShell sectionLabel="Administration" links={links} />
}

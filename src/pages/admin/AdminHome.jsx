import { useEffect, useState } from 'react'
import { Store, CheckCircle2, Receipt, Wallet } from 'lucide-react'
import api from '../../api/client'
import StatCard from '../../components/charts/StatCard'
import RevenueTrendChart from '../../components/charts/RevenueTrendChart'
import MonthlyRevenueChart from '../../components/charts/MonthlyRevenueChart'
import YearlyRevenuePieChart from '../../components/charts/YearlyRevenuePieChart'
import StatusBreakdownChart from '../../components/charts/StatusBreakdownChart'
import SubscriptionStatusChart from '../../components/charts/SubscriptionStatusChart'
import TopRestaurantsChart from '../../components/charts/TopRestaurantsChart'

function formatMoney(n) {
  return `${Math.round(n).toLocaleString('fr-FR')} MRU`
}

export default function AdminHome() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
  }, [])

  if (!stats) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Store} label="Restaurants" value={stats.summary.totalRestaurants} />
        <StatCard
          icon={CheckCircle2}
          label="Restaurants actifs"
          value={stats.summary.activeRestaurants}
        />
        <StatCard icon={Receipt} label="Commandes totales" value={stats.summary.totalOrders} />
        <StatCard
          icon={Wallet}
          label="Chiffre d'affaires plateforme"
          value={formatMoney(stats.summary.totalRevenue)}
        />
      </div>

      <RevenueTrendChart data={stats.revenueByDay} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={stats.revenueByMonth} />
        </div>
        <YearlyRevenuePieChart data={stats.revenueByYear} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusBreakdownChart data={stats.ordersByStatus} />
        <SubscriptionStatusChart data={stats.subscriptionsByStatus} />
      </div>

      <TopRestaurantsChart data={stats.topRestaurants} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Calculator, Clock, Receipt, Smile, Wallet } from 'lucide-react'
import api from '../../api/client'
import StatCard from '../../components/charts/StatCard'
import RevenueTrendChart from '../../components/charts/RevenueTrendChart'
import StatusBreakdownChart from '../../components/charts/StatusBreakdownChart'
import TopDishesChart from '../../components/charts/TopDishesChart'
import MonthlyRevenueChart from '../../components/charts/MonthlyRevenueChart'
import YearlyRevenuePieChart from '../../components/charts/YearlyRevenuePieChart'

function formatMoney(n) {
  return `${Math.round(n).toLocaleString('fr-FR')} MRU`
}

export default function DashboardHome() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
          <Smile className="h-6 w-6 text-brand-700" />
        </span>
        <p className="text-ink-500">
          Bienvenue dans l'espace de gestion de votre restaurant. Utilisez le menu pour gérer vos
          plats, suivre vos commandes et vos livraisons.
        </p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Receipt} label="Commandes totales" value={stats.summary.totalOrders} />
            <StatCard
              icon={Wallet}
              label="Chiffre d'affaires"
              value={formatMoney(stats.summary.totalRevenue)}
            />
            <StatCard
              icon={Calculator}
              label="Panier moyen"
              value={formatMoney(stats.summary.avgOrderValue)}
            />
            <StatCard icon={Clock} label="Commandes en cours" value={stats.summary.pendingOrders} />
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
            <TopDishesChart data={stats.topDishes} />
          </div>
        </>
      )}
    </div>
  )
}

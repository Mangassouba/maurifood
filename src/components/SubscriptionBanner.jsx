import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export default function SubscriptionBanner() {
  const [subscription, setSubscription] = useState(null)
  const [daysLeft, setDaysLeft] = useState(null)

  useEffect(() => {
    api
      .get('/dashboard/subscription')
      .then(({ data }) => {
        setSubscription(data)
        if (data.currentPeriodEnd) {
          setDaysLeft(Math.ceil((new Date(data.currentPeriodEnd) - Date.now()) / MS_PER_DAY))
        }
      })
      .catch(() => setSubscription(null))
  }, [])

  if (!subscription) return null

  if (subscription.status === 'past_due') {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-semibold text-red-700">
          Votre abonnement a expiré — votre restaurant n'est plus visible par les clients.
        </p>
        <Link
          to="/dashboard/subscription"
          className="shrink-0 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700"
        >
          Renouveler maintenant
        </Link>
      </div>
    )
  }

  if (daysLeft !== null && daysLeft > 0 && daysLeft <= 5) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-300 bg-brand-50 px-4 py-3">
        <p className="text-sm font-semibold text-brand-700">
          Votre abonnement expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}. Renouvelez-le
          pour éviter la désactivation de votre restaurant.
        </p>
        <Link
          to="/dashboard/subscription"
          className="shrink-0 rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold text-ink-900 hover:bg-brand-400"
        >
          Renouveler
        </Link>
      </div>
    )
  }

  return null
}

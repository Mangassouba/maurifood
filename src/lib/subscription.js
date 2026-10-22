const MS_PER_DAY = 24 * 60 * 60 * 1000

export function formatSubscriptionDate(value) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function daysUntil(value) {
  return Math.ceil((new Date(value) - Date.now()) / MS_PER_DAY)
}

export function remainingLabel(periodEnd) {
  const days = daysUntil(periodEnd)
  if (days <= 0) return 'Expiré'
  return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`
}

// Même règle que le middleware subscriptionActive côté API.
export function isSubscriptionExpired(subscription) {
  if (!subscription) return false
  if (['past_due', 'cancelled'].includes(subscription.status)) return true
  return Boolean(
    subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date(),
  )
}

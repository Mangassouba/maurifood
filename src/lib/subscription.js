import { getLocale, t } from '../i18n'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function formatSubscriptionDate(value) {
  return new Date(value).toLocaleDateString(getLocale(), {
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
  if (days <= 0) return t('Expiré')
  return days > 1 ? t('{n} jours restants', { n: days }) : t('{n} jour restant', { n: days })
}

// Même règle que le middleware subscriptionActive côté API.
export function isSubscriptionExpired(subscription) {
  if (!subscription) return false
  if (['past_due', 'cancelled'].includes(subscription.status)) return true
  return Boolean(
    subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date(),
  )
}

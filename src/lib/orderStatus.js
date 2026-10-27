import { getLang, t, tIn } from '../i18n'

export const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

// Une commande à emporter est remise au comptoir : elle est « retirée », pas « livrée ».
const PICKUP_LABELS = {
  ...STATUS_LABELS,
  ready: 'Prête à retirer',
  delivered: 'Retirée',
}

// Tous les statuts, dans l'ordre d'avancement
export const STATUS_FLOW = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
]

export const FINAL_STATUSES = ['delivered', 'cancelled']

export function statusesFor(orderType) {
  return orderType === 'pickup' ? STATUS_FLOW.filter((s) => s !== 'out_for_delivery') : STATUS_FLOW
}

// `lang` permet de forcer une langue (ex. reçu PDF), sinon langue courante
export function statusLabel(status, orderType, lang = getLang()) {
  const labels = orderType === 'pickup' ? PICKUP_LABELS : STATUS_LABELS
  return labels[status] ? tIn(lang, labels[status]) : status
}

// Libellé utilisé quand le type de commande n'est pas connu (filtres « tous les types »)
export function genericStatusLabel(status) {
  if (status === 'delivered') return t('Livrée / Retirée')
  return STATUS_LABELS[status] ? t(STATUS_LABELS[status]) : status
}

export function nextStatus(status, orderType) {
  if (FINAL_STATUSES.includes(status)) return null
  const flow = statusesFor(orderType)
  return flow[flow.indexOf(status) + 1] ?? null
}

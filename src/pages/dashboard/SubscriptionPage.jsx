import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import api from '../../api/client'
import { badgeClass, btnPrimary, cardClass } from '../../styles/ui'

const STATUS_TONE = {
  trialing: 'brand',
  active: 'green',
  past_due: 'red',
  cancelled: 'ink',
}

const STATUS_LABELS = {
  trialing: "À l'essai",
  active: 'Actif',
  past_due: 'Paiement en retard',
  cancelled: 'Annulé',
}

const PAYMENT_NUMBER = '44896920'

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null)
  const [plans, setPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    api
      .get('/dashboard/subscription')
      .then(({ data }) => setSubscription(data))
      .catch(() => setSubscription(null))
    api
      .get('/plans')
      .then(({ data }) => setPlans(data))
      .catch(() => setPlans([]))
  }, [])

  async function handleRenewalRequest() {
    if (!selectedPlanId) return
    setSending(true)
    setSent(false)
    try {
      await api.post('/dashboard/renewal-request', { planId: selectedPlanId })
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        {subscription ? (
          <div className={`${cardClass} flex items-center gap-4`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
              <CreditCard className="h-6 w-6 text-brand-700" />
            </span>
            <div>
              <p className="font-bold text-ink-900">Plan actuel : {subscription.plan?.name}</p>
              <span className={`${badgeClass(STATUS_TONE[subscription.status] ?? 'ink')} mt-1`}>
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-ink-400">
            Aucun abonnement actif. Contactez l'administrateur pour activer votre compte.
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-extrabold text-ink-900">Nos formules</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan?.id === plan.id
            const isSelected = selectedPlanId === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setSelectedPlanId(plan.id)
                  setSent(false)
                }}
                className={`rounded-2xl border p-4 text-center transition ${
                  isSelected
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : isCurrent
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-ink-100 bg-white hover:border-brand-300'
                }`}
              >
                <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-ink-900'}`}>
                  {plan.name}
                </p>
                <p
                  className={`mt-1 text-xl font-extrabold ${isSelected ? 'text-brand-400' : 'text-brand-600'}`}
                >
                  {plan.price}
                </p>
                <p className={`text-xs ${isSelected ? 'text-white/60' : 'text-ink-400'}`}>MRU</p>
                {isCurrent && !isSelected && (
                  <span className={`${badgeClass('brand')} mt-2`}>Formule actuelle</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className={cardClass}>
        <p className="mb-2 text-sm font-bold text-ink-900">Paiement</p>
        <p className="text-sm text-ink-500">
          Choisissez votre formule ci-dessus puis envoyez le montant correspondant via{' '}
          <strong className="text-ink-900">Bankily</strong> ou{' '}
          <strong className="text-ink-900">Masrivi</strong> au numéro{' '}
          <strong className="text-ink-900">{PAYMENT_NUMBER}</strong>.
        </p>

        <button
          type="button"
          onClick={handleRenewalRequest}
          disabled={!selectedPlanId || sending}
          className={`${btnPrimary} mt-4`}
        >
          {sending ? 'Envoi...' : "J'ai payé, demander l'activation"}
        </button>
        {sent && (
          <p className="mt-2 text-sm text-green-700">
            Demande envoyée à l'administrateur. Votre abonnement sera activé après vérification
            du paiement.
          </p>
        )}
      </div>
    </div>
  )
}

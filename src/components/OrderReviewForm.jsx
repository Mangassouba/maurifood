import { useState } from 'react'
import { Star } from 'lucide-react'
import api from '../api/client'
import Stars from './Stars'
import { btnDark, cardClass, inputClass } from '../styles/ui'
import { t } from '../i18n'

const MAX_COMMENT_LENGTH = 500

// Avis sur une commande livrée ou retirée, envoyé avec le code de la commande
export default function OrderReviewForm({ order, onReviewed }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  if (order.review) {
    return (
      <div className={`${cardClass} mb-4 text-center`}>
        <p className="text-sm font-bold text-ink-900">{t('Merci pour votre avis !')}</p>
        <div className="mt-2">
          <Stars rating={order.review.rating} size={20} />
        </div>
        {order.review.comment && <p className="mt-2 text-sm text-ink-500">{order.review.comment}</p>}
      </div>
    )
  }

  if (order.status !== 'delivered') return null

  async function submit(e) {
    e.preventDefault()
    if (!rating) {
      setError(t('Choisissez une note de 1 à 5 étoiles'))
      return
    }
    setSending(true)
    setError('')
    try {
      const { data } = await api.post(`/orders/code/${order.code}/review`, { rating, comment })
      onReviewed({ rating: data.rating, comment: data.comment })
    } catch (err) {
      setError(
        err.response?.status === 409
          ? t('Un avis a déjà été laissé pour cette commande')
          : t('Une erreur est survenue, veuillez réessayer'),
      )
    } finally {
      setSending(false)
    }
  }

  const shown = hovered || rating

  return (
    <form onSubmit={submit} className={`${cardClass} mb-4`}>
      <p className="text-sm font-bold text-ink-900">{t('Votre avis compte')}</p>
      <p className="mt-0.5 text-xs text-ink-400">
        {t('Comment s’est passée votre commande chez {restaurant} ?', { restaurant: order.restaurant?.name })}
      </p>

      <div className="mt-3 flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            aria-label={t('{n} sur 5', { n })}
            aria-pressed={rating === n}
            className="rounded p-0.5 transition hover:scale-110"
          >
            <Star
              size={28}
              className={n <= shown ? 'fill-brand-500 text-brand-500' : 'fill-ink-100 text-ink-200'}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={MAX_COMMENT_LENGTH}
        rows={3}
        placeholder={t('Un commentaire ? (optionnel)')}
        className={`${inputClass} mt-3 resize-none`}
      />
      <p className="mt-1 text-end text-xs text-ink-400">
        {comment.length}/{MAX_COMMENT_LENGTH}
      </p>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={sending} className={`${btnDark} mt-2 w-full`}>
        {sending ? t('Envoi...') : t('Envoyer mon avis')}
      </button>
    </form>
  )
}

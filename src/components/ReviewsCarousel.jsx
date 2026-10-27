import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Stars from './Stars'
import { getLocale, t } from '../i18n'

// Nombre minimal de cartes dans une moitié de piste, pour qu'elle dépasse la largeur
// de l'écran même avec peu d'avis (sinon un trou apparaît pendant le défilement)
const MIN_CARDS = 8
const SECONDS_PER_CARD = 6

function ReviewCard({ review }) {
  return (
    <figure className="flex w-72 shrink-0 flex-col rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
      <Stars rating={review.rating} />
      <blockquote className="mt-3 line-clamp-4 flex-1 text-sm text-ink-600">{review.comment}</blockquote>
      <figcaption className="mt-3 text-xs text-ink-400">
        <span className="font-bold text-ink-900">{review.authorName}</span>
        {' · '}
        <Link to={`/restaurants/${review.restaurant.slug}`} className="hover:text-brand-600 hover:underline">
          {review.restaurant.name}
        </Link>
        {' · '}
        {new Date(review.createdAt).toLocaleDateString(getLocale(), { month: 'short', year: 'numeric' })}
      </figcaption>
    </figure>
  )
}

export default function ReviewsCarousel() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api
      .get('/public/reviews')
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
  }, [])

  // Pas d'avis à montrer : la section n'apparaît pas
  if (!data?.items?.length) return null

  const half = []
  while (half.length < MIN_CARDS) half.push(...data.items)

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-lg font-extrabold text-ink-900">{t('Ce que disent nos clients')}</h3>
        {data.average !== null && (
          <p className="flex items-center gap-2 text-sm text-ink-500">
            <Stars rating={Math.round(data.average)} size={14} />
            <span>
              <strong className="text-ink-900">
                {data.average.toLocaleString(getLocale(), { minimumFractionDigits: 1 })}/5
              </strong>{' '}
              · {data.count > 1 ? t('{n} avis', { n: data.count }) : t('1 avis')}
            </span>
          </p>
        )}
      </div>

      <div className="marquee -mx-4 overflow-hidden px-4 py-1 sm:-mx-6 sm:px-6 [mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]">
        {/* Les deux moitiés ont exactement la même largeur (marge finale comprise) :
            un décalage de -50 % retombe pile sur le début de la copie */}
        <div
          className="marquee-track flex w-max"
          style={{ '--marquee-duration': `${half.length * SECONDS_PER_CARD}s` }}
        >
          <div className="flex gap-4 pe-4">
            {half.map((review, i) => (
              <ReviewCard key={`a-${i}`} review={review} />
            ))}
          </div>
          {/* Copie identique pour boucler sans coupure, ignorée par les lecteurs d'écran */}
          <div className="marquee-copy flex gap-4 pe-4" aria-hidden="true">
            {half.map((review, i) => (
              <ReviewCard key={`b-${i}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

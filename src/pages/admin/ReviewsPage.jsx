import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import Pagination from '../../components/Pagination'
import Stars from '../../components/Stars'
import { badgeClass, btnGhost, cardClass, inputClass } from '../../styles/ui'
import { getLocale, t } from '../../i18n'

const PAGE_SIZE = 15

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'published', label: 'Publiés' },
  { value: 'hidden', label: 'Masqués' },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api
      .get('/admin/reviews')
      .then(({ data }) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  async function togglePublished(review) {
    const { data } = await api.put(`/admin/reviews/${review.id}/published`, {
      isPublished: !review.isPublished,
    })
    setReviews((list) => list.map((r) => (r.id === review.id ? { ...r, isPublished: data.isPublished } : r)))
  }

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) => filter === 'all' || (filter === 'published' ? r.isPublished : !r.isPublished),
      ),
    [reviews, filter],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">{t('Avis clients')}</h1>
      <p className="mb-4 text-sm text-ink-400">
        {t('Les avis publiés avec un commentaire défilent sur la page d’accueil. Masquez ceux qui ne doivent pas apparaître.')}
      </p>

      <select
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value)
          setPage(1)
        }}
        className={`${inputClass} mb-6 w-40`}
      >
        {FILTERS.map((f) => (
          <option key={f.value} value={f.value}>
            {t(f.label)}
          </option>
        ))}
      </select>

      {loading && <p className="text-ink-400">{t('Chargement...')}</p>}
      {!loading && filtered.length === 0 && <p className="text-ink-400">{t('Aucun avis pour le moment.')}</p>}

      {filtered.length > 0 && (
        <div className={`${cardClass} divide-y divide-ink-50 p-0`}>
          {paged.map((review) => (
            <div key={review.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars rating={review.rating} size={14} />
                  <span className={badgeClass(review.isPublished ? 'green' : 'ink')}>
                    {review.isPublished ? t('Publié') : t('Masqué')}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${review.comment ? 'text-ink-900' : 'italic text-ink-400'}`}>
                  {review.comment ?? t('Sans commentaire')}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {review.authorName} · {review.restaurant?.name} · {review.order?.code} ·{' '}
                  {new Date(review.createdAt).toLocaleDateString(getLocale())}
                </p>
              </div>
              <button type="button" onClick={() => togglePublished(review)} className={btnGhost}>
                {review.isPublished ? t('Masquer') : t('Publier')}
              </button>
            </div>
          ))}
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} total={filtered.length} />
        </div>
      )}
    </div>
  )
}

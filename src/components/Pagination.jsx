import { btnGhost } from '../styles/ui'
import { t } from '../i18n'

export default function Pagination({ page, pageCount, onPageChange, total }) {
  if (pageCount <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
      <span className="text-xs text-ink-400">{total > 1 ? t('{n} résultats', { n: total }) : t('{n} résultat', { n: total })}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${btnGhost} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {t('Précédent')}
        </button>
        <span className="text-sm text-ink-500">
          {t('Page {page} sur {count}', { page, count: pageCount })}
        </span>
        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          className={`${btnGhost} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {t('Suivant')}
        </button>
      </div>
    </div>
  )
}

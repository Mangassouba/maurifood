import { btnGhost } from '../styles/ui'

export default function Pagination({ page, pageCount, onPageChange, total }) {
  if (pageCount <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
      <span className="text-xs text-ink-400">{total} résultat{total > 1 ? 's' : ''}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${btnGhost} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Précédent
        </button>
        <span className="text-sm text-ink-500">
          Page {page} sur {pageCount}
        </span>
        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          className={`${btnGhost} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

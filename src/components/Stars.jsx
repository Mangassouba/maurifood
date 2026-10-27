import { Star } from 'lucide-react'

// Affiche une note sur 5 en étoiles
export default function Stars({ rating, size = 16 }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? 'fill-brand-500 text-brand-500' : 'fill-ink-100 text-ink-100'}
        />
      ))}
    </span>
  )
}

import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

export default function DishImage({ src, alt, className = '' }) {
  const [errored, setErrored] = useState(false)

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setErrored(true)}
        className={`object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 ${className}`}
    >
      <UtensilsCrossed className="h-8 w-8 text-brand-600" aria-label={alt} />
    </div>
  )
}

import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, onIncrement, onDecrement, size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-3 rounded-full bg-ink-900 px-1.5 py-1.5 text-white">
      <button
        type="button"
        onClick={onDecrement}
        className={`${dim} flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20`}
      >
        <Minus className={iconSize} />
      </button>
      <span className="w-4 text-center font-semibold">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className={`${dim} flex items-center justify-center rounded-full bg-brand-400 text-ink-900 hover:bg-brand-300`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  )
}

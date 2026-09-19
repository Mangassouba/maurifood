export default function QuantityStepper({ value, onIncrement, onDecrement, size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-base'

  return (
    <div className="flex items-center gap-3 rounded-full bg-ink-900 px-1.5 py-1.5 text-white">
      <button
        type="button"
        onClick={onDecrement}
        className={`${dim} flex items-center justify-center rounded-full bg-white/10 font-bold hover:bg-white/20`}
      >
        −
      </button>
      <span className="w-4 text-center font-semibold">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className={`${dim} flex items-center justify-center rounded-full bg-brand-400 font-bold text-ink-900 hover:bg-brand-300`}
      >
        +
      </button>
    </div>
  )
}

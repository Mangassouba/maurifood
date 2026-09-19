export const inputClass =
  'w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:ring-2 focus:ring-brand-300'

export const cardClass = 'rounded-2xl border border-ink-100 bg-white p-4 shadow-sm'

export const btnPrimary =
  'rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-ink-900 transition hover:bg-brand-400 disabled:opacity-50'

export const btnDark =
  'rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-ink-700 disabled:opacity-50'

export const btnGhost =
  'rounded-full border border-ink-100 px-4 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-50'

export const btnDanger = 'text-sm font-semibold text-red-600 hover:text-red-700'

export const badgeClass = (tone) => {
  const tones = {
    brand: 'bg-brand-100 text-brand-700',
    ink: 'bg-ink-100 text-ink-600',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  }
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] ?? tones.ink}`
}

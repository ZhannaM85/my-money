import type { Locale } from '@/domain/settings'

export function todayIsoDate(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/**
 * Parse a typed or imported amount. Accepts `,` or `.` as decimal or
 * grouping separators, and whitespace grouping (e.g. `116 420,00`).
 */
export function parseAmount(raw: string): number | undefined {
  const trimmed = raw.trim().replace(/\s/g, '')
  if (trimmed === '') return undefined

  const lastComma = trimmed.lastIndexOf(',')
  const lastDot = trimmed.lastIndexOf('.')
  const lastSep = Math.max(lastComma, lastDot)

  let normalized: string
  if (lastSep === -1) {
    normalized = trimmed
  } else {
    const fraction = trimmed.slice(lastSep + 1)
    const decimal = /^\d{1,2}$/.test(fraction)
    const integer = (decimal ? trimmed.slice(0, lastSep) : trimmed).replace(
      /[.,]/g,
      '',
    )
    normalized = decimal ? `${integer}.${fraction}` : integer
  }

  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : undefined
}

function localeTag(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}

export function currencyFractionDigits(currency?: string): number {
  if (!currency) return 2
  try {
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

/** Grouped amount for a money <input> — no currency symbol (shown beside the field). */
export function formatEditableAmount(
  amount: number,
  locale: Locale = 'en',
  currency?: string,
): string {
  const fractionDigits = currencyFractionDigits(currency)
  return new Intl.NumberFormat(localeTag(locale), {
    useGrouping: true,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}

export function reformatAmountInput(
  raw: string,
  locale: Locale = 'en',
  currency?: string,
): string {
  const parsed = parseAmount(raw)
  if (parsed === undefined) return raw
  return formatEditableAmount(parsed, locale, currency)
}

export function formatAmount(
  amount: number,
  currency: string,
  locale: Locale = 'en',
): string {
  try {
    return new Intl.NumberFormat(localeTag(locale), {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatSignedAmount(
  amount: number,
  currency: string,
  locale: Locale = 'en',
): string {
  const formatted = formatAmount(Math.abs(amount), currency, locale)
  if (amount > 0) return `+${formatted}`
  if (amount < 0) return `−${formatted}`
  return formatted
}

export function formatPercent(percent: number, locale: Locale = 'en'): string {
  const formatted = new Intl.NumberFormat(localeTag(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(percent))
  const sign = percent > 0 ? '+' : percent < 0 ? '−' : ''
  return `${sign}${formatted}%`
}

export function formatCompactNumber(
  value: number,
  locale: Locale = 'en',
  maximumFractionDigits = 1,
): string {
  return new Intl.NumberFormat(localeTag(locale), {
    notation: 'compact',
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Compact Y-axis digits so nearby million-scale ticks stay distinct
 * (1,97 млн vs 2 млн) instead of all rounding to the same label.
 */
export function compactAxisFractionDigits(
  min: number,
  max: number,
  locale: Locale = 'en',
): number {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const magnitude = Math.max(Math.abs(lo), Math.abs(hi), 1)
  const pad = Math.max((hi - lo) * 0.1, magnitude * 0.05)
  let digits = Math.max(
    digitsMatchingTwoPlaceCompact(lo, locale),
    digitsMatchingTwoPlaceCompact(hi, locale),
  )
  const samples = [0, 1, 2, 3, 4].map(
    (step) => lo - pad + ((hi - lo + 2 * pad) * step) / 4,
  )
  for (; digits <= 3; digits += 1) {
    const labels = samples.map((value) =>
      formatCompactNumber(value, locale, digits),
    )
    if (new Set(labels).size === labels.length) return digits
  }
  return 3
}

function digitsMatchingTwoPlaceCompact(value: number, locale: Locale): number {
  const precise = formatCompactNumber(value, locale, 2)
  for (let digits = 0; digits <= 2; digits += 1) {
    if (formatCompactNumber(value, locale, digits) === precise) return digits
  }
  return 2
}

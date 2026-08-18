import type { Locale } from '@/domain/settings'

export function todayIsoDate(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** Parse a typed or imported amount. Accepts `,` or `.` as the decimal separator. */
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

export function formatCompactNumber(value: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(localeTag(locale), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

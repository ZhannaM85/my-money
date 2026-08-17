export function todayIsoDate(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatSignedAmount(amount: number, currency: string): string {
  const formatted = formatAmount(Math.abs(amount), currency)
  if (amount > 0) return `+${formatted}`
  if (amount < 0) return `−${formatted}`
  return formatted
}

export function formatPercent(percent: number): string {
  const sign = percent > 0 ? '+' : percent < 0 ? '−' : ''
  return `${sign}${Math.abs(percent).toFixed(1)}%`
}

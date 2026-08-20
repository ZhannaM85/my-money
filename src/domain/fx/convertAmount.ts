export interface FxRateQuote {
  date: string
  base: string
  quote: string
  rate: number
}

export type RateTable = readonly FxRateQuote[]

export function convertAmount(amount: number, rate: number): number {
  return amount * rate
}

export function lookupRate(
  rates: RateTable,
  from: string,
  to: string,
  date: string,
): number | undefined {
  if (from === to) return 1

  const dated = rates.filter((quote) => quote.date === date)
  if (dated.length === 0) return undefined

  const direct = dated.find(
    (quote) => quote.base === from && quote.quote === to,
  )
  if (direct) return direct.rate

  const inverse = dated.find(
    (quote) => quote.base === to && quote.quote === from,
  )
  if (inverse && inverse.rate !== 0) return 1 / inverse.rate

  return undefined
}

/** Same-day quote when present; otherwise the latest earlier convertible quote. Never a future date. */
export function lookupRateOnOrBefore(
  rates: RateTable,
  from: string,
  to: string,
  date: string,
): number | undefined {
  const exact = lookupRate(rates, from, to, date)
  if (exact !== undefined) return exact
  const earlier = [
    ...new Set(rates.map((quote) => quote.date).filter((day) => day < date)),
  ].sort((a, b) => b.localeCompare(a))
  for (const day of earlier) {
    const rate = lookupRate(rates, from, to, day)
    if (rate !== undefined) return rate
  }
  return undefined
}

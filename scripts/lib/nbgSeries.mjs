/**
 * National Bank of Georgia publishes each currency vs GEL.
 * Cross to RUB: CODE→RUB = (GEL per 1 CODE) / (GEL per 1 RUB)
 * where GEL per 1 unit = rate / quantity.
 */

export function gelPerUnit(rate, quantity) {
  if (!Number.isFinite(rate) || !Number.isFinite(quantity) || quantity === 0) {
    return undefined
  }
  return rate / quantity
}

export function crossToRub(gelPerCode, gelPerRub) {
  if (
    gelPerCode === undefined ||
    gelPerRub === undefined ||
    !Number.isFinite(gelPerCode) ||
    !Number.isFinite(gelPerRub) ||
    gelPerRub === 0
  ) {
    return undefined
  }
  return gelPerCode / gelPerRub
}

/**
 * @param {unknown} payload NBG JSON body (array of day objects)
 * @param {string} requestDate ISO date used for the quote.date field
 * @param {readonly string[]} targetCodes foreign codes to emit as CODE→RUB
 * @returns {{ date: string, base: string, quote: 'RUB', rate: number }[]}
 */
export function quotesFromNbgPayload(payload, requestDate, targetCodes) {
  if (!Array.isArray(payload) || payload.length === 0) return []
  const day = payload[0]
  const currencies = day?.currencies
  if (!Array.isArray(currencies)) return []

  const byCode = new Map()
  for (const row of currencies) {
    if (!row || typeof row.code !== 'string') continue
    const per = gelPerUnit(Number(row.rate), Number(row.quantity))
    if (per === undefined) continue
    byCode.set(row.code, per)
  }

  const gelPerRub = byCode.get('RUB')
  if (gelPerRub === undefined) return []

  const quotes = []
  for (const code of targetCodes) {
    if (code === 'RUB') continue
    const rate = crossToRub(byCode.get(code), gelPerRub)
    if (rate === undefined) continue
    quotes.push({
      date: requestDate,
      base: code,
      quote: 'RUB',
      rate,
    })
  }
  return quotes
}

export function nbgUrlForDate(date) {
  const url = new URL(
    'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/',
  )
  url.searchParams.set('date', date)
  return url.toString()
}

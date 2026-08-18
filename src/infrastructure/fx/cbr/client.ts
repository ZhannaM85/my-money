import type { FxRateQuote } from '@/domain/fx'
import { isoDatesInclusive } from '@/shared/lib/dates'

export const CBR_DAILY_URL = 'https://www.cbr.ru/scripts/XML_daily.asp'

export class CbrRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CbrRequestError'
  }
}

function isoToCbrDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function parseCbrNumber(raw: string): number {
  return Number(raw.trim().replace(',', '.'))
}

/** Parse CBR daily XML into foreign-currency → RUB quotes. */
export function quotesFromCbrXml(date: string, xml: string): FxRateQuote[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const quotes: FxRateQuote[] = []
  for (const node of doc.querySelectorAll('Valute')) {
    const code = node.querySelector('CharCode')?.textContent?.trim()
    const nominal = parseCbrNumber(node.querySelector('Nominal')?.textContent ?? '1')
    const value = parseCbrNumber(node.querySelector('Value')?.textContent ?? '')
    if (!code || !Number.isFinite(value) || !Number.isFinite(nominal) || nominal === 0) {
      continue
    }
    quotes.push({
      date,
      base: code,
      quote: 'RUB',
      rate: value / nominal,
    })
  }
  return quotes
}

export class CbrFxClient {
  private readonly fetchFn: typeof fetch

  constructor(fetchFn: typeof fetch = fetch) {
    this.fetchFn = fetchFn
  }

  async onDate(date: string): Promise<FxRateQuote[]> {
    const url = new URL(CBR_DAILY_URL)
    url.searchParams.set('date_req', isoToCbrDate(date))
    const response = await this.fetchFn(url.toString())
    if (!response.ok) {
      throw new CbrRequestError(`CBR responded ${response.status}`)
    }
    const xml = await response.text()
    return quotesFromCbrXml(date, xml)
  }

  async timeseries(start: string, end: string): Promise<FxRateQuote[]> {
    if (start > end) return []
    const quotes: FxRateQuote[] = []
    for (const date of isoDatesInclusive(start, end)) {
      quotes.push(...(await this.onDate(date)))
    }
    return quotes
  }
}

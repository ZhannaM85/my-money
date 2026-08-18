import type { FxRateQuote } from '@/domain/fx'

export const NBG_CURRENCIES_URL =
  'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/'

export class NbgRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NbgRequestError'
  }
}

export function gelPerUnit(rate: number, quantity: number): number | undefined {
  if (!Number.isFinite(rate) || !Number.isFinite(quantity) || quantity === 0) {
    return undefined
  }
  return rate / quantity
}

export function crossToRub(
  gelPerCode: number | undefined,
  gelPerRub: number | undefined,
): number | undefined {
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

interface NbgCurrencyRow {
  code?: string
  quantity?: number
  rate?: number
}

interface NbgDay {
  currencies?: NbgCurrencyRow[]
}

/** Parse one NBG day into foreign-currency → RUB quotes via GEL. */
export function quotesFromNbgDay(
  date: string,
  payload: unknown,
  targetCodes?: readonly string[],
): FxRateQuote[] {
  if (!Array.isArray(payload) || payload.length === 0) return []
  const day = payload[0] as NbgDay
  if (!Array.isArray(day.currencies)) return []

  const byCode = new Map<string, number>()
  for (const row of day.currencies) {
    if (!row?.code) continue
    const per = gelPerUnit(Number(row.rate), Number(row.quantity))
    if (per === undefined) continue
    byCode.set(row.code, per)
  }

  const gelPerRub = byCode.get('RUB')
  if (gelPerRub === undefined) return []

  const codes =
    targetCodes ??
    [...byCode.keys()].filter((code) => code !== 'RUB')

  const quotes: FxRateQuote[] = []
  for (const code of codes) {
    const rate = crossToRub(byCode.get(code), gelPerRub)
    if (rate === undefined) continue
    quotes.push({ date, base: code, quote: 'RUB', rate })
  }
  return quotes
}

export class NbgFxClient {
  private readonly fetchFn: typeof fetch

  constructor(fetchFn: typeof fetch = fetch) {
    this.fetchFn = fetchFn
  }

  async onDate(
    date: string,
    targetCodes?: readonly string[],
  ): Promise<FxRateQuote[]> {
    const url = new URL(NBG_CURRENCIES_URL)
    url.searchParams.set('date', date)
    const response = await this.fetchFn(url.toString())
    if (!response.ok) {
      throw new NbgRequestError(`NBG responded ${response.status}`)
    }
    return quotesFromNbgDay(date, await response.json(), targetCodes)
  }
}

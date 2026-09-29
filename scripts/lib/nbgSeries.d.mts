export function gelPerUnit(rate: number, quantity: number): number | undefined

export function crossToRub(
  gelPerCode: number | undefined,
  gelPerRub: number | undefined,
): number | undefined

export function quotesFromNbgPayload(
  payload: unknown,
  requestDate: string,
  targetCodes: readonly string[],
): { date: string; base: string; quote: 'RUB'; rate: number }[]

export function nbgUrlForDate(date: string): string

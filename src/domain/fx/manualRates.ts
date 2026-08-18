import { lookupRate, type FxRateQuote, type RateTable } from '@/domain/fx'

/** Manual overrides win for the same date+pair. */
export function mergeRateTables(
  system: RateTable,
  manual: RateTable,
): RateTable {
  if (manual.length === 0) return system
  const manualKeys = new Set(
    manual.map((quote) => `${quote.date}:${quote.base}:${quote.quote}`),
  )
  return [
    ...manual,
    ...system.filter(
      (quote) => !manualKeys.has(`${quote.date}:${quote.base}:${quote.quote}`),
    ),
  ]
}

export function manualRateForPair(
  manuals: RateTable,
  from: string,
  to: string,
  date: string,
): number | undefined {
  return lookupRate(manuals, from, to, date)
}

export type { FxRateQuote }

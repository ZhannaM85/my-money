/** Original + All hero: largest native total first (#256). No FX. */
export function sortNativeTotalsLargestFirst<
  T extends { currency: string; amount: number },
>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => {
    const byAbs = Math.abs(right.amount) - Math.abs(left.amount)
    return byAbs !== 0 ? byAbs : left.currency.localeCompare(right.currency)
  })
}

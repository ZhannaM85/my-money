/** Keep relative order; move zero native balances after non-zeros (#325). */
export function pinZeroBalanceHoldingsLast<
  T extends { nativeAmount: number },
>(holdings: readonly T[]): T[] {
  const nonZero: T[] = []
  const zero: T[] = []
  for (const row of holdings) {
    if (row.nativeAmount === 0) zero.push(row)
    else nonZero.push(row)
  }
  return [...nonZero, ...zero]
}

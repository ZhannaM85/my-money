/** Finger must stay inside this radius to count as a chart-day tap (#225). */
export const CHART_DATE_TAP_SLOP_PX = 12

export function isChartDateTap(
  dx: number,
  dy: number,
  slop = CHART_DATE_TAP_SLOP_PX,
): boolean {
  return Math.hypot(dx, dy) <= slop
}

/**
 * Commit the hovered chart day on finger-up (#274).
 * - Small move: tap (#225 / #112)
 * - Mostly horizontal scrub: user is picking a day along the plot
 * - Mostly vertical: page scroll — do not change As of (#225)
 * - Range pan already consumed the gesture: do not change As of (#111)
 */
export function shouldCommitChartDaySelection(
  dx: number,
  dy: number,
  rangePanned = false,
): boolean {
  if (rangePanned) return false
  if (isChartDateTap(dx, dy)) return true
  return Math.abs(dx) >= Math.abs(dy)
}

/** Finger must stay inside this radius to count as a chart-day tap (#225). */
export const CHART_DATE_TAP_SLOP_PX = 12

export function isChartDateTap(
  dx: number,
  dy: number,
  slop = CHART_DATE_TAP_SLOP_PX,
): boolean {
  return Math.hypot(dx, dy) <= slop
}

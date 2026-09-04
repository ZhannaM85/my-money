/** Shared pull-to-refresh distances (#39, #216). */
export const PULL_THRESHOLD = 120
export const MAX_PULL = 180
/** Finger delta multiplier after the arm slop. */
export const PULL_RESISTANCE = 0.45
/**
 * Finger must drag this far before the refresh icon appears (#216).
 * Short top-of-page flicks must not show the badge at all.
 */
export const PULL_ARM_SLOP = 100

/** Visual pull after arming — 0 until `deltaPx` clears `PULL_ARM_SLOP`. */
export function resistedPullDistance(deltaPx: number): number {
  const excess = deltaPx - PULL_ARM_SLOP
  if (excess <= 0) return 0
  return Math.min(MAX_PULL, excess * PULL_RESISTANCE)
}

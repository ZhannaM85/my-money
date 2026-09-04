/** Shared pull-to-refresh distances (#39, #216). */
export const PULL_THRESHOLD = 120
export const MAX_PULL = 160
/** Finger delta multiplier — native refresh needs a longer deliberate pull. */
export const PULL_RESISTANCE = 0.5
/** Ignore tiny downward noise before capturing the gesture. */
export const PULL_ARM_SLOP = 12

export function resistedPullDistance(deltaPx: number): number {
  if (deltaPx <= 0) return 0
  return Math.min(MAX_PULL, deltaPx * PULL_RESISTANCE)
}

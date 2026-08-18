const PINCH_THRESHOLD = 1.12

export function touchDistance(
  first: Pick<Touch, 'clientX' | 'clientY'>,
  second: Pick<Touch, 'clientX' | 'clientY'>,
): number {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
}

/** Pinch out (fingers apart) zooms in; pinch in zooms out. One step per gesture. */
export function pinchZoomDirection(
  startDistance: number,
  currentDistance: number,
  threshold = PINCH_THRESHOLD,
): 'in' | 'out' | null {
  if (startDistance <= 0 || currentDistance <= 0) return null
  const scale = currentDistance / startDistance
  if (scale >= threshold) return 'in'
  if (scale <= 1 / threshold) return 'out'
  return null
}

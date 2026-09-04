import { describe, expect, it } from 'vitest'
import {
  MAX_PULL,
  PULL_ARM_SLOP,
  PULL_THRESHOLD,
  resistedPullDistance,
} from './pullToRefresh'

describe('resistedPullDistance', () => {
  it('keeps the refresh icon at 0 until a long deliberate drag (#216)', () => {
    expect(resistedPullDistance(PULL_ARM_SLOP)).toBe(0)
    expect(resistedPullDistance(PULL_ARM_SLOP - 1)).toBe(0)
    expect(resistedPullDistance(40)).toBe(0)
  })

  it('needs substantial further travel after the icon appears to hit threshold (#216)', () => {
    expect(resistedPullDistance(PULL_ARM_SLOP + 50)).toBeLessThan(PULL_THRESHOLD)
    expect(resistedPullDistance(PULL_ARM_SLOP + 280)).toBeGreaterThanOrEqual(
      PULL_THRESHOLD,
    )
    expect(resistedPullDistance(900)).toBe(MAX_PULL)
  })
})

import { describe, expect, it } from 'vitest'
import {
  MAX_PULL,
  PULL_THRESHOLD,
  resistedPullDistance,
} from './pullToRefresh'

describe('resistedPullDistance', () => {
  it('damps finger travel so short pulls stay under the refresh threshold (#216)', () => {
    expect(resistedPullDistance(100)).toBeLessThan(PULL_THRESHOLD)
    expect(resistedPullDistance(250)).toBeGreaterThanOrEqual(PULL_THRESHOLD)
    expect(resistedPullDistance(400)).toBe(MAX_PULL)
    expect(resistedPullDistance(0)).toBe(0)
  })
})

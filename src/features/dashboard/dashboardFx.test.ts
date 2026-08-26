import { describe, expect, it } from 'vitest'
import {
  dashboardNeedsRemoteFx,
  shouldFetchFrankfurter,
} from './dashboardFx'

describe('dashboard FX policy (#113)', () => {
  it('skips remote FX work in Original mode', () => {
    expect(dashboardNeedsRemoteFx(true)).toBe(false)
    expect(dashboardNeedsRemoteFx(false)).toBe(true)
  })

  it('skips Frankfurter while offline', () => {
    expect(shouldFetchFrankfurter(false)).toBe(false)
    expect(shouldFetchFrankfurter(true)).toBe(true)
  })
})

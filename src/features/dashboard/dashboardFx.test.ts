import { describe, expect, it } from 'vitest'
import { dashboardNeedsRemoteFx } from './dashboardFx'

describe('dashboard FX policy (#113)', () => {
  it('skips remote FX work in Original mode', () => {
    expect(dashboardNeedsRemoteFx(true)).toBe(false)
    expect(dashboardNeedsRemoteFx(false)).toBe(true)
  })
})

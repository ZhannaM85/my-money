import { describe, expect, it } from 'vitest'
import { dashboardFxNote, dashboardNeedsRemoteFx } from './dashboardFx'

describe('dashboard FX policy (#113)', () => {
  it('skips remote FX work in Original mode', () => {
    expect(dashboardNeedsRemoteFx(true)).toBe(false)
    expect(dashboardNeedsRemoteFx(false)).toBe(true)
  })
})

describe('dashboard FX subheader (#277, #302)', () => {
  const fxMissing = (codes: string) => `missing:${codes}`

  it('stays off in Original', () => {
    expect(
      dashboardFxNote({
        isOriginal: true,
        missingCodes: ['USD'],
        fxMissing,
      }),
    ).toBeUndefined()
  })

  it('uses the missing-rate line when a quote is absent', () => {
    expect(
      dashboardFxNote({
        isOriginal: false,
        missingCodes: ['USD'],
        fxMissing,
      }),
    ).toBe('missing:USD')
  })

  it('stays off when rates exist (#302)', () => {
    expect(
      dashboardFxNote({
        isOriginal: false,
        missingCodes: [],
        fxMissing,
      }),
    ).toBeUndefined()
  })
})

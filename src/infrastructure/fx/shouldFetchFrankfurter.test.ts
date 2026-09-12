import { describe, expect, it } from 'vitest'
import { shouldFetchFrankfurter } from './shouldFetchFrankfurter'

describe('shouldFetchFrankfurter (#113, #242)', () => {
  it('skips Frankfurter while offline', () => {
    expect(shouldFetchFrankfurter(false)).toBe(false)
    expect(shouldFetchFrankfurter(true)).toBe(true)
  })
})

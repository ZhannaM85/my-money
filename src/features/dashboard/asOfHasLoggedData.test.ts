import { describe, expect, it } from 'vitest'
import { asOfHasLoggedData } from './asOfHasLoggedData'

describe('asOfHasLoggedData (#145)', () => {
  it('treats today (no explicit As of) as having data', () => {
    expect(asOfHasLoggedData(null, '2026-01-15')).toBe(true)
  })

  it('is true on and after the first snapshot', () => {
    expect(asOfHasLoggedData('2026-01-15', '2026-01-15')).toBe(true)
    expect(asOfHasLoggedData('2026-08-29', '2026-01-15')).toBe(true)
  })

  it('is false before the first snapshot', () => {
    expect(asOfHasLoggedData('2022-12-31', '2026-01-15')).toBe(false)
  })
})

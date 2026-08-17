import { describe, expect, it } from 'vitest'
import { addDaysIso, isoDatesInclusive, monthStartIso } from './dates'

describe('date helpers', () => {
  it('walks inclusive UTC calendar days and finds month start', () => {
    expect(monthStartIso('2026-08-17')).toBe('2026-08-01')
    expect(addDaysIso('2026-08-31', 1)).toBe('2026-09-01')
    expect(isoDatesInclusive('2026-08-30', '2026-09-01')).toEqual([
      '2026-08-30',
      '2026-08-31',
      '2026-09-01',
    ])
  })
})

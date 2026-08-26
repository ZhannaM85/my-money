import { describe, expect, it } from 'vitest'
import {
  addDaysIso,
  canPanHistoryEarlier,
  canPanHistoryLater,
  isoDatesInclusive,
  isIsoDate,
  isIsoDateOnOrBefore,
  monthStartIso,
  rangeStartIso,
  isRangeClampedToEarliest,
  shiftHistoryRangeEnd,
  unclampedRangeStartIso,
  stepHistoryRange,
} from './dates'

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

  it('clamps history ranges to the earliest snapshot (#90)', () => {
    expect(rangeStartIso('1M', '2026-08-17', '2026-08-01')).toBe('2026-08-01')
    expect(rangeStartIso('All', '2026-08-17', '2026-01-01')).toBe('2026-01-01')
    expect(unclampedRangeStartIso('3M', '2026-08-22')).toBe('2026-05-24')
    expect(isRangeClampedToEarliest('3M', '2026-08-22', '2026-08-17')).toBe(
      true,
    )
    expect(isRangeClampedToEarliest('3M', '2026-08-22', '2026-01-01')).toBe(
      false,
    )
  })

  it('steps chart ranges the same way as zoom in / zoom out', () => {
    expect(stepHistoryRange('1M', 'in')).toBe('1M')
    expect(stepHistoryRange('1M', 'out')).toBe('3M')
    expect(stepHistoryRange('All', 'out')).toBe('All')
    expect(stepHistoryRange('All', 'in')).toBe('1Y')
  })

  it('shifts the visible window end for timeline pan (#111)', () => {
    expect(
      shiftHistoryRangeEnd(
        '2026-08-25',
        '1M',
        'earlier',
        '2026-08-25',
        '2026-01-01',
      ),
    ).toBe('2026-08-18')
    expect(
      shiftHistoryRangeEnd(
        '2026-08-18',
        '1M',
        'later',
        '2026-08-25',
        '2026-01-01',
      ),
    ).toBe('2026-08-25')
    expect(
      shiftHistoryRangeEnd(
        '2026-08-25',
        '1M',
        'later',
        '2026-08-25',
        '2026-01-01',
      ),
    ).toBe('2026-08-25')
    expect(
      shiftHistoryRangeEnd(
        '2026-01-01',
        '1M',
        'earlier',
        '2026-08-25',
        '2026-01-01',
      ),
    ).toBe('2026-01-01')
    expect(canPanHistoryEarlier('2026-08-25', '1M', '2026-01-01')).toBe(true)
    expect(canPanHistoryLater('2026-08-25', '1M', '2026-08-25')).toBe(false)
    expect(canPanHistoryEarlier('2026-08-25', 'All', '2026-01-01')).toBe(false)
  })

  it('accepts calendar ISO dates on or before today', () => {
    expect(isIsoDate('2026-08-17')).toBe(true)
    expect(isIsoDate('2026-08-32')).toBe(false)
    expect(isIsoDateOnOrBefore('2026-08-17', '2026-08-18')).toBe(true)
    expect(isIsoDateOnOrBefore('2026-08-19', '2026-08-18')).toBe(false)
  })
})

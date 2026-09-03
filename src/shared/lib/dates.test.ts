import { describe, expect, it } from 'vitest'
import {
  addDaysIso,
  addMonthsIso,
  canPanHistoryEarlier,
  canPanHistoryLater,
  canZoomHistoryIn,
  canZoomHistoryOut,
  isoDatesInclusive,
  isIsoDate,
  isIsoDateOnOrBefore,
  monthGridCells,
  monthStartIso,
  rangeStartIso,
  resolveDashboardChartEnd,
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

  it('builds a Monday-start month grid (#189)', () => {
    expect(addMonthsIso('2026-08-01', 1)).toBe('2026-09-01')
    expect(addMonthsIso('2026-01-31', -1).startsWith('2025-12')).toBe(true)
    const cells = monthGridCells('2026-08-01')
    expect(cells).toHaveLength(42)
    expect(cells[0]?.date).toBe('2026-07-27')
    expect(cells[0]?.inMonth).toBe(false)
    expect(cells.find((cell) => cell.date === '2026-08-01')?.inMonth).toBe(true)
    expect(cells[5]?.date).toBe('2026-08-01')
  })

  it('clamps history ranges to the earliest snapshot (#90)', () => {
    expect(rangeStartIso('1M', '2026-08-17', '2026-08-01')).toBe('2026-08-01')
    expect(rangeStartIso('All', '2026-08-17', '2026-01-01')).toBe('2026-01-01')
    expect(unclampedRangeStartIso('1Y', '2026-08-22')).toBe('2025-08-22')
    expect(isRangeClampedToEarliest('1Y', '2026-08-22', '2026-08-17')).toBe(
      true,
    )
    expect(isRangeClampedToEarliest('1Y', '2026-08-22', '2025-01-01')).toBe(
      false,
    )
  })

  it('supports week and custom bounds (#126)', () => {
    expect(unclampedRangeStartIso('1W', '2026-08-22')).toBe('2026-08-15')
    expect(
      rangeStartIso('Custom', '2026-08-20', '2026-01-01', '2026-08-01'),
    ).toBe('2026-08-01')
    expect(
      rangeStartIso('Custom', '2026-08-20', '2026-08-10', '2026-08-01'),
    ).toBe('2026-08-10')
  })

  it('steps chart ranges the same way as zoom in / zoom out (#126)', () => {
    expect(stepHistoryRange('1W', 'in')).toBe('1W')
    expect(stepHistoryRange('1W', 'out')).toBe('1M')
    expect(stepHistoryRange('1M', 'out')).toBe('1Y')
    expect(stepHistoryRange('All', 'out')).toBe('All')
    expect(stepHistoryRange('All', 'in')).toBe('1Y')
    expect(stepHistoryRange('Custom', 'in')).toBe('Custom')
    expect(canZoomHistoryIn('1W')).toBe(false)
    expect(canZoomHistoryOut('1W')).toBe(true)
    expect(canZoomHistoryIn('Custom')).toBe(false)
    expect(canZoomHistoryOut('Custom')).toBe(false)
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
    expect(canPanHistoryEarlier('2026-08-25', 'Custom', '2026-01-01')).toBe(
      false,
    )
  })

  it('accepts calendar ISO dates on or before today', () => {
    expect(isIsoDate('2026-08-17')).toBe(true)
    expect(isIsoDate('2026-08-32')).toBe(false)
    expect(isIsoDateOnOrBefore('2026-08-17', '2026-08-18')).toBe(true)
    expect(isIsoDateOnOrBefore('2026-08-19', '2026-08-18')).toBe(false)
  })

  it('defaults the dashboard chart end to today unless pinned (#210)', () => {
    expect(
      resolveDashboardChartEnd('1M', '2026-08-28', '2026-09-03', '2026-09-03', false),
    ).toBe('2026-09-03')
    expect(
      resolveDashboardChartEnd('1M', '2026-08-28', '2026-09-03', '2026-09-03', true),
    ).toBe('2026-08-28')
    expect(
      resolveDashboardChartEnd('All', '2026-08-28', '2026-09-03', '2026-09-03', true),
    ).toBe('2026-09-03')
    expect(
      resolveDashboardChartEnd('Custom', '2026-08-28', '2026-09-03', '2026-08-20', false),
    ).toBe('2026-08-20')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { todayIsoDate } from '@/shared/lib/money'
import { useFxStore } from '@/stores/fxStore'
import { fxRefreshWindow, refreshFxRates } from './refreshFxRates'

describe('fxRefreshWindow', () => {
  it('uses today and no symbols when the book is empty', () => {
    expect(fxRefreshWindow([], '2026-09-20')).toEqual({
      start: '2026-09-20',
      symbols: [],
    })
  })

  it('takes the earliest snapshot date and distinct currencies', () => {
    expect(
      fxRefreshWindow(
        [
          { date: '2026-03-01', currency: 'USD' },
          { date: '2026-01-15', currency: 'EUR' },
          { date: '2026-02-01', currency: 'USD' },
        ],
        '2026-09-20',
      ),
    ).toEqual({
      start: '2026-01-15',
      symbols: ['USD', 'EUR'],
    })
  })
})

describe('refreshFxRates (#254)', () => {
  const originalEnsureRange = useFxStore.getState().ensureRange
  const originalMarkRatesFetched = useFxStore.getState().markRatesFetched

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    useFxStore.setState({
      ensureRange: originalEnsureRange,
      markRatesFetched: originalMarkRatesFetched,
      error: undefined,
    })
  })

  it('force-fetches the range and stamps last-updated when online', async () => {
    const ensureRange = vi.fn(async () => {})
    const markRatesFetched = vi.fn()
    useFxStore.setState({ ensureRange, markRatesFetched, error: undefined })

    await expect(
      refreshFxRates('2026-01-01', '2026-09-20', 'EUR', ['USD', 'GEL']),
    ).resolves.toBe('updated')

    expect(ensureRange).toHaveBeenCalledWith(
      '2026-01-01',
      '2026-09-20',
      'EUR',
      ['USD', 'GEL'],
      { force: true },
    )
    expect(markRatesFetched).toHaveBeenCalledTimes(1)
  })

  it('does not stamp last-updated when the device is offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    const ensureRange = vi.fn(async () => {})
    const markRatesFetched = vi.fn()
    useFxStore.setState({ ensureRange, markRatesFetched, error: undefined })

    await expect(
      refreshFxRates(todayIsoDate(), todayIsoDate(), 'EUR', ['USD']),
    ).resolves.toBe('offline')
    expect(ensureRange).toHaveBeenCalled()
    expect(markRatesFetched).not.toHaveBeenCalled()
  })

  it('reports error when ensureRange left an error on the store', async () => {
    const ensureRange = vi.fn(async () => {
      useFxStore.setState({ error: 'cached_rates' })
    })
    const markRatesFetched = vi.fn()
    useFxStore.setState({ ensureRange, markRatesFetched, error: undefined })

    await expect(
      refreshFxRates('2026-01-01', '2026-09-20', 'EUR', ['USD']),
    ).resolves.toBe('error')
    expect(markRatesFetched).not.toHaveBeenCalled()
  })
})

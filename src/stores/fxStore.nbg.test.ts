import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useFxStore } from '@/stores/fxStore'

const {
  ensureFxRange,
  ensureFxRates,
  ensureNbgRange,
  ensureNbgRates,
  ensureStaticRubRange,
  ensureStaticRubRates,
} = vi.hoisted(() => ({
  ensureFxRates: vi.fn(async () => []),
  ensureFxRange: vi.fn(async () => []),
  ensureNbgRates: vi.fn(async () => []),
  ensureNbgRange: vi.fn(async () => []),
  ensureStaticRubRates: vi.fn(async () => []),
  ensureStaticRubRange: vi.fn(async () => []),
}))

vi.mock('@/infrastructure/fx/frankfurter', async () => {
  const actual = await vi.importActual<
    typeof import('@/infrastructure/fx/frankfurter')
  >('@/infrastructure/fx/frankfurter')
  return {
    ...actual,
    FrankfurterFxClient: class FrankfurterFxClient {},
    ensureFxRates,
    ensureFxRange,
  }
})

vi.mock('@/infrastructure/fx/nbg', () => ({
  NbgFxClient: class NbgFxClient {},
  ensureNbgRates,
  ensureNbgRange,
}))

vi.mock('@/infrastructure/fx/rubStatic', () => ({
  StaticRubRateClient: class StaticRubRateClient {},
  ensureStaticRubRates,
  ensureStaticRubRange,
}))

beforeEach(async () => {
  await db.fxRates.clear()
  await db.manualFxRates.clear()
  ensureFxRates.mockReset()
  ensureFxRates.mockResolvedValue([])
  ensureFxRange.mockReset()
  ensureFxRange.mockResolvedValue([])
  ensureNbgRates.mockReset()
  ensureNbgRates.mockResolvedValue([])
  ensureNbgRange.mockReset()
  ensureNbgRange.mockResolvedValue([])
  ensureStaticRubRates.mockReset()
  ensureStaticRubRates.mockResolvedValue([])
  ensureStaticRubRange.mockReset()
  ensureStaticRubRange.mockResolvedValue([])
  useFxStore.setState({
    quotes: [],
    manualQuotes: [],
    loading: false,
    error: undefined,
  })
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
})

describe('fxStore NBG wiring (#301)', () => {
  it('fetches live NBG for RUB requests while still calling Frankfurter', async () => {
    await useFxStore.getState().ensureRates([
      { from: 'USD', to: 'EUR', date: '2026-09-29' },
      { from: 'USD', to: 'RUB', date: '2026-09-29' },
    ])

    expect(ensureFxRates).toHaveBeenCalledTimes(1)
    expect(ensureNbgRates).toHaveBeenCalledTimes(1)
    expect(ensureStaticRubRates).toHaveBeenCalledTimes(1)
    expect(useFxStore.getState().error).toBeUndefined()
  })

  it('passes force through ensureRange for Обновить курсы / pull-to-refresh', async () => {
    await useFxStore
      .getState()
      .ensureRange('2026-01-01', '2026-09-29', 'RUB', ['USD'], { force: true })

    expect(ensureFxRange).toHaveBeenCalledWith(
      '2026-01-01',
      '2026-09-29',
      'RUB',
      ['USD'],
      expect.anything(),
      expect.anything(),
      { force: true },
    )
    expect(ensureStaticRubRange).toHaveBeenCalledWith(
      '2026-01-01',
      '2026-09-29',
      'RUB',
      ['USD'],
      expect.anything(),
      expect.anything(),
      { force: true },
    )
    expect(ensureNbgRange).toHaveBeenCalledWith(
      '2026-01-01',
      '2026-09-29',
      'RUB',
      ['USD'],
      expect.anything(),
      expect.anything(),
      { force: true },
    )
  })

  it('skips NBG and Frankfurter while offline and still loads static RUB', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    await useFxStore
      .getState()
      .ensureRange('2026-09-29', '2026-09-29', 'RUB', ['USD'], { force: true })

    expect(ensureNbgRange).not.toHaveBeenCalled()
    expect(ensureFxRange).not.toHaveBeenCalled()
    expect(ensureStaticRubRange).toHaveBeenCalledTimes(1)
    expect(useFxStore.getState().error).toBeUndefined()
  })

  it('keeps cached quotes available when NBG fails', async () => {
    ensureNbgRates.mockRejectedValueOnce(new Error('offline'))

    await useFxStore
      .getState()
      .ensureRates([{ from: 'USD', to: 'RUB', date: '2026-09-29' }])

    expect(useFxStore.getState().error).toBe('cached_rates')
    expect(useFxStore.getState().loading).toBe(false)
  })
})

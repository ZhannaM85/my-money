import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Asset } from '@/domain/asset'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from './db'
import { IndexedDbAssetRepository } from './assetRepository'
import { IndexedDbSnapshotRepository } from './snapshotRepository'
import { IndexedDbSettingsRepository } from './settingsRepository'
import { IndexedDbFxRateRepository } from './fxRateRepository'

const assets = new IndexedDbAssetRepository()
const snapshots = new IndexedDbSnapshotRepository()
const settings = new IndexedDbSettingsRepository()
const fx = new IndexedDbFxRateRepository()

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  const now = '2026-01-01T00:00:00.000Z'
  return {
    id: 'asset-1',
    name: 'Revolut',
    assetClass: 'money',
    type: 'bank',
    currency: 'EUR',
    trackingStatus: 'included',
    valuationMethod: 'account_balance',
    updateFrequency: 'weekly',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  await db.fxRates.clear()
})

afterEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  await db.fxRates.clear()
})

describe('IndexedDb repositories', () => {
  it('round-trips an asset', async () => {
    const row = makeAsset()
    await assets.upsert(row)
    expect(await assets.getById(row.id)).toEqual(row)
    expect(await assets.getAll()).toEqual([row])
    await assets.delete(row.id)
    expect(await assets.getById(row.id)).toBeUndefined()
  })

  it('appends snapshots and reads latest / on-or-before', async () => {
    await snapshots.append({
      id: 's1',
      assetId: 'asset-1',
      date: '2026-07-01',
      amount: 10,
      currency: 'EUR',
      createdAt: '2026-07-01T00:00:00.000Z',
    })
    await snapshots.append({
      id: 's2',
      assetId: 'asset-1',
      date: '2026-08-01',
      amount: 20,
      currency: 'EUR',
      createdAt: '2026-08-01T00:00:00.000Z',
    })
    expect((await snapshots.getLatestByAsset('asset-1'))?.amount).toBe(20)
    expect(
      (await snapshots.getOnOrBefore('asset-1', '2026-07-15'))?.amount,
    ).toBe(10)
    await snapshots.deleteByAsset('asset-1')
    expect(await snapshots.getByAsset('asset-1')).toEqual([])
  })

  it('returns default settings until saved', async () => {
    expect(await settings.get()).toEqual(DEFAULT_SETTINGS)
    await settings.save({
      ...DEFAULT_SETTINGS,
      baseCurrency: 'USD',
      updatedAt: '2026-08-01T00:00:00.000Z',
    })
    expect((await settings.get()).baseCurrency).toBe('USD')
  })

  it('fills missing onboardingCompleted on older settings rows', async () => {
    await db.settings.put({
      id: 'singleton',
      baseCurrency: 'GBP',
      locale: 'en',
      updatedAt: '2026-08-01T00:00:00.000Z',
    } as never)
    const loaded = await settings.get()
    expect(loaded.baseCurrency).toBe('GBP')
    expect(loaded.onboardingCompleted).toBe(false)
  })

  it('stores FX quotes and looks up inverse rates', async () => {
    await fx.put([{ date: '2026-08-01', base: 'EUR', quote: 'USD', rate: 1.1 }])
    expect(await fx.getRate('EUR', 'USD', '2026-08-01')).toBe(1.1)
    expect(await fx.getRate('USD', 'EUR', '2026-08-01')).toBeCloseTo(1 / 1.1)
    expect(await fx.getRate('EUR', 'EUR', '2026-08-01')).toBe(1)
    expect(await fx.getAll()).toHaveLength(1)
  })
})

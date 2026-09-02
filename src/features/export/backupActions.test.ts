import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { buildBackupBundle } from '@/domain/backup'
import { db } from '@/infrastructure/persistence/indexeddb'
import {
  BookNotEmptyError,
  exportBackup,
  importBackupJson,
  InvalidBackupError,
} from './backupActions'

const now = '2026-08-17T00:00:00.000Z'

const asset = {
  id: 'a1',
  name: 'Revolut',
  assetClass: 'money' as const,
  type: 'bank' as const,
  currency: 'EUR',
  trackingStatus: 'included' as const,
  valuationMethod: 'account_balance' as const,
  updateFrequency: 'weekly' as const,
  createdAt: now,
  updatedAt: now,
}

const snapshot = {
  id: 's1',
  assetId: 'a1',
  date: '2026-08-17',
  amount: 1000,
  currency: 'EUR',
  createdAt: now,
}

const fxRate = {
  date: '2026-08-17',
  base: 'EUR',
  quote: 'USD',
  rate: 1.1,
}

const manualFxRate = {
  date: '2026-08-17',
  base: 'USD',
  quote: 'RUB',
  rate: 80,
}

const bundle = buildBackupBundle(
  { ...DEFAULT_SETTINGS, baseCurrency: 'USD', onboardingCompleted: true },
  [asset],
  [snapshot],
  now,
  [fxRate],
  [manualFxRate],
)

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  await db.fxRates.clear()
  await db.manualFxRates.clear()
})

describe('JSON backup', () => {
  it('round-trips settings, assets, snapshots, and FX quotes through an empty book (#194)', async () => {
    await importBackupJson(JSON.stringify(bundle))
    const exported = await exportBackup()
    expect(exported.version).toBe(2)
    expect(exported.settings.baseCurrency).toBe('USD')
    expect(exported.settings.onboardingCompleted).toBe(true)
    expect(exported.assets).toEqual([asset])
    expect(exported.snapshots).toEqual([snapshot])
    expect(exported.fxRates).toEqual([fxRate])
    expect(exported.manualFxRates).toEqual([manualFxRate])
  })

  it('imports a v1 JSON file with empty FX tables (#194)', async () => {
    const v1 = {
      version: 1 as const,
      exportedAt: now,
      settings: bundle.settings,
      assets: [asset],
      snapshots: [snapshot],
    }
    await importBackupJson(JSON.stringify(v1))
    const exported = await exportBackup()
    expect(exported.fxRates).toEqual([])
    expect(exported.manualFxRates).toEqual([])
    expect(exported.assets).toEqual([asset])
  })

  it('refuses to import when the book already has assets', async () => {
    await db.assets.put(asset)
    await expect(
      importBackupJson(JSON.stringify(bundle)),
    ).rejects.toBeInstanceOf(BookNotEmptyError)
  })

  it('rejects invalid JSON and orphan snapshots', async () => {
    await expect(importBackupJson('not-json')).rejects.toBeInstanceOf(
      InvalidBackupError,
    )
    const orphan = {
      ...bundle,
      snapshots: [{ ...snapshot, assetId: 'missing' }],
    }
    await expect(
      importBackupJson(JSON.stringify(orphan)),
    ).rejects.toBeInstanceOf(InvalidBackupError)
  })
})

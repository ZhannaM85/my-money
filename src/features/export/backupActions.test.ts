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

const bundle = buildBackupBundle(
  { ...DEFAULT_SETTINGS, baseCurrency: 'USD', onboardingCompleted: true },
  [asset],
  [snapshot],
  now,
)

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
})

describe('JSON backup', () => {
  it('round-trips settings, assets, and snapshots through an empty book', async () => {
    await importBackupJson(JSON.stringify(bundle))
    const exported = await exportBackup()
    expect(exported.version).toBe(1)
    expect(exported.settings.baseCurrency).toBe('USD')
    expect(exported.settings.onboardingCompleted).toBe(true)
    expect(exported.assets).toEqual([asset])
    expect(exported.snapshots).toEqual([snapshot])
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

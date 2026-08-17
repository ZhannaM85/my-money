import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { buildBackupBundle } from './BackupBundle'

describe('buildBackupBundle', () => {
  it('wraps settings, assets, and snapshots as version 1', () => {
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
    const bundle = buildBackupBundle(DEFAULT_SETTINGS, [asset], [snapshot], now)
    expect(bundle).toEqual({
      version: 1,
      exportedAt: now,
      settings: DEFAULT_SETTINGS,
      assets: [asset],
      snapshots: [snapshot],
    })
  })
})

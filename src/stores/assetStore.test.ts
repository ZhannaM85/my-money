import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from './assetStore'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
})

describe('assetStore', () => {
  it('creates an asset with a snapshot and keeps history when archived', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Revolut',
        assetClass: 'money',
        type: 'bank',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    expect(useAssetStore.getState().assets).toHaveLength(1)
    expect(useAssetStore.getState().snapshots).toHaveLength(1)

    await useAssetStore.getState().setTrackingStatus('a1', 'archived')
    const state = useAssetStore.getState()
    expect(state.assets[0].trackingStatus).toBe('archived')
    expect(state.snapshots).toHaveLength(1)
    expect(state.snapshots[0].amount).toBe(1000)
  })
})

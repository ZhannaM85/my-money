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

  it('appends same-amount snapshots in bulk', async () => {
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
        createdAt: '2026-08-17T00:00:00.000Z',
        updatedAt: '2026-08-17T00:00:00.000Z',
      },
      {
        assetId: 'a1',
        date: '2026-08-01',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    ])
    expect(useAssetStore.getState().snapshots).toHaveLength(2)
  })

  it('deletes an asset and its snapshots', async () => {
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
    await useAssetStore.getState().deleteAsset('a1')
    expect(useAssetStore.getState().assets).toHaveLength(0)
    expect(useAssetStore.getState().snapshots).toHaveLength(0)
  })

  it('deletes one snapshot without deleting the asset', async () => {
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
        date: '2026-08-01',
        amount: 800,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    ])
    const firstId = useAssetStore
      .getState()
      .snapshots.find((row) => row.date === '2026-08-01')?.id
    expect(firstId).toBeDefined()
    await useAssetStore.getState().deleteSnapshot(firstId!)
    expect(useAssetStore.getState().assets).toHaveLength(1)
    expect(useAssetStore.getState().snapshots).toHaveLength(1)
    expect(useAssetStore.getState().snapshots[0]?.date).toBe('2026-08-17')
  })

  it('updates an existing snapshot in place', async () => {
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
        date: '2026-08-01',
        amount: 800,
        currency: 'EUR',
      },
    )
    const existing = useAssetStore.getState().snapshots[0]
    expect(existing).toBeDefined()
    await useAssetStore.getState().updateSnapshot({
      ...existing!,
      amount: 850,
      date: '2026-07-15',
    })
    const rows = useAssetStore.getState().snapshots
    expect(rows).toHaveLength(1)
    expect(rows[0]?.id).toBe(existing!.id)
    expect(rows[0]?.amount).toBe(850)
    expect(rows[0]?.date).toBe('2026-07-15')
  })
})

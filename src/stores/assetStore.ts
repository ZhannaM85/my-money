import { create } from 'zustand'
import {
  SnapshotAfterEndError,
  snapshotWriteBlocked,
  type Asset,
  type BalanceHeadline,
  type TrackingStatus,
} from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import {
  IndexedDbAssetRepository,
  IndexedDbSnapshotRepository,
} from '@/infrastructure/persistence/indexeddb'

const assetRepository = new IndexedDbAssetRepository()
const snapshotRepository = new IndexedDbSnapshotRepository()

/** Only the latest in-flight `load()` may write the store (#225). */
let loadGeneration = 0

interface AssetStoreState {
  assets: Asset[]
  snapshots: AssetSnapshot[]
  loaded: boolean
  load: () => Promise<void>
  saveAsset: (
    asset: Asset,
    snapshot?: Omit<AssetSnapshot, 'id' | 'createdAt'> & {
      id?: string
      createdAt?: string
    },
  ) => Promise<void>
  setTrackingStatus: (
    id: string,
    trackingStatus: TrackingStatus,
  ) => Promise<void>
  /** `null` clears the end date and restores the asset (#328). */
  setEndedOn: (id: string, endedOn: string | null) => Promise<void>
  setBalanceHeadline: (
    id: string,
    balanceHeadline: BalanceHeadline,
  ) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  deleteSnapshot: (id: string) => Promise<void>
  updateSnapshot: (snapshot: AssetSnapshot) => Promise<void>
  saveSnapshots: (
    snapshots: readonly (Omit<AssetSnapshot, 'id' | 'createdAt'> & {
      id?: string
      createdAt?: string
    })[],
  ) => Promise<void>
}

export const useAssetStore = create<AssetStoreState>((set, get) => ({
  assets: [],
  snapshots: [],
  loaded: false,
  load: async () => {
    const generation = ++loadGeneration
    const [assets, snapshots] = await Promise.all([
      assetRepository.getAll(),
      snapshotRepository.getAll(),
    ])
    if (generation !== loadGeneration) return
    set({ assets, snapshots, loaded: true })
  },
  saveAsset: async (asset, snapshot) => {
    if (snapshot && snapshotWriteBlocked(asset, snapshot.date)) {
      throw new SnapshotAfterEndError(asset.endedOn ?? snapshot.date)
    }
    await assetRepository.upsert(asset)
    if (snapshot) {
      await snapshotRepository.append({
        id: snapshot.id ?? crypto.randomUUID(),
        createdAt: snapshot.createdAt ?? new Date().toISOString(),
        assetId: snapshot.assetId,
        date: snapshot.date,
        amount: snapshot.amount,
        currency: snapshot.currency,
        ...(snapshot.note ? { note: snapshot.note } : {}),
        ...(snapshot.flow !== undefined ? { flow: snapshot.flow } : {}),
      })
    }
    await get().load()
  },
  setTrackingStatus: async (id, trackingStatus) => {
    const existing = get().assets.find((asset) => asset.id === id)
    if (!existing) return
    await assetRepository.upsert({
      ...existing,
      trackingStatus,
      updatedAt: new Date().toISOString(),
    })
    await get().load()
  },
  setEndedOn: async (id, endedOn) => {
    const existing = get().assets.find((asset) => asset.id === id)
    if (!existing) return
    if (endedOn !== null && !/^\d{4}-\d{2}-\d{2}$/.test(endedOn)) return
    const next: Asset = {
      ...existing,
      updatedAt: new Date().toISOString(),
    }
    if (endedOn) next.endedOn = endedOn
    else delete next.endedOn
    await assetRepository.upsert(next)
    await get().load()
  },
  setBalanceHeadline: async (id, balanceHeadline) => {
    const existing = get().assets.find((asset) => asset.id === id)
    if (!existing) return
    const next: Asset = {
      ...existing,
      updatedAt: new Date().toISOString(),
    }
    if (balanceHeadline === 'given_spent') {
      next.balanceHeadline = 'given_spent'
    } else {
      delete next.balanceHeadline
    }
    await assetRepository.upsert(next)
    await get().load()
  },
  deleteAsset: async (id) => {
    await snapshotRepository.deleteByAsset(id)
    await assetRepository.delete(id)
    await get().load()
  },
  deleteSnapshot: async (id) => {
    await snapshotRepository.deleteById(id)
    await get().load()
  },
  updateSnapshot: async (snapshot) => {
    const asset = get().assets.find((row) => row.id === snapshot.assetId)
    const previous = get().snapshots.find((row) => row.id === snapshot.id)
    if (snapshotWriteBlocked(asset, snapshot.date, previous?.date)) {
      throw new SnapshotAfterEndError(asset?.endedOn ?? snapshot.date)
    }
    await snapshotRepository.upsert(snapshot)
    await get().load()
  },
  saveSnapshots: async (snapshots) => {
    for (const snapshot of snapshots) {
      const asset = get().assets.find((row) => row.id === snapshot.assetId)
      if (snapshotWriteBlocked(asset, snapshot.date)) {
        throw new SnapshotAfterEndError(asset?.endedOn ?? snapshot.date)
      }
    }
    for (const snapshot of snapshots) {
      await snapshotRepository.append({
        id: snapshot.id ?? crypto.randomUUID(),
        createdAt: snapshot.createdAt ?? new Date().toISOString(),
        assetId: snapshot.assetId,
        date: snapshot.date,
        amount: snapshot.amount,
        currency: snapshot.currency,
        ...(snapshot.note ? { note: snapshot.note } : {}),
        ...(snapshot.flow !== undefined ? { flow: snapshot.flow } : {}),
      })
    }
    await get().load()
  },
}))

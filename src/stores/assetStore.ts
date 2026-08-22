import { create } from 'zustand'
import type { Asset, TrackingStatus } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import {
  IndexedDbAssetRepository,
  IndexedDbSnapshotRepository,
} from '@/infrastructure/persistence/indexeddb'

const assetRepository = new IndexedDbAssetRepository()
const snapshotRepository = new IndexedDbSnapshotRepository()

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
    const assets = await assetRepository.getAll()
    const snapshots = (
      await Promise.all(
        assets.map((asset) => snapshotRepository.getByAsset(asset.id)),
      )
    ).flat()
    set({ assets, snapshots, loaded: true })
  },
  saveAsset: async (asset, snapshot) => {
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
    await snapshotRepository.upsert(snapshot)
    await get().load()
  },
  saveSnapshots: async (snapshots) => {
    for (const snapshot of snapshots) {
      await snapshotRepository.append({
        id: snapshot.id ?? crypto.randomUUID(),
        createdAt: snapshot.createdAt ?? new Date().toISOString(),
        assetId: snapshot.assetId,
        date: snapshot.date,
        amount: snapshot.amount,
        currency: snapshot.currency,
        ...(snapshot.note ? { note: snapshot.note } : {}),
      })
    }
    await get().load()
  },
}))

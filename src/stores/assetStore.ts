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
}))

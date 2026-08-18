import Dexie, { type Table } from 'dexie'
import type { Asset } from '@/domain/asset'
import type { Settings } from '@/domain/settings'
import type { AssetSnapshot } from '@/domain/snapshot'
import type { FxRateQuote } from '@/domain/fx'

export class AppDatabase extends Dexie {
  assets!: Table<Asset, string>
  snapshots!: Table<AssetSnapshot, string>
  settings!: Table<Settings, string>
  fxRates!: Table<FxRateQuote, [string, string, string]>
  manualFxRates!: Table<FxRateQuote, [string, string, string]>

  constructor() {
    super('my-money')
    this.version(1).stores({
      assets: 'id, assetClass, trackingStatus, currency',
      snapshots: 'id, assetId, date, [assetId+date]',
      settings: 'id',
      fxRates: '[date+base+quote], date, base, quote',
    })
    this.version(2).stores({
      assets: 'id, assetClass, trackingStatus, currency',
      snapshots: 'id, assetId, date, [assetId+date]',
      settings: 'id',
      fxRates: '[date+base+quote], date, base, quote',
      manualFxRates: '[date+base+quote], date',
    })
  }
}

export const db = new AppDatabase()

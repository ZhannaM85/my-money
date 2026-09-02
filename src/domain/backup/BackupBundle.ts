import type { Asset } from '@/domain/asset'
import type { FxRateQuote } from '@/domain/fx'
import type { Settings } from '@/domain/settings'
import type { AssetSnapshot } from '@/domain/snapshot'

export const BACKUP_VERSION = 2 as const
export const BACKUP_VERSIONS = [1, 2] as const
export type BackupVersion = (typeof BACKUP_VERSIONS)[number]

export interface BackupBundle {
  version: BackupVersion
  exportedAt: string
  settings: Settings
  assets: Asset[]
  snapshots: AssetSnapshot[]
  /** Cached market quotes (#194). Empty on v1 files. */
  fxRates: FxRateQuote[]
  /** User-entered rate overrides (#194). Empty on v1 files. */
  manualFxRates: FxRateQuote[]
}

export function buildBackupBundle(
  settings: Settings,
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  exportedAt = new Date().toISOString(),
  fxRates: readonly FxRateQuote[] = [],
  manualFxRates: readonly FxRateQuote[] = [],
): BackupBundle {
  return {
    version: BACKUP_VERSION,
    exportedAt,
    settings,
    assets: [...assets],
    snapshots: [...snapshots],
    fxRates: [...fxRates],
    manualFxRates: [...manualFxRates],
  }
}

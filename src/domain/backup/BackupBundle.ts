import type { Asset } from '@/domain/asset'
import type { Settings } from '@/domain/settings'
import type { AssetSnapshot } from '@/domain/snapshot'

export const BACKUP_VERSION = 1 as const

export interface BackupBundle {
  version: typeof BACKUP_VERSION
  exportedAt: string
  settings: Settings
  assets: Asset[]
  snapshots: AssetSnapshot[]
}

export function buildBackupBundle(
  settings: Settings,
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  exportedAt = new Date().toISOString(),
): BackupBundle {
  return {
    version: BACKUP_VERSION,
    exportedAt,
    settings,
    assets: [...assets],
    snapshots: [...snapshots],
  }
}

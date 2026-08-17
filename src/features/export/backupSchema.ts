import { z } from 'zod'
import {
  ASSET_CLASSES,
  ASSET_TYPES,
  TRACKING_STATUSES,
  UPDATE_FREQUENCIES,
  VALUATION_METHODS,
} from '@/domain/asset'
import { BACKUP_VERSION, type BackupBundle } from '@/domain/backup'

const settingsSchema = z.object({
  id: z.literal('singleton'),
  baseCurrency: z.string().min(1),
  locale: z.enum(['en', 'ru']),
  onboardingCompleted: z.boolean().default(false),
  updatedAt: z.string().min(1),
})

const assetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  assetClass: z.enum(ASSET_CLASSES),
  type: z.enum(ASSET_TYPES),
  currency: z.string().min(1),
  institution: z.string().optional(),
  trackingStatus: z.enum(TRACKING_STATUSES),
  valuationMethod: z.enum(VALUATION_METHODS),
  purchaseValue: z.number().optional(),
  updateFrequency: z.enum(UPDATE_FREQUENCIES),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const snapshotSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  date: z.string().min(1),
  amount: z.number(),
  currency: z.string().min(1),
  createdAt: z.string().min(1),
})

export const backupBundleSchema = z
  .object({
    version: z.literal(BACKUP_VERSION),
    exportedAt: z.string().min(1),
    settings: settingsSchema,
    assets: z.array(assetSchema),
    snapshots: z.array(snapshotSchema),
  })
  .superRefine((bundle, ctx) => {
    const ids = new Set(bundle.assets.map((asset) => asset.id))
    for (const snapshot of bundle.snapshots) {
      if (!ids.has(snapshot.assetId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Snapshot ${snapshot.id} references missing asset ${snapshot.assetId}`,
          path: ['snapshots'],
        })
      }
    }
  })

export class InvalidBackupError extends Error {
  constructor(message = 'This file is not a valid My Money backup.') {
    super(message)
    this.name = 'InvalidBackupError'
  }
}

export function parseBackupJson(text: string): BackupBundle {
  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch {
    throw new InvalidBackupError('This file is not valid JSON.')
  }
  const parsed = backupBundleSchema.safeParse(data)
  if (!parsed.success) {
    throw new InvalidBackupError()
  }
  return parsed.data
}

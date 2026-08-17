import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { exportCsv, importCsv } from './csvActions'
import { guessCsvMapping, mappingIsComplete } from './csvImport'
import { parseCsv } from './csvParse'

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

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
})

describe('CSV export and import', () => {
  it('round-trips snapshots for existing assets and keeps unmatched rows visible', async () => {
    await db.assets.put(asset)
    await db.snapshots.put({
      id: 's1',
      assetId: 'a1',
      date: '2026-08-01',
      amount: 900,
      currency: 'EUR',
      createdAt: now,
    })

    const csv = await exportCsv()
    const mapping = guessCsvMapping(parseCsv(csv)[0] ?? [])
    if (!mappingIsComplete(mapping)) {
      throw new Error('expected exported headers to map')
    }

    const extra = `${csv}\r\n2026-08-17,missing,Unknown,50,EUR,money,bank`
    const result = await importCsv(extra, mapping)
    expect(result.snapshots).toHaveLength(1)
    expect(result.issues).toEqual([
      { rowNumber: 3, reason: 'unmatched_asset', asset: 'missing' },
    ])
    expect(await db.snapshots.count()).toBe(2)
  })
})

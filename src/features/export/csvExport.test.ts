import { describe, expect, it } from 'vitest'
import { buildSnapshotsCsv, CSV_HEADERS } from './csvExport'

const now = '2026-08-17T00:00:00.000Z'

const assets = [
  {
    id: 'a2',
    name: 'Broker',
    assetClass: 'investments' as const,
    type: 'brokerage' as const,
    currency: 'USD',
    trackingStatus: 'included' as const,
    valuationMethod: 'account_balance' as const,
    updateFrequency: 'monthly' as const,
    createdAt: now,
    updatedAt: now,
  },
  {
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
  },
]

describe('buildSnapshotsCsv', () => {
  it('writes a header and snapshot rows with asset metadata, sorted by date', () => {
    const csv = buildSnapshotsCsv(assets, [
      {
        id: 's2',
        assetId: 'a2',
        date: '2026-08-17',
        amount: 500,
        currency: 'USD',
        createdAt: now,
      },
      {
        id: 's1',
        assetId: 'a1',
        date: '2026-07-01',
        amount: 1000,
        currency: 'EUR',
        createdAt: now,
      },
    ])
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe(CSV_HEADERS.join(','))
    expect(lines[1]).toBe('2026-07-01,a1,Revolut,1000,EUR,money,bank,')
    expect(lines[2]).toBe('2026-08-17,a2,Broker,500,USD,investments,brokerage,')
  })

  it('quotes asset names that contain commas', () => {
    const csv = buildSnapshotsCsv(
      [{ ...assets[1], name: 'Cash, EUR' }],
      [
        {
          id: 's1',
          assetId: 'a1',
          date: '2026-08-17',
          amount: 10,
          currency: 'EUR',
          createdAt: now,
        },
      ],
    )
    expect(csv).toContain('"Cash, EUR"')
  })

  it('writes snapshot notes (#194)', () => {
    const csv = buildSnapshotsCsv(assets, [
      {
        id: 's1',
        assetId: 'a1',
        date: '2026-08-17',
        amount: 10,
        currency: 'EUR',
        createdAt: now,
        note: 'Salary landed',
      },
    ])
    expect(csv.split('\r\n')[1]).toBe(
      '2026-08-17,a1,Revolut,10,EUR,money,bank,Salary landed',
    )
  })
})

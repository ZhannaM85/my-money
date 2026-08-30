import { describe, expect, it } from 'vitest'
import {
  ensureAssetOrder,
  sortAssets,
  spliceVisibleOrder,
} from './assetListOrder'

const assets = [
  { id: 'b', name: 'Beta' },
  { id: 'a', name: 'Alpha' },
  { id: 'c', name: 'Cash' },
]

describe('assetListOrder (#100)', () => {
  it('sorts by name and amount and keeps custom order', () => {
    const amountOf = (asset: { id: string }) =>
      ({ a: 10, b: 30, c: 20 })[asset.id] ?? null
    expect(
      sortAssets(assets, {
        sort: 'name_asc',
        order: [],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['a', 'b', 'c'])
    expect(
      sortAssets(assets, {
        sort: 'name_desc',
        order: [],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['c', 'b', 'a'])
    expect(
      sortAssets(assets, {
        sort: 'amount_asc',
        order: [],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['a', 'c', 'b'])
    expect(
      sortAssets(assets, {
        sort: 'amount_desc',
        order: [],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['b', 'c', 'a'])
    expect(
      sortAssets(assets, {
        sort: 'custom',
        order: ['c', 'a'],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['c', 'a', 'b'])
  })

  it('puts assets with no amount last when sorting by amount', () => {
    expect(
      sortAssets(assets, {
        sort: 'amount_desc',
        order: [],
        locale: 'en',
        amountOf: (asset) => (asset.id === 'b' ? null : 5),
      }).map((row) => row.id),
    ).toEqual(['a', 'c', 'b'])
  })

  it('pins excluded assets after included, still sorted within each group (#160)', () => {
    const mixed = [
      { id: 'ex-b', name: 'Zeta', trackingStatus: 'excluded' as const },
      { id: 'inc-a', name: 'Beta', trackingStatus: 'included' as const },
      { id: 'ex-a', name: 'Alpha', trackingStatus: 'excluded' as const },
      { id: 'inc-b', name: 'Gamma', trackingStatus: 'included' as const },
    ]
    const amountOf = (asset: { id: string }) =>
      ({ 'inc-a': 10, 'inc-b': 30, 'ex-a': 5, 'ex-b': 50 })[asset.id] ?? null
    expect(
      sortAssets(mixed, {
        sort: 'name_asc',
        order: [],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['inc-a', 'inc-b', 'ex-a', 'ex-b'])
    expect(
      sortAssets(mixed, {
        sort: 'amount_desc',
        order: [],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['inc-b', 'inc-a', 'ex-b', 'ex-a'])
    expect(
      sortAssets(mixed, {
        sort: 'custom',
        order: ['ex-a', 'inc-b', 'ex-b', 'inc-a'],
        locale: 'en',
        amountOf,
      }).map((row) => row.id),
    ).toEqual(['inc-b', 'inc-a', 'ex-a', 'ex-b'])
  })

  it('reorders a filtered slice inside the full custom order', () => {
    expect(ensureAssetOrder(['c'], ['a', 'b', 'c'])).toEqual(['c', 'a', 'b'])
    expect(spliceVisibleOrder(['a', 'x', 'b', 'c'], ['a', 'b'], 0, 1)).toEqual([
      'b',
      'x',
      'a',
      'c',
    ])
  })
})

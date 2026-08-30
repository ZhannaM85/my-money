import type { TrackingStatus } from '@/domain/asset/Asset'
import type { AssetListSort } from '@/domain/settings'

export function ensureAssetOrder(
  order: readonly string[],
  assetIds: readonly string[],
): string[] {
  const known = new Set(order)
  const existing = order.filter((id) => assetIds.includes(id))
  const missing = assetIds.filter((id) => !known.has(id))
  return [...existing, ...missing]
}

export function spliceVisibleOrder(
  fullOrder: readonly string[],
  visibleIds: readonly string[],
  fromIndex: number,
  toIndex: number,
): string[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= visibleIds.length ||
    toIndex >= visibleIds.length
  ) {
    return [...fullOrder]
  }
  const nextVisible = [...visibleIds]
  const [moved] = nextVisible.splice(fromIndex, 1)
  if (moved === undefined) return [...fullOrder]
  nextVisible.splice(toIndex, 0, moved)
  const queue = [...nextVisible]
  return fullOrder.map((id) =>
    visibleIds.includes(id) ? (queue.shift() ?? id) : id,
  )
}

function pinExcludedLast<T extends { trackingStatus?: TrackingStatus }>(
  rows: readonly T[],
): T[] {
  const included: T[] = []
  const excluded: T[] = []
  for (const row of rows) {
    if (row.trackingStatus === 'excluded') excluded.push(row)
    else included.push(row)
  }
  return [...included, ...excluded]
}

export function sortAssets<
  T extends { id: string; name: string; trackingStatus?: TrackingStatus },
>(
  assets: readonly T[],
  options: {
    sort: AssetListSort
    order: readonly string[]
    locale: string
    amountOf: (asset: T) => number | null
  },
): T[] {
  const rows = [...assets]
  let sorted: T[]
  if (options.sort === 'custom') {
    const rank = new Map(
      ensureAssetOrder(
        options.order,
        rows.map((asset) => asset.id),
      ).map((id, index) => [id, index]),
    )
    sorted = rows.sort(
      (left, right) => (rank.get(left.id) ?? 0) - (rank.get(right.id) ?? 0),
    )
  } else {
    const direction = options.sort.endsWith('_desc') ? -1 : 1
    if (options.sort.startsWith('name_')) {
      sorted = rows.sort(
        (left, right) =>
          direction * left.name.localeCompare(right.name, options.locale),
      )
    } else {
      sorted = rows.sort((left, right) => {
        const leftAmount = options.amountOf(left)
        const rightAmount = options.amountOf(right)
        if (leftAmount === null && rightAmount === null) {
          return left.name.localeCompare(right.name, options.locale)
        }
        if (leftAmount === null) return 1
        if (rightAmount === null) return -1
        if (leftAmount === rightAmount) {
          return left.name.localeCompare(right.name, options.locale)
        }
        return (leftAmount - rightAmount) * direction
      })
    }
  }
  return pinExcludedLast(sorted)
}

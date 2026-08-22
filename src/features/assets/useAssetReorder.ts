import { useState } from 'react'
import { ensureAssetOrder, spliceVisibleOrder } from './assetListOrder'

export function useAssetReorder(persistedOrder: readonly string[]) {
  const [reordering, setReordering] = useState(false)
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null)

  const order = draftOrder ?? persistedOrder

  function enter(visibleIds: readonly string[], allAssetIds: readonly string[]) {
    setDraftOrder(ensureAssetOrder(visibleIds, allAssetIds))
    setReordering(true)
  }

  function drop(
    visibleIds: readonly string[],
    allAssetIds: readonly string[],
    from: number,
    to: number,
  ) {
    setDraftOrder((current) =>
      spliceVisibleOrder(
        current ?? ensureAssetOrder(persistedOrder, allAssetIds),
        visibleIds,
        from,
        to,
      ),
    )
  }

  function cancel() {
    setDraftOrder(null)
    setReordering(false)
  }

  async function save(
    persist: (order: string[]) => Promise<void>,
    allAssetIds: readonly string[],
  ) {
    const next = draftOrder ?? ensureAssetOrder(persistedOrder, allAssetIds)
    await persist(next)
    setDraftOrder(null)
    setReordering(false)
  }

  return {
    reordering,
    order,
    usingDraft: draftOrder !== null,
    enter,
    drop,
    cancel,
    save,
  }
}

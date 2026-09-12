import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { convertAmount, lookupRate } from '@/domain/fx'
import { assetPerformance } from '@/domain/netWorth'
import { latestSnapshot } from '@/domain/snapshot'
import { useLocalChartRange } from '@/features/charts'
import { assetChartPoints } from './assetChartPoints'
import { formatOwnershipShare, ownershipMultiplier } from '@/domain/asset'
import { todayIsoDate } from '@/shared/lib/money'
import { isoDatesInclusive } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { AssetFormValues } from './AssetForm'

export type AssetDetailsDisplayMode = 'native' | 'base'

export function useAssetDetailsScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const saveAsset = useAssetStore((state) => state.saveAsset)
  const saveSnapshots = useAssetStore((state) => state.saveSnapshots)
  const setTrackingStatus = useAssetStore((state) => state.setTrackingStatus)
  const deleteAsset = useAssetStore((state) => state.deleteAsset)
  const deleteSnapshot = useAssetStore((state) => state.deleteSnapshot)
  const updateSnapshot = useAssetStore((state) => state.updateSnapshot)
  const asset = useAssetStore((state) =>
    state.assets.find((row) => row.id === id),
  )
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const displayMode = useSettingsStore(
    (state) => state.settings.currencyDisplayMode,
  )
  const quotes = useFxStore((state) => state.quotes)
  const [mode, setMode] = useState<AssetDetailsDisplayMode>(displayMode)
  const today = todayIsoDate()

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const history = useMemo(() => {
    if (!asset) return []
    return snapshots
      .filter((snapshot) => snapshot.assetId === asset.id)
      .slice()
      .sort((a, b) =>
        a.date === b.date
          ? b.createdAt.localeCompare(a.createdAt)
          : b.date.localeCompare(a.date),
      )
  }, [asset, snapshots])

  const ordered = useMemo(() => [...history].reverse(), [history])
  const snapshot = asset ? latestSnapshot(snapshots, asset.id) : undefined
  const performance = asset
    ? assetPerformance(ordered, quotes, baseCurrency)
    : null
  const displayCurrency = mode === 'native' ? asset?.currency : baseCurrency
  const earliest = ordered[0]?.date ?? today
  const chartRange = useLocalChartRange(earliest, today, 'All')

  const points = asset
    ? assetChartPoints(
        asset.id,
        snapshots,
        isoDatesInclusive(chartRange.start, chartRange.chartEnd),
        mode,
        quotes,
        baseCurrency,
      )
    : []

  const convertedNow =
    snapshot && asset
      ? lookupRate(quotes, snapshot.currency, baseCurrency, snapshot.date)
      : undefined
  const convertedAmount =
    snapshot && convertedNow !== undefined
      ? convertAmount(snapshot.amount, convertedNow)
      : undefined

  const shareLabel = asset
    ? formatOwnershipShare({
        numerator: asset.ownershipShareNumerator ?? 1,
        denominator: asset.ownershipShareDenominator ?? 1,
      })
    : '1/1'
  const hasPartialShare = asset ? ownershipMultiplier(asset) < 1 : false
  const change =
    mode === 'native'
      ? performance
        ? {
            absolute: performance.nativeAbsolute,
            percent: performance.nativePercent,
          }
        : null
      : performance?.baseAbsolute !== undefined &&
          performance.baseAbsolute !== null
        ? {
            absolute: performance.baseAbsolute,
            percent: performance.basePercent,
          }
        : null

  async function saveUpdate(input: {
    date: string
    amount: number
    note?: string
  }) {
    if (!asset) return
    await saveSnapshots([
      {
        assetId: asset.id,
        date: input.date,
        amount: input.amount,
        currency: asset.currency,
        ...(input.note ? { note: input.note } : {}),
      },
    ])
  }

  async function saveDetails({
    asset: next,
    amount,
    snapshotDate,
    note,
  }: AssetFormValues) {
    await saveAsset(
      next,
      amount === undefined
        ? undefined
        : {
            assetId: next.id,
            date: snapshotDate ?? todayIsoDate(),
            amount,
            currency: next.currency,
            ...(note ? { note } : {}),
          },
    )
  }

  return {
    loaded,
    asset,
    snapshots,
    history,
    snapshot,
    quotes,
    mode,
    setMode,
    baseCurrency,
    displayCurrency,
    convertedAmount,
    change,
    shareLabel,
    hasPartialShare,
    today,
    earliest,
    chartRange,
    points,
    saveUpdate,
    saveDetails,
    updateSnapshot,
    deleteSnapshot,
    setTrackingStatus,
    deleteAsset,
    navigate,
  }
}

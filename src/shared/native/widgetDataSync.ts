import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { router } from '@/app/router'
import { contributesToNetWorth } from '@/domain/asset'
import { netWorth } from '@/domain/netWorth'
import { latestSnapshot } from '@/domain/snapshot'
import { getDictionary, type Locale } from '@/i18n'
import { formatAmount, formatCalendarDate } from '@/shared/lib/money'
import { setHomeScreenWidgetProviderEnabled } from '@/shared/native/homeScreenWidget'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

export const WIDGET_DATA_KEY = 'widgetSnapshot'
const OPEN_DASHBOARD_REQUESTED_KEY = 'widgetOpenDashboardRequested'

export type WidgetSnapshot = {
  enabled: boolean
  headline: string | null
  asOfText: string | null
}

export function initWidgetDataSync() {
  if (Capacitor.getPlatform() !== 'android') return

  const sync = () => void syncWidgetSnapshot()
  sync()
  useAssetStore.subscribe(sync)
  useFxStore.subscribe(sync)
  useSettingsStore.subscribe(sync)

  void App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) void consumeOpenDashboardRequest()
  })
}

async function consumeOpenDashboardRequest() {
  const { value } = await Preferences.get({ key: OPEN_DASHBOARD_REQUESTED_KEY })
  if (value !== 'true') return
  await Preferences.remove({ key: OPEN_DASHBOARD_REQUESTED_KEY })
  void router.navigate('/')
}

export function latestContributingAsOf(
  assets: Parameters<typeof netWorth>[0],
  snapshots: Parameters<typeof netWorth>[1],
): string | undefined {
  let max: string | undefined
  for (const asset of assets) {
    if (!contributesToNetWorth(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    if (!max || snapshot.date > max) max = snapshot.date
  }
  return max
}

export function buildWidgetSnapshot(input: {
  enabled: boolean
  total: number
  currency: string
  asOf: string | undefined
  locale: Locale
}): WidgetSnapshot {
  if (!input.enabled) {
    return { enabled: false, headline: null, asOfText: null }
  }
  const t = getDictionary(input.locale)
  return {
    enabled: true,
    headline: formatAmount(input.total, input.currency, input.locale),
    asOfText: input.asOf
      ? `${t.dashboard.asOfDate} ${formatCalendarDate(input.asOf, input.locale)}`
      : null,
  }
}

async function syncWidgetSnapshot() {
  const { settings } = useSettingsStore.getState()
  const enabled = settings.homeScreenWidget
  await setHomeScreenWidgetProviderEnabled(enabled)
  if (!enabled) {
    await Preferences.set({
      key: WIDGET_DATA_KEY,
      value: JSON.stringify(
        buildWidgetSnapshot({
          enabled: false,
          total: 0,
          currency: settings.baseCurrency,
          asOf: undefined,
          locale: settings.locale,
        }),
      ),
    })
    return
  }

  const { assets, snapshots } = useAssetStore.getState()
  const quotes = useFxStore.getState().quotes
  const result = netWorth(assets, snapshots, quotes, settings.baseCurrency)
  const snapshot = buildWidgetSnapshot({
    enabled: true,
    total: result.total,
    currency: settings.baseCurrency,
    asOf: latestContributingAsOf(assets, snapshots),
    locale: settings.locale,
  })
  await Preferences.set({
    key: WIDGET_DATA_KEY,
    value: JSON.stringify(snapshot),
  })
}

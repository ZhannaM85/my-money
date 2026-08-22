import type {
  AssetClass,
  AssetType,
  TrackingStatus,
  UpdateFrequency,
  ValuationMethod,
} from '@/domain/asset'
import type { HistoryRange } from '@/shared/lib/dates'

export interface Dictionary {
  appName: string
  common: {
    loading: string
    save: string
    cancel: string
    add: string
    addAsset: string
    continue: string
    skipForNow: string
    skipToContent: string
    estimated: (amount: string) => string
    native: (currency: string) => string
    owe: string
    aboutField: (name: string) => string
  }
  nav: {
    tabs: string
    dashboard: string
    assets: string
    update: string
    history: string
    more: string
  }
  dashboard: {
    title: string
    description: string
    netWorth: string
    thisMonth: string
    zoomRange: string
    zoomIn: string
    zoomOut: string
    emptyTitle: string
    emptyDescription: string
    fxMissing: (codes: string) => string
    fxConverted: string
    allocation: string
    nativeHoldings: string
    originalChartHint: string
    currencyFilterDisabledHint: string
    conversionUnavailable: string
    holdings: string
  }
  assets: {
    title: string
    filterAll: string
    filterArchived: string
    emptyTitle: string
    emptyArchivedTitle: string
    emptyDescription: string
    noValue: string
  }
  asset: {
    classes: Record<AssetClass, string>
    types: Record<AssetType, string>
    valuation: Record<ValuationMethod, string>
    frequency: Record<UpdateFrequency, string>
    tracking: Record<TrackingStatus, string>
    noValueYet: string
    updatedToday: string
    updatedYesterday: string
    updatedDaysAgo: (days: number) => string
    name: string
    class: string
    type: string
    currency: string
    institutionOptional: string
    valuationLabel: string
    purchaseValueOptional: string
    updateFrequency: string
    trackingLabel: string
    currentAmount: string
    snapshotDate: string
    snapshotDateInvalid: string
    newAmountOptional: string
    newAmountOptionalHint: string
    updateThisAssetHint: string
    nameRequired: string
    enterCurrentAmount: string
    amountMustBeNumber: string
    purchaseMustBeNumber: string
    addTitle: string
    saveAsset: string
    saveDetails: string
    editDetails: string
    notFound: string
    backToAssets: string
    native: string
    currentValue: string
    inBaseCurrency: string
    noSnapshotsYet: string
    sinceFirst: string
    noRateOnDate: (currency: string, date: string) => string
    updateThisAsset: string
    newAmount: string
    amountPlaceholder: string
    details: string
    archive: string
    hide: string
    restore: string
    excludeFromNetWorth: string
    includeInNetWorth: string
    notCountedInNetWorth: string
    hiddenFromLists: string
    deleteAsset: string
    deleteConfirm: string
    deleteSnapshot: string
    deleteSnapshotAria: (date: string) => string
    deleteSnapshotConfirm: string
    editSnapshotAria: (date: string) => string
    editSnapshotAmount: string
    quickAdd: string
    presets: Record<'bank' | 'cash' | 'vehicle' | 'apartment' | 'brokerage', string>
    ownershipShare: string
    ownershipShareInvalid: string
    yourShare: (share: string) => string
    suggestedNow: string
  }
  update: {
    title: string
    description: string
    emptyTitle: string
    emptyDescription: string
    noChange: string
    saveUpdates: string
    enterNumberFor: (name: string) => string
    needOneRow: string
    newAmountAria: (name: string) => string
  }
  history: {
    title: string
    description: string
    emptyTitle: string
    emptyDescription: string
    overRange: (range: HistoryRange) => string
    holdingsOn: (date: string) => string
  }
  allocation: {
    title: string
    description: string
    byClass: string
    byCurrency: string
    byType: string
    emptyTitle: string
    emptyDescription: string
  }
  onboarding: {
    welcomeTitle: string
    welcomeDescription: string
    firstAssetTitle: string
    firstAssetDescription: string
    assetSavedTitle: string
    assetSavedDescription: string
    addAnother: string
    seeNetWorth: string
  }
  settings: {
    title: string
    description: string
    baseCurrency: string
    showAllCurrencies: string
    currencyDisplay: string
    currencyDisplayBase: string
    currencyDisplayNative: string
    showAllCurrenciesHint: string
    language: string
    languageEn: string
    languageRu: string
    skipWelcomeHint: string
    skipWelcome: string
    allocation: string
    appearance: string
    moodLedger: string
    moodGreen: string
    moodSoft: string
    moodNeutral: string
    moodPastel: string
    versionBadgeLabel: (version: number) => string
    releaseNotesLabel: string
    manualRatesTitle: string
    manualRatesDescription: string
    manualRatesEdit: string
    manualRatesHide: string
    manualRatesHint: (date: string) => string
    manualRatesPair: (base: string, quote: string) => string
    manualRatesSave: string
    manualRatesClear: string
    manualRatesSaved: string
    manualRatesActive: (count: number, date: string) => string
    fxDebugTitle: string
    fxDebugDescription: string
    fxDebugEnable: string
    fxDebugDisable: string
    fxDebugCopy: string
    fxDebugClear: string
    fxDebugCopied: string
    fxDebugCopyFailed: string
    fxDebugEmpty: string
  }
  backup: {
    title: string
    description: string
    exportJson: string
    importJson: string
    importAria: string
    onlyEmpty: string
    downloaded: string
    restored: string
    exportFailed: string
    importFailed: string
    bookNotEmpty: string
    invalidFile: string
  }
  csv: {
    title: string
    description: string
    exportCsv: string
    importCsv: string
    importAria: string
    mapColumns: string
    selectColumn: string
    columnN: (n: number) => string
    fields: {
      date: string
      asset: string
      amount: string
      currency: string
    }
    ready: (ready: number, issues: number) => string
    importMapped: string
    exported: string
    exportFailed: string
    importFailed: string
    invalidFile: string
    imported: (imported: number, skipped: number) => string
    andMore: (n: number) => string
    issue: {
      missingField: (row: number, who: string) => string
      invalidDate: (row: number, who: string) => string
      invalidAmount: (row: number, who: string) => string
      unmatchedAsset: (row: number, who: string) => string
      ambiguousAsset: (row: number, who: string) => string
    }
  }
  fx: {
    usingCachedRates: string
  }
  appUpdate: {
    availableText: string
    reloadButton: string
    reloadingText: string
  }
  offline: {
    offlineText: string
  }
}

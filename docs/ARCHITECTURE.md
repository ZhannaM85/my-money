# My Money — Architecture

This document is updated after each issue is completed. It explains what every file does, why it exists, and how the pieces connect.

Product context lives in `PROJECT_BRIEF.md`; the visual language lives in `docs/DESIGN_SYSTEM.md`; the active work queue lives in `docs/issues-priority.md` (closed history: `docs/issues-priority-archive/`); the public-facing overview lives in `README.md`.

**Status (2026-08-30):** Epics 0–17 plus GitHub Pages landed. Deployed at `https://zhannam85.github.io/my-money/`. Native wrap is #162 (Capacitor Android + iOS); store listing is later children of #19.

---

## System Overview

My Money is a local-first personal balance sheet: the user manually records assets and liabilities, the app converts them into one base currency, and history is a first-class feature. Everything for the web/PWA/Android client runs in the browser — no backend, no accounts, no telemetry, no AI. User data lives in IndexedDB. The only expected network call in the MVP is a public FX API (Frankfurter / ECB reference rates).

iOS is the **same Capacitor wrap** as Android (`ios/` next to `android/`), not a Swift rewrite. #20 (native Swift/SwiftUI) is won't-fix.

The web codebase follows Clean Architecture layering with feature-based folders, matching sibling projects (`turtle-steps-to-the-goal`, `life-kaleidoscope`):

```mermaid
flowchart TD
    subgraph UI ["features/ + app/  (React)"]
        A["Screens: Dashboard, Assets,<br/>Update, Allocation, History,<br/>Asset details, Onboarding, Settings"]
    end
    subgraph I18n ["i18n/  (Dictionary + en/ru)"]
        Z["useTranslation / useLocale"]
    end
    subgraph State ["stores/  (Zustand, UI/session only)"]
        B["filters, drafts, selected asset,<br/>base-currency display preference"]
    end
    subgraph Domain ["domain/  (pure TS — no React/Zustand/Dexie)"]
        C["Entities<br/>Asset, AssetSnapshot, Settings"]
        D["Pure calc<br/>netWorth, allocation, change, FX apply"]
        E["Repository INTERFACES<br/>AssetRepository, SnapshotRepository,<br/>SettingsRepository, FxRateRepository"]
    end
    subgraph Infra ["infrastructure/"]
        F["persistence/indexeddb/<br/>Dexie schema + IndexedDb*Repository"]
        G["fx/frankfurter/<br/>FrankfurterFxClient"]
    end

    A --> B
    A --> Z
    B --> E
    A --> D
    G -. implements .-> E
    F -. implements .-> E
    F --> H[("IndexedDB<br/>in the browser")]
    G --> I[("Frankfurter API<br/>rates only, no user data")]

    style Domain fill:#eff6ff,stroke:#3b82f6
    style Infra fill:#fef3c7,stroke:#d97706
    style UI fill:#f0fdf4,stroke:#22c55e
    style I18n fill:#fdf4ff,stroke:#a855f7
```

**The one dependency rule that matters:** `domain/` imports nothing from React, Zustand, Dexie, or `fetch`. Features and stores talk to persistence and FX only through repository interfaces, so a future sync backend or a second FX provider means new implementations, not a rewrite of stores or screens.

**Liabilities are assets with a class.** The brief's "Assets vs Liabilities" split is a product concept, not two persistence trees. One `Asset` entity covers bank accounts, investments, cash, property, valuables, *and* loans. `assetClass: 'liabilities'` makes the amount subtract from net worth. Snapshots, FX, tracking status, archive, and export stay on one path. The UI still labels them as liabilities.

**Net worth is calculated, never stored** as a primary row. Historical net worth is recomputed from snapshots + the FX rate for each snapshot's date.

---

## Data Flow — updating balances, then reading net worth

```mermaid
sequenceDiagram
    participant UF as UpdateFinancesScreen
    participant AS as assetStore (Zustand session)
    participant SR as SnapshotRepository
    participant AR as AssetRepository
    participant DB as Dexie (IndexedDB)
    participant NW as domain/netWorth
    participant FX as FxRateRepository
    participant DS as DashboardScreen

    UF->>AS: draft amounts (or "no change")
    UF->>SR: append snapshots for changed assets
    SR->>DB: assetSnapshots.add
    Note over SR,DB: Unchanged assets get a same-amount snapshot<br/>when the user taps No change and saves

    DS->>AR: list included assets
    DS->>SR: latest snapshot per asset
    DS->>FX: rates for base currency (date = today or snapshot date)
    DS->>NW: netWorth(assets, snapshots, rates, baseCurrency)
    NW-->>DS: total, by class, period delta
```

Display unit / base currency is a **settings** concern. Stored snapshot amounts stay in the asset's own currency. Conversion happens at read time in `domain/netWorth` / `domain/fx`. Settings can also choose **Show all currencies**, which keeps native amounts (same as Original display mode) instead of converting into one total.

---

## Domain model

```ts
type AssetClass =
  | 'money'
  | 'investments'
  | 'property'
  | 'valuables'
  | 'liabilities';

type TrackingStatus = 'included' | 'excluded' | 'archived';

type ValuationMethod =
  | 'account_balance'
  | 'my_estimate'
  | 'appraisal'
  | 'market_price'
  | 'purchase_price';

type UpdateFrequency = 'weekly' | 'monthly' | 'yearly' | 'manual';

interface Settings {
  id: 'singleton';
  baseCurrency: string; // ISO 4217, e.g. 'EUR'
  locale: 'en' | 'ru';
  onboardingCompleted: boolean;
  updatedAt: string;
}

interface Asset {
  id: string;
  name: string;
  assetClass: AssetClass;
  type: string; // bank, cash, brokerage, apartment, mortgage, ...
  currency: string; // ISO 4217 — the asset's native currency
  institution?: string;
  trackingStatus: TrackingStatus;
  valuationMethod: ValuationMethod;
  purchaseValue?: number;
  updateFrequency: UpdateFrequency;
  createdAt: string;
  updatedAt: string;
}

interface AssetSnapshot {
  id: string;
  assetId: string;
  date: string; // ISO calendar date
  amount: number; // in the asset's native currency
  currency: string; // denormalized copy of asset.currency at write time
  createdAt: string;
}

interface FxRateQuote {
  date: string;
  base: string;
  quote: string;
  rate: number;
}
```

Repository interfaces (domain layer):

- `AssetRepository` — `getAll()`, `getById(id)`, `upsert(asset)`, `delete(id)` (delete is rare; archive is the default)
- `SnapshotRepository` — `getByAsset(assetId)`, `getLatestByAsset(assetId)`, `getOnOrBefore(assetId, date)`, `append(snapshot)`
- `SettingsRepository` — `get()`, `save(settings)`
- `FxRateRepository` — `getRate(from, to, date)`, `getLatest(from, to)`, `put(quotes)` (cache)

Pure, unit-tested domain functions (no storage, no React, no network):

- `convertAmount(amount, from, to, rate)`
- `netWorth(assets, snapshots, rates, baseCurrency)` — included assets minus included liabilities
- `allocation(netWorthBreakdown)` — by class, by currency, by type
- `periodChange(history, from, to)` — absolute + percent
- `assetPerformance(snapshots, rates, baseCurrency)` — native vs base, optional FX vs value split
- `historicalNetWorth(assets, snapshots, rates, dates)` — uses **that date's** FX, not today's; if that day has no quote, carries forward the last earlier rate so the holding is not dropped. Each point includes the holding-by-holding breakdown for tooltips and History.

---

## Folder structure (feature-based, Clean Architecture)

```
src/
  app/                     # routing, app shell, providers
  domain/
    asset/
    snapshot/
    settings/
    backup/                # versioned BackupBundle — no I/O
    fx/                    # convertAmount, rate lookup types — no fetch
    netWorth/              # netWorth, allocation, periodChange, history
  infrastructure/
    persistence/
      indexeddb/           # Dexie schema + repository IMPLEMENTATIONS
    fx/
      frankfurter/         # HTTP client + cache writes through FxRateRepository
  features/
    onboarding/
    dashboard/
    assets/
    update-finances/
    allocation/
    history/
    asset-details/
    settings/
    export/
  shared/
    ui/                    # design-system primitives
    hooks/
    lib/
  stores/                  # Zustand, UI/session only
  i18n/
test/
```

Nothing outside `infrastructure/persistence/indexeddb/` imports Dexie. Nothing outside `infrastructure/fx/` calls the network for rates.

GitHub Pages is a project site at `/my-money/`. Production builds pass `--base=/my-money/` so Vite rewrites `index.html` asset URLs and React Router uses that `basename`. SPA deep links copy `index.html` to `404.html`.

The web app is installable as a PWA (`public/manifest.json`, Workbox service worker). Registration is skipped inside Capacitor so a later Android wrap is not double-caching the shell. IndexedDB remains the data store offline; FX fetch failures keep last cached quotes and surface a note instead of blocking the UI.

Copy goes through `src/i18n/` (English + Russian). Locale is `settings.locale` in IndexedDB so the backup field name stays `locale`. First visit follows `navigator.language`; More has an explicit switcher. Amounts use `en-US` / `ru-RU` number formatting.

---

## Routing (web)

| Path | Screen |
|---|---|
| `/` | Dashboard — net worth, period change, chart, class totals |
| `/assets` | Asset list + filters (All / Money / Investments / Property / Valuables / Liabilities) |
| `/assets/new` | Create asset |
| `/assets/:id` | Asset details |
| `/update` | Quick update flow |
| `/allocation` | Donut + legend (by class / currency / type) |
| `/history` | Net-worth history + range chips |
| `/settings` | Base currency, locale, appearance, export/import |
| `/onboarding` | First-run: base currency + first assets |

An empty book that has not skipped welcome is redirected to `/onboarding`. `/settings` stays reachable so Skip is available there too. Once any asset exists, or `settings.onboardingCompleted` is true, the gate does not run again. Dashboard already shows calculated net worth (identity FX for same-currency books); period change and the chart wait for later epics.

Bottom nav from the starting mock: Dashboard, Assets, center **+** (update), History, More (Settings / Allocation / export). Allocation stays its own route (`/allocation`), linked from More and Dashboard — not a sixth tab.

---

## State management

Zustand owns UI/session state only (update-flow drafts, list filters, selected range). It never owns persisted domain data as the source of truth — stores read/write through repository interfaces.

**No change** on the quick-update screen writes a same-amount snapshot for today. That keeps historical net worth and “last updated” on one path. There is no separate `lastConfirmedAt` field.

Base currency is stored in `Settings`. Changing it re-reads FX and re-renders; it does not rewrite historical snapshot amounts.

---

## FX

- Provider: [Frankfurter](https://api.frankfurter.dev/) v2 (multi-provider reference rates, no API key). Client: `infrastructure/fx/frankfurter/`.
- Cache quotes in IndexedDB via `FxRateRepository` so charts work offline after a fetch.
- Converted values are estimates / reference rates, labeled as such — not executable quotes.
- Same-currency pairs are rate `1` with no network.
- Historical net worth **must** use the rate for that history date (weekend/holiday/missing-dataset dates reuse the previous quote via `lookupRateOnOrBefore`). A missing same-day quote must not drop the holding.
- Only currency codes and dates are sent. User balances, names, and assets never leave the device.
- `RUB` is supported through Frankfurter v2 as well, so the web app stays on one browser-safe FX provider instead of a separate RUB-only path.

---

## Platforms

| Surface | Stack | Persistence |
|---|---|---|
| Web / PWA | This React app | IndexedDB (Dexie) |
| Android | Capacitor wrapping this app | Same IndexedDB (WebView) |
| iOS | Capacitor wrapping this app | Same IndexedDB (WebView) |

Do not architect `domain/` against Capacitor. Shared meaning (entities, calculations, export JSON) still matters. Native builds use Vite’s default `/` base (`npm run cap:sync`); GitHub Pages keeps `--base=/my-money/`. iOS Xcode/TestFlight still need a Mac (`docs/native-app-device-testing.md`).

Capacitor follow-ups (icons, chrome, back button, backup share, stores) are children of #19.

---

## Design system

Calm, numbers-first, light theme with a green accent in the starting mock. Tailwind + shadcn/ui. Shared primitives before feature screens: `Button`, `Card`, `NumberInput`, `TextField`, `StatCard`, `EmptyState`, `PageHeader`, `BottomNav`.

No gamification. Estimated valuations must look distinct from account balances. Liability amounts display as negative in summaries.

Accessibility as we build: semantic HTML, visible focus, ARIA on icon-only controls, WCAG AA contrast, keyboard nav. Sweep (#18): skip-to-content, `aria-pressed` on chips, allocation colors darkened for contrast, main column `min-w-0` so tables/chips scroll on small screens.

---

## Scaffold (Epic 0 / #1)

| File | Purpose |
|------|---------|
| `package.json` | React 19, Vite 8, Tailwind 4, Vitest, ESLint, Prettier, shadcn CLI |
| `vite.config.ts` | React + Tailwind + `vite-plugin-pwa` (web only; skipped in Vitest). `@` → `src/`. |
| `components.json` | shadcn aliases into `src/shared/{ui,lib,hooks}` |
| `src/app/AppShell.tsx` | Bottom tab shell + routed placeholders (#3) |
| `src/shared/lib/utils.ts` | `cn()` for shadcn |
| `src/**/index.ts` placeholders | Feature/domain barrels from the folder map above; filled by later epics |
| `test/setup.ts` | jest-dom + RTL cleanup |
| `public/favicon-*-64.png` (#22) | Tab icons, turtle-steps pattern: 64px circular mark with padding. Generated from `public/icon-*-192.png`. |
| `public/manifest.json` (#16) | PWA install manifest. Relative `start_url` / `scope` for the GitHub Pages subpath. |
| `src/shared/lib/registerServiceWorker.ts` (#16) | Registers `sw.js` on web; skipped when Capacitor reports native (#162). |
| `capacitor.config.ts` (#162) | `appId: io.github.zhannam85.mymoney`, `webDir: dist`. `android/` + `ios/` are git-tracked native projects. |
| `src/shared/native/nativeChrome.ts` (#166) | Capacitor `SystemBars` style from light/dark. No-op on web. |
| `src/shared/native/backButtonHandler.ts` (#165) | Android `App.backButton`: dialog → history → Dashboard → exit. No-op on web/iOS. |
| `src/shared/lib/shareOrDownloadFile.ts` (#169) | Web Share File, else Capacitor Share/Filesystem, else `<a download>`. |
| `src/i18n/` (#17) | Typed `Dictionary`, `en` + `ru`. `useTranslation` reads `settings.locale`. Backup JSON keeps English field names. |

---

## Module Reference (planned)

Until later feature epics land, UI module tables below are still the intended map. Domain and IndexedDB files exist as of #2.

### Domain

| Area | Purpose |
|------|---------|
| `domain/asset/` | `Asset` entity, `AssetClass` / tracking / valuation types, `AssetRepository` |
| `domain/snapshot/` | `AssetSnapshot`, append-only history helpers, `SnapshotRepository` |
| `domain/settings/` | Singleton settings (base currency, locale) |
| `domain/fx/` | Pure conversion + quote types; no HTTP |
| `domain/netWorth/` | Totals, allocation, period change, historical series |

### Infrastructure

| Area | Purpose |
|------|---------|
| `infrastructure/persistence/indexeddb/` | Dexie schema, migrations, `IndexedDb*Repository` |
| `infrastructure/fx/frankfurter/` | Fetch current + historical rates, write through `FxRateRepository` |

### Features

| Area | Purpose |
|------|---------|
| `features/onboarding/` | Flow 1 — first assets + base currency + first net worth |
| `features/dashboard/` | Flow 2 — net worth, allocation strip, chart, recent change |
| `features/update-finances/` | Flow 3 — bulk update, no-change, suggested-by-frequency |
| `features/asset-details/` | Flow 4 — one asset, history, native/base toggle |
| `features/assets/` | List, filters, create/edit |
| `features/allocation/` | Donut + legend |
| `features/history/` | Net-worth snapshots over ranges |
| `features/settings/` | Base currency, locale, tracking, export/import, `/privacy` (#164) |
| `features/export/` | JSON (backup) then CSV |

---

## Out of scope (do not “just add”)

Bank / Open Banking / brokerage / crypto live sync, transactions, budgeting, advice, AI, tax, social, automatic property/jewelry valuation, trading, required cloud accounts.

If a future sync backend is ever added, it should be a new repository implementation behind the existing interfaces — not a second data model.

---

## Export JSON (contract to keep stable)

The web, Android, and iOS clients must round-trip the same backup:

```ts
interface BackupBundle {
  version: 1;
  exportedAt: string;
  settings: Settings;
  assets: Asset[];
  snapshots: AssetSnapshot[];
}
```

CSV is a tabular view of snapshots (date, asset id/name, amount, currency, class, type), not a second source of truth. JSON is the backup format. Import maps those four fields, appends snapshots to assets that already exist, and lists unmatched or invalid rows instead of dropping them.

Restore is empty-book only: if any asset already exists, import is refused rather than merged. Settings, assets, and snapshots are the contract; FX cache is not part of the backup.

---

## What is not decided yet

These are real forks — pause and ask rather than picking silently when the issue is implemented:

- iOS storage engine (Core Data vs. SQLite vs. JSON file) — obsolete; iOS is Capacitor/IndexedDB like Android (#162).
- Encrypted-at-rest local storage — not required to validate the prototype; revisit before store release.

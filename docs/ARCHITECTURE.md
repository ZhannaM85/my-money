# My Money — Architecture

This document is updated after each issue is completed. It explains what every file does, why it exists, and how the pieces connect.

Product context lives in `PROJECT_BRIEF.md`; the active work queue lives in `docs/issues-priority.md` (closed history: `docs/issues-priority-archive/`); the public-facing overview lives in `README.md`.

**Status (2026-08-17):** Epics 0–4 (#1–#5) landed. Assets can be created, edited, filtered, and archived. Onboarding is next.

---

## System Overview

My Money is a local-first personal balance sheet: the user manually records assets and liabilities, the app converts them into one base currency, and history is a first-class feature. Everything for the web/PWA/Android client runs in the browser — no backend, no accounts, no telemetry, no AI. User data lives in IndexedDB. The only expected network call in the MVP is a public FX API (Frankfurter / ECB reference rates).

iOS is a **separate native Swift/SwiftUI app** that must share the same product model, calculations, terminology, and JSON/CSV import/export format — not a Capacitor wrapper of this UI.

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
    Note over SR,DB: Unchanged assets get a confirmed snapshot<br/>only when the user explicitly saves / marks no-change<br/>(exact rule lands with the Quick Update epic)

    DS->>AR: list included assets
    DS->>SR: latest snapshot per asset
    DS->>FX: rates for base currency (date = today or snapshot date)
    DS->>NW: netWorth(assets, snapshots, rates, baseCurrency)
    NW-->>DS: total, by class, period delta
```

Display unit / base currency is a **settings** concern. Stored snapshot amounts stay in the asset's own currency. Conversion happens at read time in `domain/netWorth` / `domain/fx`.

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
- `historicalNetWorth(assets, snapshots, rates, dates)` — uses **that date's** FX, not today's

---

## Folder structure (feature-based, Clean Architecture)

```
src/
  app/                     # routing, app shell, providers
  domain/
    asset/
    snapshot/
    settings/
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

Bottom nav from the starting mock: Dashboard, Assets, center **+** (update), History, More (Settings / Allocation / export). Mocks may change.

---

## State management

Zustand owns UI/session state only (update-flow drafts, list filters, selected range). It never owns persisted domain data as the source of truth — stores read/write through repository interfaces.

Base currency is stored in `Settings`. Changing it re-reads FX and re-renders; it does not rewrite historical snapshot amounts.

---

## FX

- Provider: [Frankfurter](https://www.frankfurter.app/) (ECB reference rates, no API key).
- Cache quotes in IndexedDB so historical charts work offline after a fetch.
- Converted values are estimates, labeled as such.
- Same-currency pairs are rate `1` with no network.
- Historical net worth **must** use the rate for the snapshot date.

If Frankfurter is missing a currency the user needs, document the gap in the FX epic rather than inventing a second provider ad hoc.

---

## Platforms

| Surface | Stack | Persistence |
|---|---|---|
| Web / PWA | This React app | IndexedDB (Dexie) |
| Android | Capacitor wrapping this app | Same IndexedDB (WebView) |
| iOS | Native Swift / SwiftUI | Native local store; import/export JSON must round-trip with the web schema |

Do not architect the web `domain/` against Capacitor or UIKit. Shared *meaning* (entities, calculations, export JSON) matters more than shared UI.

Capacitor and iOS come after the web prototype's four flows feel good (`PROJECT_BRIEF.md` §25).

---

## Design system

Calm, numbers-first, light theme with a green accent in the starting mock. Tailwind + shadcn/ui. Shared primitives before feature screens: `Button`, `Card`, `NumberInput`, `TextField`, `StatCard`, `EmptyState`, `PageHeader`, `BottomNav`.

No gamification. Estimated valuations must look distinct from account balances. Liability amounts display as negative in summaries.

Accessibility as we build: semantic HTML, visible focus, ARIA on icon-only controls, WCAG AA contrast, keyboard nav.

---

## Scaffold (Epic 0 / #1)

| File | Purpose |
|------|---------|
| `package.json` | React 19, Vite 8, Tailwind 4, Vitest, ESLint, Prettier, shadcn CLI |
| `vite.config.ts` | React + Tailwind plugins, `@` → `src/`, jsdom tests |
| `components.json` | shadcn aliases into `src/shared/{ui,lib,hooks}` |
| `src/app/AppShell.tsx` | Bottom tab shell + routed placeholders (#3) |
| `src/shared/lib/utils.ts` | `cn()` for shadcn |
| `src/**/index.ts` placeholders | Feature/domain barrels from the folder map above; filled by later epics |
| `test/setup.ts` | jest-dom + RTL cleanup |
| `public/favicon-*-32.png` (#21) | Light/dark tab icons via `prefers-color-scheme`; generated from `docs/branding/` |

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
| `features/settings/` | Base currency, locale, tracking, export/import |
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

CSV is a tabular view of snapshots (date, asset name/id, amount, currency), not a second source of truth. JSON is the backup format.

---

## What is not decided yet

These are real forks — pause and ask rather than picking silently when the issue is implemented:

- Exact “no change” snapshot rule (write a same-amount snapshot vs. only bump `lastConfirmedAt`).
- Whether Allocation is its own tab or lives under Dashboard / More.
- iOS storage engine (Core Data vs. SQLite vs. JSON file) — irrelevant until the native epic.
- Encrypted-at-rest local storage — not required to validate the prototype; revisit before store release.

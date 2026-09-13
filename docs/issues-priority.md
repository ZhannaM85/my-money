# Issues Priority List

Active work queue only (open, pending validation, not started, partial). Closed history lives in [`docs/issues-priority-archive/`](./issues-priority-archive/README.md).

Work top-to-bottom within each tier; dependencies are noted where order matters. When an issue is confirmed done, move its row to the archive.

The **initial backlog (Tiers 1–7)** is the planned implementation sequence from `PROJECT_BRIEF.md`, filed at project start — same shape as turtle-steps' original Phase 1/2 epics, not a same-day live-feedback split. Later live-feedback filings on a given calendar day append to that day's tier (see `docs/AGENT_WORKFLOW.md`).

Prototype checkpoint after Tier 5: the four flows in `PROJECT_BRIEF.md` §25 (onboarding, dashboard, update, asset details) should feel good before native platforms.

---

## Tier 7 — Native platforms

_After the four web flows feel good. Android and iOS both wrap this app. One tracking epic plus 12 children (turtle-steps native-release shape, minus camera, plus backup/CSV). Row order is the intended sequence, not issue-number order. Apple Developer Program enrolled 2026-08-30; TestFlight still needs a Mac._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#19](https://github.com/ZhannaM85/my-money/issues/19) | 🔲 Open | Epic 18 — Android and iOS via Capacitor | Tracking only. Children below. |
| [#167](https://github.com/ZhannaM85/my-money/issues/167) | 🔲 Open | iOS: App Store Connect app record + signing (Developer Program enrolled) | Account step. Enrollment is done; Connect record is not. |
| [#168](https://github.com/ZhannaM85/my-money/issues/168) | 🔲 Open | iOS: code signing + first TestFlight beta build | Depends on #162 + #167. Requires a Mac. |
| [#170](https://github.com/ZhannaM85/my-money/issues/170) | 🔲 Open | iOS: App Store listing content and submit for review | Depends on #163, #164, #168. |
| [#171](https://github.com/ZhannaM85/my-money/issues/171) | 🔲 Open | Android: Google Play Console enrollment + app signing setup | Account step. $25 one-time. |
| [#173](https://github.com/ZhannaM85/my-money/issues/173) | 🔲 Open | Android: Play Store listing content + internal/closed testing track | Depends on #162, #163, #164, #171. |
| [#172](https://github.com/ZhannaM85/my-money/issues/172) | 🔲 Open | Android: promote to production + submit for Play Store review | Depends on #173. |

---

## Tier 19 — Live feedback (2026-09-02)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 20 — Live feedback (2026-09-03)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 21 — Live feedback (2026-09-04)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 22 — Live feedback (2026-09-09)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 23 — CI (2026-09-10)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 24 — Live feedback (2026-09-11)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 25 — Live feedback (2026-09-12)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#233](https://github.com/ZhannaM85/my-money/issues/233) | 🔍 Pending validation | Split DashboardScreen into ≤500-line modules | Extracted `useDashboardScreen` / `useDashboardNetWorth`, As of bar, headline, period change, rates, and positions. Matching test slices moved. No behavior change. |
| [#234](https://github.com/ZhannaM85/my-money/issues/234) | 🔍 Pending validation | Split AssetDetailsScreen into ≤500-line modules | Extracted `useAssetDetailsScreen`, update form, Сведения accordion, and snapshot list. Matching test slices moved. No behavior change. |
| [#236](https://github.com/ZhannaM85/my-money/issues/236) | 🔍 Pending validation | Finish #232: MoneyInput + shared SortableRow on Update/detail | Update + asset-detail amounts use MoneyInput (locale blur, unit, a11y). Assets and Update share SortableRow. |
| [#237](https://github.com/ZhannaM85/my-money/issues/237) | 🔍 Pending validation | Hydrate book once: SnapshotRepository.getAll + AppShell load | `getAll()` replaces per-asset snapshot reads. AppShell hydrates once + visibility resume. Screens read the store. Generation guard kept. |
| [#235](https://github.com/ZhannaM85/my-money/issues/235) | 🔍 Pending validation | Reorganize Ещё into Preferences / Data / About / Developer | Groups More. Developer collapsed; `#fx-debug` / `#root-causes` open it. Widget only on Capacitor Android. Store listing stays parked. |
| [#238](https://github.com/ZhannaM85/my-money/issues/238) | 🔍 Pending validation | Update: remove leftover grey helper blurb (#230 follow-up) | Dropped `t.update.description` grey-under-title filler. Empty-state copy kept. No InfoHint. |
| [#239](https://github.com/ZhannaM85/my-money/issues/239) | 🔍 Pending validation | Shared ChartRangeControls; share range Dashboard↔History | One chrome (chips / custom / zoom / pan). Dashboard and History share persisted range; asset-detail range stays local. |
| [#242](https://github.com/ZhannaM85/my-money/issues/242) | 🔍 Pending validation | Layering: no Dexie in features; FX helper; dead folders | Backup UI uses `backupActions`. `shouldFetchFrankfurter` left dashboard. Empty `features/asset-details` removed. Folder map refreshed. |
| [#241](https://github.com/ZhannaM85/my-money/issues/241) | 🔍 Pending validation | FX: document real pipeline; remove unused runtime CBR/NBG | `docs/FX.md` is canonical. Deleted unused `fx/cbr` + `fx/nbg` HTTP clients. Generate scripts kept. No third live fetch. |
| [#248](https://github.com/ZhannaM85/my-money/issues/248) | 🔍 Pending validation | ESLint max-lines warn (≤500) for features/app | Warn on `src/features/**` + `src/app/**`. Tests and `src/data/**` ignored. Remaining offender `UpdateFinancesScreen` warns only. |
| [#249](https://github.com/ZhannaM85/my-money/issues/249) | 🔍 Pending validation | ESLint import-boundary zones for domain/features | `domain/` ↛ React/Zustand/Dexie. Production features ↛ `infrastructure/persistence`. Backup/CSV I/O via `stores/backupBook`. |
| [#251](https://github.com/ZhannaM85/my-money/issues/251) | 🔍 Pending validation | Shared test render helper + split god screen tests | `test/renderApp.tsx` resets IndexedDB + store defaults. Dashboard / Comparison suites use it; assertions unchanged. |
| [#240](https://github.com/ZhannaM85/my-money/issues/240) | 🔍 Pending validation | Split netWorth module + pre-index snapshots for series | Split totals / holdings / history / allocation / period change. Historical series indexes snapshots by assetId. No formula change. |
| [#243](https://github.com/ZhannaM85/my-money/issues/243) | 🔍 Pending validation | Asset detail: fold tracking/destructive actions into Сведения | Exclude / hide / delete live in expanded Details. Native/base chips persist `currencyDisplayMode`. |
| [#245](https://github.com/ZhannaM85/my-money/issues/245) | 🔍 Pending validation | Clarify dual currency controls (Dashboard filter vs More) | Converted Dashboard filter stays visible + disabled; InfoHint points to More. Show all / Original / Converted unchanged. No new mode. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

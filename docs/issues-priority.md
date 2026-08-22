# Issues Priority List

Active work queue only (open, pending validation, not started, partial). Closed history lives in [`docs/issues-priority-archive/`](./issues-priority-archive/README.md).

Work top-to-bottom within each tier; dependencies are noted where order matters. When an issue is confirmed done, move its row to the archive.

The **initial backlog (Tiers 1–7)** is the planned implementation sequence from `PROJECT_BRIEF.md`, filed at project start — same shape as turtle-steps' original Phase 1/2 epics, not a same-day live-feedback split. Later live-feedback filings on a given calendar day append to that day's tier (see `docs/AGENT_WORKFLOW.md`).

Prototype checkpoint after Tier 5: the four flows in `PROJECT_BRIEF.md` §25 (onboarding, dashboard, update, asset details) should feel good before native platforms.

---

## Tier 1 — Architecture foundation (Phase 1)

_Scaffolding, domain model, and persistence. Everything downstream depends on this._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#1](https://github.com/ZhannaM85/my-money/issues/1) | 🔍 Pending validation | Epic 0 — Project scaffolding & tooling | Vite + React 19 + TS strict + Tailwind/shadcn + Vitest. Empty shell only. `npm test` / `lint` / `build` clean. |
| [#2](https://github.com/ZhannaM85/my-money/issues/2) | 🔍 Pending validation | Epic 1 — Domain model & persistence layer | Dexie `my-money` DB. Pure `netWorth` / historical FX. 16 tests. |

---

## Tier 2 — Design system & app shell

_Shared primitives and routing skeleton before any real feature screen._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#3](https://github.com/ZhannaM85/my-money/issues/3) | 🔍 Pending validation | Epic 2 — Design system & app shell | Primitives + bottom nav + empty route screens. |

---

## Tier 3 — First vertical slice

_Base currency → create assets → first net worth. This is prototype Flow 1. Single-currency is enough; FX can still be identity rates._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#4](https://github.com/ZhannaM85/my-money/issues/4) | 🔍 Pending validation | Epic 3 — Settings: base currency and preferences | IndexedDB settings + Zustand. Changing currency does not rewrite snapshots. |
| [#5](https://github.com/ZhannaM85/my-money/issues/5) | 🔍 Pending validation | Epic 4 — Assets: create, edit, archive, tracking | List + filters + form. Archive keeps snapshots. |
| [#6](https://github.com/ZhannaM85/my-money/issues/6) | 🔍 Pending validation | Epic 5 — Onboarding: first assets to first net worth | Currency → first asset → Dashboard net worth. Skip via welcome or Settings. Does not reappear once a book exists. |

---

## Tier 4 — Data safety & deployment (pulled forward)

_Once real balances exist (Tier 3), IndexedDB is the only copy — backup and a real deployed build should not wait until the end of the queue. Same pull-forward as turtle-steps Epic 8/9._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#13](https://github.com/ZhannaM85/my-money/issues/13) | 🔍 Pending validation | Epic 12 — JSON export and import | Version 1 bundle. Restore into an empty book only. Entry point on Settings. |
| [#14](https://github.com/ZhannaM85/my-money/issues/14) | 🔍 Pending validation | Epic 13 — GitHub Pages deployment | CI on push/PR. Deploy workflow on `main`. Live: https://zhannam85.github.io/my-money/ |

---

## Tier 5 — Core product (prototype flows 2–4)

_FX, then the remaining three prototype flows, plus allocation and history. Order matters: FX before converted totals and historical series._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#7](https://github.com/ZhannaM85/my-money/issues/7) | 🔍 Pending validation | Epic 6 — FX rates via Frankfurter | Cached historical quotes. RUB is not in the ECB set. Converted figures labeled as estimates. |
| [#8](https://github.com/ZhannaM85/my-money/issues/8) | 🔍 Pending validation | Epic 7 — Dashboard | Net worth, this-month change, line chart, class totals. |
| [#9](https://github.com/ZhannaM85/my-money/issues/9) | 🔍 Pending validation | Epic 8 — Quick update flow | Native amounts. No change writes a same-amount snapshot. Yearly/manual shown, not nagged. |
| [#10](https://github.com/ZhannaM85/my-money/issues/10) | 🔍 Pending validation | Epic 9 — Asset details | Native/base toggle, history chart + list, in-place amount update. FX-vs-value split left for later. |
| [#11](https://github.com/ZhannaM85/my-money/issues/11) | 🔍 Pending validation | Epic 10 — Allocation screen | Own route `/allocation` from More + Dashboard. Not a 6th tab. Donut uses abs size; legend shows signed amounts. |
| [#12](https://github.com/ZhannaM85/my-money/issues/12) | 🔍 Pending validation | Epic 11 — History: net worth over time | Range chips 1M–All. Historical FX per date. Asset/liability filters left as follow-up. |

---

## Tier 6 — Completeness

_CSV, PWA, i18n, accessibility. Any order after Tier 5, except CSV should not precede JSON (#13)._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#15](https://github.com/ZhannaM85/my-money/issues/15) | 🔍 Pending validation | Epic 14 — CSV export and import | Mapping flow on More. Appends snapshots; unmatched rows listed. JSON remains the backup. |
| [#16](https://github.com/ZhannaM85/my-money/issues/16) | 🔍 Pending validation | Epic 15 — PWA installability | Manifest + SW (skipped in Capacitor). FX failures keep cached quotes. |
| [#17](https://github.com/ZhannaM85/my-money/issues/17) | 🔍 Pending validation | Epic 16 — Localization (English and Russian) | Typed dictionary. Locale in settings (backup field stays `locale`). Switcher on More. |
| [#18](https://github.com/ZhannaM85/my-money/issues/18) | 🔍 Pending validation | Epic 17 — Accessibility and responsive QA pass | Skip link, chip `aria-pressed`, darker allocation colors, scrollable chip rows. |

---

## Tier 7 — Native platforms

_After the four web flows feel good. Android wraps this app; iOS does not._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#19](https://github.com/ZhannaM85/my-money/issues/19) | 🔲 Open | Epic 18 — Android via Capacitor | Wrap, don’t rewrite. Store listing can be child issues later. |
| [#20](https://github.com/ZhannaM85/my-money/issues/20) | 🔲 Open | Epic 19 — Native iOS app (Swift / SwiftUI) | Tracking epic. Requires a Mac. Split into children when scheduled. Shares JSON schema with #13. |

---

## Tier 8 — Branding (2026-08-17)

_User supplied light and dark logo marks. Blocked on #1 (no `public/` yet). Tiny favicons should crop to the circular **M**; full lockup is for larger icons._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#21](https://github.com/ZhannaM85/my-money/issues/21) | 🔍 Pending validation | Use light and dark My Money marks as favicons | Source: `docs/branding/logo-light.png` + `logo-dark.png`. `prefers-color-scheme`. Tiny sizes are a center crop of the **M**. |
| [#22](https://github.com/ZhannaM85/my-money/issues/22) | 🔍 Pending validation | Tab favicon is clipped; generate tiny sizes from the 192px marks | 64px tab icons from `icon-*-192.png` with padding, same pattern as turtle-steps `favicon-64.png`. |

---

## Tier 9 — Live feedback (2026-08-18)

_EUR base + RUB assets; iPhone tab bar; appearance; car; joint ownership; decimals; exclude/hide/delete; input formatting._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#23](https://github.com/ZhannaM85/my-money/issues/23) | 🔍 Pending validation | RUB assets show €0 when base currency is EUR | `RUB` pairs no longer go through Frankfurter. They now use the app-hosted static ruble dataset path so one selected base currency can produce one converted mixed-currency total. |
| [#24](https://github.com/ZhannaM85/my-money/issues/24) | 🔍 Pending validation | Tab bar sits flush on the iPhone home indicator | Turtle: `viewport-fit=cover` so `pb-[env(safe-area-inset-bottom)]` is not 0. Tab links `min-h-20`. |
| [#25](https://github.com/ZhannaM85/my-money/issues/25) | 🔍 Pending validation | Tab bar disconnects from the bottom on iPhone Safari | CSS is already `fixed bottom-0`. Same WebKit visual-viewport class as Turtle #120/#188 — hide bar while keyboard/viewport shrunk. |
| [#26](https://github.com/ZhannaM85/my-money/issues/26) | 🔍 Pending validation | Add a colorful appearance mood matching the design mockups | Keep current green as one mood. Second mood: neutral chrome + category colors (blue/teal, green, amber, purple, coral). Turtle `data-mood` pattern. |
| [#27](https://github.com/ZhannaM85/my-money/issues/27) | 🔍 Pending validation | Make car a first-class, obvious asset | Brief already includes cars. Model has Property → Vehicle. Forks: own class vs keep under Property; Car vs Vehicle; included vs excluded by default. |
| [#28](https://github.com/ZhannaM85/my-money/issues/28) | 🔍 Pending validation | Record ownership share for jointly owned assets | Lake house 1/2 with spouse. Store full value + share; net worth uses share × value. Forks: share on asset vs snapshot; % vs fraction. |
| [#29](https://github.com/ZhannaM85/my-money/issues/29) | 🔍 Pending validation | Cannot enter kopecks/cents: comma decimals fail validation | `16155,11` → “Enter a current amount”. Forms use `Number()`; CSV `parseAmount` already accepts comma decimals. |
| [#30](https://github.com/ZhannaM85/my-money/issues/30) | 🔍 Pending validation | Exclude an asset from net worth without hiding it | Domain already has `excluded`. Only a buried Tracking select on edit. Surface a clear Exclude control. |
| [#31](https://github.com/ZhannaM85/my-money/issues/31) | 🔍 Pending validation | Hide an asset from the active list | Archive already hides from All. Make hide/restore obvious (not only “Archive asset”). |
| [#32](https://github.com/ZhannaM85/my-money/issues/32) | 🔍 Pending validation | Permanently delete an asset and its history | No UI/store delete. Must cascade snapshots. Confirm. Archive stays the default. |
| [#33](https://github.com/ZhannaM85/my-money/issues/33) | 🔍 Pending validation | Format money inputs with locale grouping and decimals | Current amount shows `116420`. Lists use `formatAmount`; inputs do not. Share a parser with #29. |
| [#34](https://github.com/ZhannaM85/my-money/issues/34) | 🔍 Pending validation | Show banner when a new deploy is available | Turtle `AppUpdateBanner` pattern: poll `version.json` vs baked `__APP_VERSION__`, Reload in `AppShell`. No signal today after Pages deploy. |
| [#35](https://github.com/ZhannaM85/my-money/issues/35) | 🔍 Pending validation | Offline banner and resilient refresh via service worker | Turtle #163: Workbox precache so offline refresh loads the SPA; `OfflineBanner` + `useOnlineStatus`. Builds on #16 SW scaffold. Data stays on IndexedDB. |
| [#36](https://github.com/ZhannaM85/my-money/issues/36) | 🔍 Pending validation | Show changelog and app version on Settings | Turtle `releaseNotes.ts`: incrementing `vN`, EN/RU notes, badge on Settings. No way today to tell which build the phone is on. |
| [#37](https://github.com/ZhannaM85/my-money/issues/37) | 🔍 Pending validation | Update banner still missing; installed PWA does not pick up new deploys | Live: `version.json` is current but home-screen PWA stays on old shell. Chicken-and-egg vs #34 — old SW never loads banner code. Turtle #649 class. |
| [#38](https://github.com/ZhannaM85/my-money/issues/38) | 🔍 Pending validation | Offline banner does not show in Safari (including Dashboard) | Airplane mode, browser Dashboard: app works, no banner. Not page-specific — `AppShell` should show it everywhere. Follow-up to #35. |
| [#39](https://github.com/ZhannaM85/my-money/issues/39) | 🔍 Pending validation | Show pull-to-refresh loading indicator in the PWA | Turtle `PullToRefreshIndicator`: floating `RefreshCw` badge while dragging down, spinner once refresh starts. My Money has no visible pull feedback today. |
| [#40](https://github.com/ZhannaM85/my-money/issues/40) | 🔍 Pending validation | Add spacing between bottom content and sticky footer | Main content now reserves a larger bottom gap above the fixed tab bar, including safe-area space, so the last control no longer crowds the footer. |
| [#41](https://github.com/ZhannaM85/my-money/issues/41) | 🔍 Pending validation | Add zoom in and zoom out controls for graphs | Dashboard now has zoom-in/zoom-out range controls that widen or narrow the visible history window without leaving the page. |
| [#42](https://github.com/ZhannaM85/my-money/issues/42) | 🔍 Pending validation | Add a show original currencies mode in Settings | Settings now persist an asset-display mode (`Converted` vs `Original`), and asset-level views honor that preference instead of always preferring converted values. |
| [#43](https://github.com/ZhannaM85/my-money/issues/43) | 🔍 Pending validation | Add a Dashboard currency filter dropdown | Dashboard now has its own currency dropdown that filters totals and the chart locally, independent from Settings display/conversion mode. |
| [#44](https://github.com/ZhannaM85/my-money/issues/44) | 🔍 Pending validation | Own a static RUB FX dataset for the PWA | Static `RUB` history is now generated during deploy and loaded from same-origin files into the FX cache instead of relying on fragile browser-side runtime fetches. |
| [#45](https://github.com/ZhannaM85/my-money/issues/45) | 🔍 Pending validation | Allow manual entry of today's FX rates as a fallback | Settings editor for same-day manual FX overrides; merged above system quotes for today only. |
| [#46](https://github.com/ZhannaM85/my-money/issues/46) | 🔍 Pending validation | Original + All should show every native holding; disable the inactive currency dropdown | Original + All lists native totals per currency. Settings base currency disabled in Original; Dashboard currency filter disabled in Converted. |
| [#47](https://github.com/ZhannaM85/my-money/issues/47) | 🔍 Pending validation | Use National Bank of Georgia rates for RUB conversion | Deploy generator now builds `fx/rub/*.json` from NBG JSON (GEL cross, quantity applied). Same-origin static load unchanged. |
| [#48](https://github.com/ZhannaM85/my-money/issues/48) | 🔍 Pending validation | Static CBR RUB dataset deploys empty (no EUR/RUB quotes) | Parser now accepts `Date`+`Id` on CBR `Record`s; empty series fails the generate step. Missing-rate copy no longer claims ECB. |
| [#49](https://github.com/ZhannaM85/my-money/issues/49) | 🔍 Pending validation | Converted totals still fail on device — add FX diagnostic loggers | Opt-in `localStorage my-money:fx-debug=1` logs static RUB fetch, ensureRange, and Converted holdings. |
| [#53](https://github.com/ZhannaM85/my-money/issues/53) | 🔍 Pending validation | In-app FX debug panel for iPhone Safari / PWA | Settings FX debug toggle + on-screen log + Copy, so iPhone does not need a Mac console. |
| [#54](https://github.com/ZhannaM85/my-money/issues/54) | 🔍 Pending validation | Pinch to zoom charts like Turtle Steps | Pinch out zooms in (narrower range), pinch in zooms out. Same steps as the zoom buttons; History chips still work. |
| [#55](https://github.com/ZhannaM85/my-money/issues/55) | 🔍 Pending validation | Safari unbinds fetch — static RUB rates never load on iPhone | FX clients now call `globalThis.fetch` so Safari does not throw “Can only call Window.fetch on instances of Window”. |
| [#50](https://github.com/ZhannaM85/my-money/issues/50) | 🔍 Pending validation | Manual FX save gives no feedback — collapse or show read-only rates | After save, editor collapses and today’s overrides show as a read-only list. |
| [#51](https://github.com/ZhannaM85/my-money/issues/51) | 🔍 Pending validation | Converted Dashboard should list each item with original and converted amounts | Converted Dashboard lists each holding with native + base amounts under the combined total. |
| [#52](https://github.com/ZhannaM85/my-money/issues/52) | 🔍 Pending validation | Show unconvertible holdings instead of hiding them | Converted Dashboard lists missing-rate holdings with native amount + “Conversion not available”. Combined total still excludes them. |
| [#56](https://github.com/ZhannaM85/my-money/issues/56) | 🔍 Pending validation | Chart Y-axis repeats the same compact label on every tick | Padded Y domain + explicit ticks so a flat ~2 million series does not print the same compact label on every tick. |
| [#58](https://github.com/ZhannaM85/my-money/issues/58) | 🔍 Pending validation | History shows 0,00 ₽ for the selected range while the list and chart moved | History (and Dashboard range line) now use last − first of the visible series, so FX moves on later dates are not shown as 0,00. |
| [#59](https://github.com/ZhannaM85/my-money/issues/59) | 🔍 Pending validation | Retune Colorful mood so it is not a black UI | Colorful is charcoal dark; violet on buttons/actions. Page is not teal/green. Other moods unchanged. |
| [#61](https://github.com/ZhannaM85/my-money/issues/61) | 🔍 Pending validation | Allow adding an asset with a past first-snapshot date | New asset and onboarding forms have As of (default today). Past dates save; future dates are rejected. |

---

## Tier 10 — Live feedback (2026-08-19)

_#61 did not reach the phone because Pages deploy failed._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#62](https://github.com/ZhannaM85/my-money/issues/62) | 🔍 Pending validation | Pages deploy of #61 failed on a racy Settings currency test | Converted-mode Base currency test now waits until settings have loaded before asserting the dropdown is enabled. |
| [#63](https://github.com/ZhannaM85/my-money/issues/63) | 🔍 Pending validation | Pages deploy fails type-check on Colorful CSS test Node imports | Colorful token test moved out of `src/` so app `tsc` does not typecheck Node `fs` imports. |

---

## Tier 11 — Live feedback (2026-08-20)

_Converted Dashboard: chart dropped while holdings stayed the same. Need a per-day breakdown to see why._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#64](https://github.com/ZhannaM85/my-money/issues/64) | 🔍 Pending validation | Dashboard chart shows a decrease when holdings did not change | Historical series carries forward the last earlier FX quote so a missing same-day rate does not drop the holding. |
| [#65](https://github.com/ZhannaM85/my-money/issues/65) | 🔍 Pending validation | Show what each day's total is made of (chart tooltip + History accordion) | Chart tooltip lists that date’s holdings. History day rows expand. Unconverted holdings stay visible. |

---

## Tier 12 — Live feedback (2026-08-22)

_Existing-asset details: no dated history, and Save is a no-op when viewing._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#66](https://github.com/ZhannaM85/my-money/issues/66) | 📋 Not started | Add and edit past snapshot entries on existing assets | Edit form has New amount with no date. Need amount + date for past days (e.g. 1 Jan, 2 Apr) and edit of existing snapshots. Follow-up to #61. |
| [#67](https://github.com/ZhannaM85/my-money/issues/67) | 📋 Not started | Existing asset Save does nothing; add a view / read-only mode | Tapping Save information with no changes (empty New amount) does nothing. Prefer a read-only details view instead of an always-edit form. |
| [#68](https://github.com/ZhannaM85/my-money/issues/68) | 📋 Not started | Date input is broken in the PWA | New-asset As of / На дату picker (from #61) does not work in the iPhone PWA — cannot reliably choose a date. |
| [#69](https://github.com/ZhannaM85/my-money/issues/69) | 📋 Not started | Show assets distribution on Dashboard when currency is All | Allocation is only on Dashboard when a single/base currency is selected. All (Все) shows a Distribution button, not the breakdown. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

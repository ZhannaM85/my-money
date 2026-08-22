# Issues Priority List

Active work queue only (open, pending validation, not started, partial). Closed history lives in [`docs/issues-priority-archive/`](./issues-priority-archive/README.md).

Work top-to-bottom within each tier; dependencies are noted where order matters. When an issue is confirmed done, move its row to the archive.

The **initial backlog (Tiers 1–7)** is the planned implementation sequence from `PROJECT_BRIEF.md`, filed at project start — same shape as turtle-steps' original Phase 1/2 epics, not a same-day live-feedback split. Later live-feedback filings on a given calendar day append to that day's tier (see `docs/AGENT_WORKFLOW.md`).

Prototype checkpoint after Tier 5: the four flows in `PROJECT_BRIEF.md` §25 (onboarding, dashboard, update, asset details) should feel good before native platforms.

---

## Tier 7 — Native platforms

_After the four web flows feel good. Android wraps this app; iOS does not._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#19](https://github.com/ZhannaM85/my-money/issues/19) | 🔲 Open | Epic 18 — Android via Capacitor | Wrap, don’t rewrite. Store listing can be child issues later. |
| [#20](https://github.com/ZhannaM85/my-money/issues/20) | 🔲 Open | Epic 19 — Native iOS app (Swift / SwiftUI) | Tracking epic. Requires a Mac. Split into children when scheduled. Shares JSON schema with #13. |

---

## Tier 9 — Live feedback (2026-08-18)

_EUR base + RUB assets; iPhone tab bar; appearance; car; joint ownership; decimals; exclude/hide/delete; input formatting._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
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
| [#68](https://github.com/ZhannaM85/my-money/issues/68) | 🔍 Pending validation | Date input is broken in the PWA | DateField: visible calendar, full-field picker indicator, `showPicker()` on tap. |
| [#69](https://github.com/ZhannaM85/my-money/issues/69) | 📋 Not started | Show assets distribution on Dashboard when currency is All | Allocation is only on Dashboard when a single/base currency is selected. All (Все) shows a Distribution button, not the breakdown. |
| [#70](https://github.com/ZhannaM85/my-money/issues/70) | 🔍 Pending validation | Original mode still shows a EUR conversion on one asset | Native list (and details native view) no longer appends `est. €`. Secondary line is native currency only. |
| [#71](https://github.com/ZhannaM85/my-money/issues/71) | 🔍 Pending validation | Explain the two amount inputs with an info tooltip | Tappable CircleHelp on Update this asset and New amount (optional); not hover-only. |
| [#72](https://github.com/ZhannaM85/my-money/issues/72) | 🔍 Pending validation | Allow editing previous snapshot rows on asset details | Pencil on a history row edits amount + date in place (`updateSnapshot`). Does not append today. |
| [#73](https://github.com/ZhannaM85/my-money/issues/73) | 🔍 Pending validation | Allow deleting previous snapshot rows on asset details | Trash on each history row; confirm; `deleteSnapshot` by id. Asset remains. |
| [#74](https://github.com/ZhannaM85/my-money/issues/74) | 🔍 Pending validation | Chart X-axis repeats the same date; label snapshot days | Unique snapshot days with day + month (`18 Aug`), not `date.slice(8)` repeating `18`. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

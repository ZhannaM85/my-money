# Issues Priority — Archive tiers 8+

Closed live-feedback rows from Tier 8 onward. Open / pending items stay in [`../issues-priority.md`](../issues-priority.md).

---

## Tier 8 — Branding (2026-08-17)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#21](https://github.com/ZhannaM85/my-money/issues/21) | ✅ Done | Use light and dark My Money marks as favicons | Source: `docs/branding/logo-light.png` + `logo-dark.png`. `prefers-color-scheme`. Tiny sizes are a center crop of the **M**. Validated on-device 2026-08-22. |
| [#22](https://github.com/ZhannaM85/my-money/issues/22) | ✅ Done | Tab favicon is clipped; generate tiny sizes from the 192px marks | 64px tab icons from `icon-*-192.png` with padding, same pattern as turtle-steps `favicon-64.png`. Validated on-device 2026-08-22. |

## Tier 9 — Live feedback (2026-08-18)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#23](https://github.com/ZhannaM85/my-money/issues/23) | ✅ Done | RUB assets show €0 when base currency is EUR | `RUB` pairs no longer go through Frankfurter. They now use the app-hosted static ruble dataset path so one selected base currency can produce one converted mixed-currency total. Validated on-device 2026-08-22. |
| [#24](https://github.com/ZhannaM85/my-money/issues/24) | ✅ Done | Tab bar sits flush on the iPhone home indicator | Turtle: `viewport-fit=cover` so `pb-[env(safe-area-inset-bottom)]` is not 0. Tab links `min-h-20`. Validated on-device 2026-08-22. |
| [#26](https://github.com/ZhannaM85/my-money/issues/26) | ✅ Done | Add a colorful appearance mood matching the design mockups | Keep current green as one mood. Second mood: neutral chrome + category colors (blue/teal, green, amber, purple, coral). Turtle `data-mood` pattern. Validated on-device 2026-08-22. |
| [#27](https://github.com/ZhannaM85/my-money/issues/27) | ✅ Done | Make car a first-class, obvious asset | Brief already includes cars. Model has Property → Vehicle. Forks: own class vs keep under Property; Car vs Vehicle; included vs excluded by default. Validated on-device 2026-08-22. |
| [#28](https://github.com/ZhannaM85/my-money/issues/28) | ✅ Done | Record ownership share for jointly owned assets | Lake house 1/2 with spouse. Store full value + share; net worth uses share × value. Forks: share on asset vs snapshot; % vs fraction. Validated on-device 2026-08-22. |
| [#29](https://github.com/ZhannaM85/my-money/issues/29) | ✅ Done | Cannot enter kopecks/cents: comma decimals fail validation | `16155,11` → “Enter a current amount”. Forms use `Number()`; CSV `parseAmount` already accepts comma decimals. Validated on-device 2026-08-22. |
| [#30](https://github.com/ZhannaM85/my-money/issues/30) | ✅ Done | Exclude an asset from net worth without hiding it | Domain already has `excluded`. Only a buried Tracking select on edit. Surface a clear Exclude control. Validated on-device 2026-08-22. |
| [#31](https://github.com/ZhannaM85/my-money/issues/31) | ✅ Done | Hide an asset from the active list | Archive already hides from All. Make hide/restore obvious (not only “Archive asset”). Validated on-device 2026-08-22. |
| [#32](https://github.com/ZhannaM85/my-money/issues/32) | ✅ Done | Permanently delete an asset and its history | No UI/store delete. Must cascade snapshots. Confirm. Archive stays the default. Validated on-device 2026-08-22. |
| [#33](https://github.com/ZhannaM85/my-money/issues/33) | ✅ Done | Format money inputs with locale grouping and decimals | Current amount shows `116420`. Lists use `formatAmount`; inputs do not. Share a parser with #29. Validated on-device 2026-08-22. |
| [#34](https://github.com/ZhannaM85/my-money/issues/34) | ✅ Done | Show banner when a new deploy is available | Turtle `AppUpdateBanner` pattern: poll `version.json` vs baked `__APP_VERSION__`, Reload in `AppShell`. No signal today after Pages deploy. Validated on-device 2026-08-22. |
| [#35](https://github.com/ZhannaM85/my-money/issues/35) | ✅ Done | Offline banner and resilient refresh via service worker | Turtle #163: Workbox precache so offline refresh loads the SPA; `OfflineBanner` + `useOnlineStatus`. Builds on #16 SW scaffold. Data stays on IndexedDB. Validated on-device 2026-08-22. |
| [#36](https://github.com/ZhannaM85/my-money/issues/36) | ✅ Done | Show changelog and app version on Settings | Turtle `releaseNotes.ts`: incrementing `vN`, EN/RU notes, badge on Settings. No way today to tell which build the phone is on. Validated on-device 2026-08-22. |
| [#37](https://github.com/ZhannaM85/my-money/issues/37) | ✅ Done | Update banner still missing; installed PWA does not pick up new deploys | Live: `version.json` is current but home-screen PWA stays on old shell. Chicken-and-egg vs #34 — old SW never loads banner code. Turtle #649 class. Validated on-device 2026-08-22. |
| [#38](https://github.com/ZhannaM85/my-money/issues/38) | ✅ Done | Offline banner does not show in Safari (including Dashboard) | Airplane mode, browser Dashboard: app works, no banner. Not page-specific — `AppShell` should show it everywhere. Follow-up to #35. Validated on-device 2026-08-22. |
| [#39](https://github.com/ZhannaM85/my-money/issues/39) | ✅ Done | Show pull-to-refresh loading indicator in the PWA | Turtle `PullToRefreshIndicator`: floating `RefreshCw` badge while dragging down, spinner once refresh starts. My Money has no visible pull feedback today. Validated on-device 2026-08-22. |
| [#40](https://github.com/ZhannaM85/my-money/issues/40) | ✅ Done | Add spacing between bottom content and sticky footer | Main content now reserves a larger bottom gap above the fixed tab bar, including safe-area space, so the last control no longer crowds the footer. Validated on-device 2026-08-22. |
| [#41](https://github.com/ZhannaM85/my-money/issues/41) | ✅ Done | Add zoom in and zoom out controls for graphs | Dashboard now has zoom-in/zoom-out range controls that widen or narrow the visible history window without leaving the page. Validated on-device 2026-08-22. |
| [#42](https://github.com/ZhannaM85/my-money/issues/42) | ✅ Done | Add a show all currencies display option | Settings base-currency dropdown now starts with Show all currencies. All = Original/native totals; a single code = Converted into that currency. Validated on-device 2026-08-22. |
| [#43](https://github.com/ZhannaM85/my-money/issues/43) | ✅ Done | Add a Dashboard currency filter dropdown | Dashboard now has its own currency dropdown that filters totals and the chart locally, independent from Settings display/conversion mode. Validated on-device 2026-08-22. |
| [#44](https://github.com/ZhannaM85/my-money/issues/44) | ✅ Done | Own a static RUB FX dataset for the PWA | Static `RUB` history is now generated during deploy and loaded from same-origin files into the FX cache instead of relying on fragile browser-side runtime fetches. Validated on-device 2026-08-22. |
| [#45](https://github.com/ZhannaM85/my-money/issues/45) | ✅ Done | Allow manual entry of today's FX rates as a fallback | Settings editor for same-day manual FX overrides; merged above system quotes for today only. Validated on-device 2026-08-22. |
| [#46](https://github.com/ZhannaM85/my-money/issues/46) | ✅ Done | Original + All should show every native holding; disable the inactive currency dropdown | Original + All lists native totals per currency. Settings base currency disabled in Original; Dashboard currency filter disabled in Converted. Validated on-device 2026-08-22. |
| [#47](https://github.com/ZhannaM85/my-money/issues/47) | ✅ Done | Use National Bank of Georgia rates for RUB conversion | Deploy generator now builds `fx/rub/*.json` from NBG JSON (GEL cross, quantity applied). Same-origin static load unchanged. Validated on-device 2026-08-22. |
| [#48](https://github.com/ZhannaM85/my-money/issues/48) | ✅ Done | Static CBR RUB dataset deploys empty (no EUR/RUB quotes) | Parser now accepts `Date`+`Id` on CBR `Record`s; empty series fails the generate step. Missing-rate copy no longer claims ECB. Validated on-device 2026-08-22. |
| [#49](https://github.com/ZhannaM85/my-money/issues/49) | ✅ Done | Converted totals still fail on device — add FX diagnostic loggers | Opt-in `localStorage my-money:fx-debug=1` logs static RUB fetch, ensureRange, and Converted holdings. Validated on-device 2026-08-22. |
| [#50](https://github.com/ZhannaM85/my-money/issues/50) | ✅ Done | Manual FX save gives no feedback — collapse or show read-only rates | After save, editor collapses and today’s overrides show as a read-only list. Validated on-device 2026-08-22. |
| [#51](https://github.com/ZhannaM85/my-money/issues/51) | ✅ Done | Converted Dashboard should list each item with original and converted amounts | Converted Dashboard lists each holding with native + base amounts under the combined total. Validated on-device 2026-08-22. |
| [#52](https://github.com/ZhannaM85/my-money/issues/52) | ✅ Done | Show unconvertible holdings instead of hiding them | Converted Dashboard lists missing-rate holdings with native amount + “Conversion not available”. Combined total still excludes them. Validated on-device 2026-08-22. |
| [#53](https://github.com/ZhannaM85/my-money/issues/53) | ✅ Done | In-app FX debug panel for iPhone Safari / PWA | Settings FX debug toggle + on-screen log + Copy, so iPhone does not need a Mac console. Validated on-device 2026-08-22. |
| [#54](https://github.com/ZhannaM85/my-money/issues/54) | ✅ Done | Pinch to zoom charts like Turtle Steps | Pinch out zooms in (narrower range), pinch in zooms out. Same steps as the zoom buttons; History chips still work. Validated on-device 2026-08-22. |
| [#55](https://github.com/ZhannaM85/my-money/issues/55) | ✅ Done | Safari unbinds fetch — static RUB rates never load on iPhone | FX clients now call `globalThis.fetch` so Safari does not throw “Can only call Window.fetch on instances of Window”. Validated on-device 2026-08-22. |
| [#56](https://github.com/ZhannaM85/my-money/issues/56) | ✅ Done | Chart Y-axis repeats the same compact label on every tick | Padded Y domain + explicit ticks so a flat ~2 million series does not print the same compact label on every tick. Validated on-device 2026-08-22. |
| [#57](https://github.com/ZhannaM85/my-money/issues/57) | ✅ Done | Add Soft Finance, Neutral, and Pastel appearance moods | Colorful and Green stay. Extra moods: Soft Finance, Neutral (slate, not black-black), Pastel. Validated on-device 2026-08-19. |
| [#58](https://github.com/ZhannaM85/my-money/issues/58) | ✅ Done | History shows 0,00 ₽ for the selected range while the list and chart moved | History (and Dashboard range line) now use last − first of the visible series, so FX moves on later dates are not shown as 0,00. Validated on-device 2026-08-22. |
| [#59](https://github.com/ZhannaM85/my-money/issues/59) | ✅ Done | Retune Colorful mood so it is not a black UI | Colorful is charcoal dark; violet on buttons/actions. Page is not teal/green. Other moods unchanged. Validated on-device 2026-08-22. |
| [#60](https://github.com/ZhannaM85/my-money/issues/60) | ✅ Done | Collapse Dashboard holdings behind an accordion | Converted Holdings start collapsed; tap the header to expand. Original + All native totals stay visible (they are the main figures). Validated on-device 2026-08-19. |
| [#61](https://github.com/ZhannaM85/my-money/issues/61) | ✅ Done | Allow adding an asset with a past first-snapshot date | New asset and onboarding forms have As of (default today). Past dates save; future dates are rejected. Validated on-device 2026-08-22. |

## Tier 10 — Live feedback (2026-08-19)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#62](https://github.com/ZhannaM85/my-money/issues/62) | ✅ Done | Pages deploy of #61 failed on a racy Settings currency test | Converted-mode Base currency test now waits until settings have loaded before asserting the dropdown is enabled. Validated on-device 2026-08-22. |
| [#63](https://github.com/ZhannaM85/my-money/issues/63) | ✅ Done | Pages deploy fails type-check on Colorful CSS test Node imports | Colorful token test moved out of `src/` so app `tsc` does not typecheck Node `fs` imports. Validated on-device 2026-08-22. |

## Tier 11 — Live feedback (2026-08-20)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#64](https://github.com/ZhannaM85/my-money/issues/64) | ✅ Done | Dashboard chart shows a decrease when holdings did not change | Historical series carries forward the last earlier FX quote so a missing same-day rate does not drop the holding. Validated on-device 2026-08-22. |
| [#65](https://github.com/ZhannaM85/my-money/issues/65) | ✅ Done | Show what each day's total is made of (chart tooltip + History accordion) | Chart tooltip lists that date’s holdings. History day rows expand. Unconverted holdings stay visible. Validated on-device 2026-08-22. |

## Tier 12 — Live feedback (2026-08-22)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#66](https://github.com/ZhannaM85/my-money/issues/66) | ✅ Done | Add and edit past snapshot entries on existing assets | As of on Update this asset and on the edit form. Past dates save a new snapshot; future dates rejected. Edit of existing rows is #72. Validated on-device 2026-08-22. |
| [#67](https://github.com/ZhannaM85/my-money/issues/67) | ✅ Done | Existing asset Save does nothing; add a view / read-only mode | Details open read-only. Edit details reveals the form. No no-op Save on view. Validated on-device 2026-08-22. |
| [#68](https://github.com/ZhannaM85/my-money/issues/68) | ✅ Done | Date input is broken in the PWA | Add-asset As of uses Turtle `w-36` DateField (#84). Picker overlay kept. Validated on-device 2026-08-22. Follow-up width: #95. |
| [#69](https://github.com/ZhannaM85/my-money/issues/69) | ✅ Done | Show assets distribution on Dashboard when currency is All | Reverted dashboard donut. Currency totals expand to holdings. Allocation page unchanged. Validated on-device 2026-08-22. |
| [#70](https://github.com/ZhannaM85/my-money/issues/70) | ✅ Done | Original mode still shows a EUR conversion on one asset | Native list (and details native view) no longer appends `est. €`. Secondary line is native currency only. Validated on-device 2026-08-22. |
| [#71](https://github.com/ZhannaM85/my-money/issues/71) | ✅ Done | Explain the two amount inputs with an info tooltip | Tappable CircleHelp on Update this asset and New amount (optional); not hover-only. Validated on-device 2026-08-22. |
| [#72](https://github.com/ZhannaM85/my-money/issues/72) | ✅ Done | Allow editing previous snapshot rows on asset details | Pencil on a history row edits amount + date in place (`updateSnapshot`). Does not append today. Validated on-device 2026-08-22. |
| [#73](https://github.com/ZhannaM85/my-money/issues/73) | ✅ Done | Allow deleting previous snapshot rows on asset details | Trash on each history row; confirm; `deleteSnapshot` by id. Asset remains. Validated on-device 2026-08-22. |
| [#74](https://github.com/ZhannaM85/my-money/issues/74) | ✅ Done | Chart X-axis repeats the same date; label snapshot days | Unique snapshot days with day + month (`18 Aug`), not `date.slice(8)` repeating `18`. Validated on-device 2026-08-22. |
| [#77](https://github.com/ZhannaM85/my-money/issues/77) | ✅ Done | Dashboard chart tooltip stays visible while scrolling | Scroll and touchmove dismiss the Recharts tooltip; tap the chart again to show it. Validated on-device 2026-08-22. |

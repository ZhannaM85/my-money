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
| [#43](https://github.com/ZhannaM85/my-money/issues/43) | ✅ Done | Add a Dashboard currency filter dropdown | Dashboard now has its own currency dropdown that filters totals and the chart locally, independent from Settings display/conversion mode. Validated on-device 2026-08-22. |
| [#44](https://github.com/ZhannaM85/my-money/issues/44) | ✅ Done | Own a static RUB FX dataset for the PWA | Static `RUB` history is now generated during deploy and loaded from same-origin files into the FX cache instead of relying on fragile browser-side runtime fetches. Validated on-device 2026-08-22. |
| [#45](https://github.com/ZhannaM85/my-money/issues/45) | ✅ Done | Allow manual entry of today's FX rates as a fallback | Settings editor for same-day manual FX overrides; merged above system quotes for today only. Validated on-device 2026-08-22. |
| [#57](https://github.com/ZhannaM85/my-money/issues/57) | ✅ Done | Add Soft Finance, Neutral, and Pastel appearance moods | Colorful and Green stay. Extra moods: Soft Finance, Neutral (slate, not black-black), Pastel. Validated on-device 2026-08-19. |
| [#60](https://github.com/ZhannaM85/my-money/issues/60) | ✅ Done | Collapse Dashboard holdings behind an accordion | Converted Holdings start collapsed; tap the header to expand. Original + All native totals stay visible (they are the main figures). Validated on-device 2026-08-19. |

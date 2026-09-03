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
| [#25](https://github.com/ZhannaM85/my-money/issues/25) | ✅ Done | Tab bar disconnects from the bottom on iPhone Safari | Turtle still footer: `fixed inset-x-0 bottom-0`, no visualViewport translateY. Keyboard hide is #80. Validated on-device 2026-08-22 (iPhone 14 Pro). 17 Pro Max remainder: #106. |
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
| [#78](https://github.com/ZhannaM85/my-money/issues/78) | ✅ Done | Adopt the My Money design system as the default UI | New **Fresh** mood from `docs/DESIGN_SYSTEM.md`; default for new installs. Existing moods untouched. Validated on-device 2026-08-22. Follow-up Fresh vs Neutral: #98. |
| [#79](https://github.com/ZhannaM85/my-money/issues/79) | ✅ Done | History list shows every calendar day, not only days the user added | List is snapshot days only. Chart still uses the daily series. Validated on-device 2026-08-22. |
| [#80](https://github.com/ZhannaM85/my-money/issues/80) | ✅ Done | Tab bar hides on scroll and can reappear mid-page | No longer hides when the visual viewport shrinks. Keyboard focus still hides it. Pin-to-bottom is #25. Validated on-device 2026-08-22. Resume-from-background: #91. |
| [#81](https://github.com/ZhannaM85/my-money/issues/81) | ✅ Done | Dashboard and History show different net worth totals | Dashboard Converted headline is today’s historicalNetWorth point (same as History). Validated on-device 2026-08-22. Period deltas: #89. |
| [#82](https://github.com/ZhannaM85/my-money/issues/82) | ✅ Done | Update-this-asset inputs overflow the phone screen | Amount and Save stack full-width. Date field width is #84. Validated on-device 2026-08-22. |
| [#83](https://github.com/ZhannaM85/my-money/issues/83) | ✅ Done | No way to change currency when editing a past snapshot | Snapshot editor now has a currency select; save persists it on that row. Validated on-device 2026-08-22. |
| [#84](https://github.com/ZhannaM85/my-money/issues/84) | ✅ Done | Safari date fields overflow the card when editing snapshots | Copied Turtle #47: DateField is `h-12 w-36`, not a max-width/overflow clamp. Related #68, #82. Validated on-device 2026-08-22. Follow-up width: #95. |
| [#85](https://github.com/ZhannaM85/my-money/issues/85) | ✅ Done | Dashboard month change has no breakdown (cash exchange looks like a 61k loss) | Tappable hint plus expand From amounts / From rates by holding. Magnitude is #86. Validated on-device 2026-08-22. |
| [#86](https://github.com/ZhannaM85/my-money/issues/86) | ✅ Done | Dashboard this-month change includes FX on existing dollars (~61k instead of ~6k) | StatCard “this month” uses From amounts. From rates stays visible (#88). Validated on-device 2026-08-22. |
| [#87](https://github.com/ZhannaM85/my-money/issues/87) | ✅ Done | All currencies selected but EUR still shown | Converted Dashboard shows the base currency in the filter, not All. Original + All unchanged. Validated on-device 2026-08-22. History leftover EUR: #96. |
| [#88](https://github.com/ZhannaM85/my-money/issues/88) | ✅ Done | Show amount change vs rate change on Dashboard (FX drop visible before a cash exchange) | Converted shows From amounts / From rates plus Update rates (fetch only). Related #85, #86. Validated on-device 2026-08-22. |
| [#89](https://github.com/ZhannaM85/my-money/issues/89) | ✅ Done | Dashboard and History show different period deltas | History StatCard uses From amounts; From rates is listed separately. Related #81, #86. Validated on-device 2026-08-22. |
| [#90](https://github.com/ZhannaM85/my-money/issues/90) | ✅ Done | History 3M change is last two snapshot days, not three months | 3M uses the 90-day window when data exists; if history is shorter, the label is “since first snapshot”. Related #79, #89. Validated on-device 2026-08-22. |
| [#91](https://github.com/ZhannaM85/my-money/issues/91) | ✅ Done | Tab bar floats mid-screen after bringing the app back from background | Re-reads visualViewport on resume (visibility/pageshow/focus). Related #25, #80. Validated on-device 2026-08-22. |
| [#92](https://github.com/ZhannaM85/my-money/issues/92) | ✅ Done | Chart holdings popover clips the last row and cannot scroll | Taller popover (`70svh` / 32rem) with inner overflow-y-scroll and a visible scrollbar. Related #77. Validated on-device 2026-08-22. |
| [#93](https://github.com/ZhannaM85/my-money/issues/93) | ✅ Done | Rate editor shows 1 RUB = 119474 USD | Rate fields use parseRate (many decimals), not money parseAmount. Related #45. Validated on-device 2026-08-22. |
| [#94](https://github.com/ZhannaM85/my-money/issues/94) | ✅ Done | Settings: root-cause log for shipped issues, like the changelog | Sibling of Release notes. Skip #19/#20 until they ship. Validated on-device 2026-08-22. |
| [#95](https://github.com/ZhannaM85/my-money/issues/95) | ✅ Done | Date field is too narrow; expand width by 1.5 | DateField is 1.5× Turtle `w-36` (`w-[13.5rem]`). Related #84. Validated on-device 2026-08-22. |
| [#96](https://github.com/ZhannaM85/my-money/issues/96) | ✅ Done | History shows EUR when All currencies is selected | Original / All uses native totals on History, not leftover baseCurrency. Related #87. Validated on-device 2026-08-22. |
| [#97](https://github.com/ZhannaM85/my-money/issues/97) | ✅ Done | Add optional comments on asset entries and show them in History | Optional snapshot note on History, details, and holdings. Empty notes stay hidden. Validated on-device 2026-08-22. Follow-up color/width: #103. |
| [#98](https://github.com/ZhannaM85/my-money/issues/98) | ✅ Done | Fresh and Neutral appearance moods look the same | Neutral is slate charcoal primary; Fresh stays design-system blue. Related #78, #57. Validated on-device 2026-08-22. |
| [#99](https://github.com/ZhannaM85/my-money/issues/99) | ✅ Done | Add bank card / debit card as a Money type | Money type `debit_card` (EN/RU). Distinct from liability credit card. Validated on-device 2026-08-22. |
| [#100](https://github.com/ZhannaM85/my-money/issues/100) | ✅ Done | Sort Assets by name or amount, and allow drag-and-drop order | Name/amount asc/desc + persisted drag order. Validated on-device 2026-08-22. Follow-up reorder mode: #104. |
| [#101](https://github.com/ZhannaM85/my-money/issues/101) | ✅ Done | Add regression tests so phone bugs are caught in CI, not only on device | CI requires each RCA from #90 onward to be named in a unit test. Closed 2026-08-22 without on-device validation. |
| [#102](https://github.com/ZhannaM85/my-money/issues/102) | ✅ Done | Show institution name in the asset details sub-header next to currency | Sub-header is type · institution · currency when institution is set; otherwise type · currency. Validated on-device 2026-08-22. |
| [#103](https://github.com/ZhannaM85/my-money/issues/103) | ✅ Done | Show snapshot comments in a lighter color and give them more width | Muted full-width note under date/amount on details (and History holdings). Related #97. Validated on-device 2026-08-22. |
| [#104](https://github.com/ZhannaM85/my-money/issues/104) | ✅ Done | Only enable Assets drag-and-drop in an explicit reorder mode | Reorder / Done. Grips only in that mode. Named sort exits reorder. Follow-up to #100. Validated on-device 2026-08-22. Save-on-drop: #105. |
| [#105](https://github.com/ZhannaM85/my-money/issues/105) | ✅ Done | Do not auto-save Assets order on drop; add a Save control | Persist only on Save, not on drop. Cancel restores previous order. Follow-up to #100, #104. Validated on-device 2026-08-22. |
| [#106](https://github.com/ZhannaM85/my-money/issues/106) | ✅ Done | Tab bar still disconnects from the bottom on iPhone 17 Pro Max | In-flow dvh shell, not position:fixed. Safari 26 shifts fixed footers. Follow-up to #25. Validated on-device 2026-08-22. |

## Tier 13 — Live feedback (2026-08-26)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#109](https://github.com/ZhannaM85/my-money/issues/109) | ✅ Done | Show institution on Assets subtitle and Dashboard holdings second row | Assets: type · institution. Dashboard holdings: muted institution under name when set. Follow-up to #102. Validated on-device 2026-08-26. |
| [#110](https://github.com/ZhannaM85/my-money/issues/110) | ✅ Done | Do not allow negative Y-axis when chart values are non-negative | `chartAxisScale` clamps floor to 0 when data min ≥ 0; real negatives still pad below. Validated on-device 2026-08-26. |
| [#114](https://github.com/ZhannaM85/my-money/issues/114) | ✅ Done | Pinch zoom does not work on asset details chart | Asset details HistoryRange + pinch/button zoom like Dashboard (#54). Validated on-device 2026-08-26. Follow-up all charts: #116. |
| [#113](https://github.com/ZhannaM85/my-money/issues/113) | ✅ Done | Loading Dashboard takes a long time | Original skips ensureRange; offline skips Frankfurter; no Converted series in Original. Validated on-device 2026-08-26. |
| [#107](https://github.com/ZhannaM85/my-money/issues/107) | ✅ Done | Add support for GEL (Georgian Lari) | GEL in `BASE_CURRENCIES`; Frankfurter skips it. Converted via manual FX until static GEL series. Validated on-device 2026-08-26. |
| [#115](https://github.com/ZhannaM85/my-money/issues/115) | ✅ Done | Warn on duplicate snapshot (same date and amount) without blocking | Soft hint via `hasDuplicateSnapshot`; Save still works. Validated on-device 2026-08-26. Color follow-up → #119. |
| [#119](https://github.com/ZhannaM85/my-money/issues/119) | ✅ Done | Show soft warnings (e.g. duplicate snapshot) in light orange | `text-warning` / `--warning` token instead of muted gray. Validated on-device 2026-08-26. |
| [#118](https://github.com/ZhannaM85/my-money/issues/118) | ✅ Done | Attach Playwright screenshots to GitHub issues as proof before validation | `screenshots:capture` + `screenshots:attach`; docs in `VALIDATION_SCREENSHOTS.md`. Closed without on-device validation (tooling). |
| [#117](https://github.com/ZhannaM85/my-money/issues/117) | ✅ Done | Dashboard date input to choose which day Positions show | As of DateField drives Positions / header; syncs with chart. Validated on-device 2026-08-26. |
| [#111](https://github.com/ZhannaM85/my-money/issues/111) | ✅ Done | Allow user to navigate the chart timeline (pan) | Visible ← → arrows + drag; All disables pan. Validated on-device 2026-08-26. Controls below chart → #120. |
| [#120](https://github.com/ZhannaM85/my-money/issues/120) | ✅ Done | Place chart range / pan / zoom controls under each graph | Follow-up to #111: controls strip below the chart on Dashboard / History / asset details. Validated on-device 2026-08-27. |
| [#112](https://github.com/ZhannaM85/my-money/issues/112) | ✅ Done | Dashboard Positions should follow the selected chart day | Chart selection drives Positions and As of. Validated on-device 2026-08-27. |
| [#116](https://github.com/ZhannaM85/my-money/issues/116) | ✅ Done | Pinch zoom in/out on every chart | Follow-up to #54/#114: pinch on all line charts; tooltip dismiss so pinch can zoom. Validated on-device 2026-08-27. |
| [#108](https://github.com/ZhannaM85/my-money/issues/108) | ✅ Done | Allocation ignores All / Original and shows everything in EUR | Native Class/Type rows per currency (e.g. Money · RUB). Validated on-device 2026-08-27. Share % from converted base → #121. |

## Tier 14 — Live feedback (2026-08-27)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#121](https://github.com/ZhannaM85/my-money/issues/121) | ✅ Done | Allocation share percentages should convert to one base, not compare raw native amounts | Native row amounts; All-mode share % uses hidden RUB (not leftover Settings EUR). Validated on-device 2026-08-27. |
| [#122](https://github.com/ZhannaM85/my-money/issues/122) | ✅ Done | Allocation Class and Currency rows should expand to show assets | Tap a Class or Currency slice to list assets. Validated on-device 2026-08-27. Type expand → #123. |
| [#123](https://github.com/ZhannaM85/my-money/issues/123) | ✅ Done | Allocation Type rows should expand to show assets | Follow-up to #122: Type rows expand to assets (e.g. Cash · USD). Validated on-device 2026-08-27. |
| [#124](https://github.com/ZhannaM85/my-money/issues/124) | ✅ Done | Show Positions total for the selected As of date | Total under Positions for As of day. Validated on-device 2026-08-27. |
| [#125](https://github.com/ZhannaM85/my-money/issues/125) | ✅ Done | Add a Today button next to Dashboard As of | Turtle-style Today beside As of. Validated on-device 2026-08-27. |
| [#126](https://github.com/ZhannaM85/my-money/issues/126) | ✅ Done | Let user pick chart range: week, month, year, all, custom | Week / Month / Year / All / Custom chips; Custom From/To; zoom skips Custom. Validated on-device 2026-08-27. |

## Tier 15 — Live feedback (2026-08-29)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#127](https://github.com/ZhannaM85/my-money/issues/127) | ✅ Done | No automatic GEL→RUB conversion despite NBG rates | NBG already used for RUB via GEL (#47); GEL pickers from #107; GEL→RUB = invert of RUB row (quantity applied). Validated on-device 2026-08-29. |
| [#128](https://github.com/ZhannaM85/my-money/issues/128) | ✅ Done | Chart tooltip closes when scrolling its holdings list | Page scroll should still dismiss (#77); inner tooltip scroll should not. Follow-ups #130–#132. Validated on-device 2026-08-29. |
| [#129](https://github.com/ZhannaM85/my-money/issues/129) | ✅ Done | Show original amount in muted text under converted values on asset details | Dashboard Positions already show native under converted; asset history does not. Validated on-device 2026-08-29. |
| [#130](https://github.com/ZhannaM85/my-money/issues/130) | ❌ Won't fix | Chart tooltip does not close when tapping away | Canceled 2026-08-29; overlay dropped in favor of #133. |
| [#131](https://github.com/ZhannaM85/my-money/issues/131) | ❌ Won't fix | Chart tooltip is hidden behind the tab bar | Canceled 2026-08-29; overlay dropped in favor of #133. |
| [#132](https://github.com/ZhannaM85/my-money/issues/132) | ❌ Won't fix | Chart tooltip flickers open then closed on tap | Canceled 2026-08-29; overlay dropped in favor of #133. |
| [#133](https://github.com/ZhannaM85/my-money/issues/133) | ❌ Won't fix | Remove chart holdings tooltip; it duplicates the list above the graph | Closed 2026-08-29 as won't fix. Positions moved below the chart (#134); tooltip restored (#135). |
| [#134](https://github.com/ZhannaM85/my-money/issues/134) | ✅ Done | Move Dashboard Positions below the net-worth chart | List currently sits above the graph and can push it off-screen. As of stays with the chart. Validated on-device 2026-08-29. |
| [#135](https://github.com/ZhannaM85/my-money/issues/135) | ✅ Done | Restore Dashboard chart holdings tooltip now that Positions are below the graph | Same simple popover as History. No pin / dismiss-on-scroll. Validated on-device 2026-08-29. |
| [#136](https://github.com/ZhannaM85/my-money/issues/136) | ✅ Done | Asset details chart tooltip: show original amount in muted grey under converted | Same idea as #129 history rows. Converted mode only; skip when native is already base. Validated on-device 2026-08-29. |
| [#137](https://github.com/ZhannaM85/my-money/issues/137) | ✅ Done | Compare holdings across selected dates (table page) | Add to comparison beside As of; banner after 2+ dates; table page. Layout follow-up #138. Validated on-device 2026-08-29. |
| [#138](https://github.com/ZhannaM85/my-money/issues/138) | ✅ Done | Comparison table: narrow name column, wrap titles, show two date columns | Follow-up to #137. First column overlaps date values on a phone. Validated on-device 2026-08-29. |
| [#139](https://github.com/ZhannaM85/my-money/issues/139) | ✅ Done | Comparison: only date columns scroll horizontally; name column stays fixed | Names outside the scroller; only date columns scroll. Related #138, #84. Validated on-device 2026-08-29. |
| [#140](https://github.com/ZhannaM85/my-money/issues/140) | ✅ Done | Confirm before removing a date from comparison | X on a date column removes immediately; need Cancel/Confirm. Follow-up to #137. Validated on-device 2026-08-29. |
| [#141](https://github.com/ZhannaM85/my-money/issues/141) | ✅ Done | Chart: toggle to show or hide the holdings tooltip | Tooltip can cover the whole plot. User-controlled; persist; day tap still selects (#112). Validated on-device 2026-08-29. |
| [#142](https://github.com/ZhannaM85/my-money/issues/142) | ✅ Done | Comparison dates disappear on page refresh | Store was session-only (#137). Persist on device. Validated on-device 2026-08-29. |
| [#143](https://github.com/ZhannaM85/my-money/issues/143) | ✅ Done | Comparison: remove-all control to clear every date | Only per-column X today. Confirm then clear the set. Follow-up to #137 / #140. Validated on-device 2026-08-29. |
| [#144](https://github.com/ZhannaM85/my-money/issues/144) | ✅ Done | Asset chart X-axis spaces snapshot dates evenly, not by calendar time | All range: May→Aug looks as close as Dec 8→21. Category axis, one point per snapshot. Validated on-device 2026-08-30. |
| [#145](https://github.com/ZhannaM85/my-money/issues/145) | ✅ Done | Show no-data warning instead of the chart when As of has no holdings | As of 2022-12-31 shows 0,00 ₽ but All chart still plots later history. Validated on-device 2026-08-30. |

## Tier 16 — Live feedback (2026-08-30)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#149](https://github.com/ZhannaM85/my-money/issues/149) | ✅ Done | Quick add: House chip on Add asset | Type `house` already exists. Chip missing next to Apartment (screenshot: Квартира circled). Validated on-device 2026-08-30. |
| [#151](https://github.com/ZhannaM85/my-money/issues/151) | ✅ Done | Show ownership share on Positions so partial-share prices are not confusing | Screenshot: Домик Сосново / Квартира Ручьи. Share already stored (#28); lists omit it. Validated on-device 2026-08-30. Full-share property → #152. |
| [#152](https://github.com/ZhannaM85/my-money/issues/152) | ✅ Done | Show Your share: 1/1 on property when ownership is full | Follow-up to #151. Positions: apartment with 100% stake has no share line next to 1/2 neighbors. Validated on-device 2026-08-30. |
| [#153](https://github.com/ZhannaM85/my-money/issues/153) | ✅ Done | Assets: wrap filter chips instead of a horizontal scrollbar | One scrolling chip row; wrap to multiple rows. Custom order / Reorder stay as they are. Validated on-device 2026-08-30. |
| [#148](https://github.com/ZhannaM85/my-money/issues/148) | ✅ Done | Dashboard-hidden assets stay in Positions in a disabled state | Row stays, greyed/muted. Depends on #146. Validated on-device 2026-08-30. |
| [#146](https://github.com/ZhannaM85/my-money/issues/146) | ✅ Done | Dashboard Positions: tap row to reveal Hide (not swipe) | Originally swipe left; scroll stole the gesture. Shipped as tap (#154), same as Allocation #150. Hide sets excluded, not archive. Validated on-device 2026-08-30. |
| [#147](https://github.com/ZhannaM85/my-money/issues/147) | ✅ Done | Exclude dashboard-hidden assets from totals and the chart | Drop hidden values from header, Positions total, chart, Allocation. Depends on #146. Prefer excluded (#30). Validated on-device 2026-08-30. |
| [#154](https://github.com/ZhannaM85/my-money/issues/154) | ✅ Done | Dashboard Positions: tap row to reveal Hide (same as Allocation) | Shipped click instead of #146 swipe (scroll stole swipe). Match Allocation #150 tap-to-reveal. Validated on-device 2026-08-30. |
| [#155](https://github.com/ZhannaM85/my-money/issues/155) | ✅ Done | Allocation: hidden assets vanish when they were the last in a slice | Hide all Property → class gone. Keep greyed so Show still works. Totals stay excluded. Dashboard persist → #156. Validated on-device 2026-08-30. |
| [#156](https://github.com/ZhannaM85/my-money/issues/156) | ✅ Done | Dashboard: keep hidden assets in Positions (disabled) after hide from Allocation | Same keep-visible-disabled as #155; must stick on Dashboard after navigation/reload. Related #148. Validated on-device 2026-08-30. |
| [#150](https://github.com/ZhannaM85/my-money/issues/150) | ✅ Done | Allocation: hide/exclude assets and drop them from comparison | Tap expanded holding to reveal Hide (swipe fought page scroll). Omit from comparison. Last-in-slice vanish → #155. Multi-tap → #157. Validated on-device 2026-08-30. |
| [#159](https://github.com/ZhannaM85/my-money/issues/159) | ✅ Done | Show action should be green (Hide stays red) | SwipeRevealRow uses destructive red for both. Show = restore, should be green. Validated on-device 2026-08-30. |
| [#158](https://github.com/ZhannaM85/my-money/issues/158) | ✅ Done | Assets list: Hide/Show like Dashboard Positions | Option 2: ⋮ overflow with Hide/Show, tap still opens details. Excluded rows greyed. `excluded`, not archive. Validated on-device 2026-08-30. |
| [#160](https://github.com/ZhannaM85/my-money/issues/160) | ✅ Done | Assets list: show excluded assets at the bottom | Included first; excluded after, still sorted within the group. Archived stays on its chip. Validated on-device 2026-08-30. |
| [#161](https://github.com/ZhannaM85/my-money/issues/161) | ✅ Done | FX debug: save log as a .txt file | Copy is too big for Telegram/email. Download/share `my-money-debug.txt`. Validated on-device 2026-08-30. |
| [#157](https://github.com/ZhannaM85/my-money/issues/157) | ✅ Done | Allocation: Show/Hide needs three or four taps (Dashboard is one tap) | Device log: pointerdown without click after Hide. Reveal now on pointerup. Validated on-device 2026-08-30. |

## Tier 17 — Live feedback (2026-08-31)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#174](https://github.com/ZhannaM85/my-money/issues/174) | ✅ Done | Comparison table: green/red arrows and delta vs first date | Later columns vs earliest date; delta under converted amount. Validated on-device 2026-08-31. |
| [#175](https://github.com/ZhannaM85/my-money/issues/175) | ✅ Done | Update page: shared As of date for bulk snapshots | Header date, default today; Save writes all rows on that day. Validated on-device 2026-08-31. |
| [#176](https://github.com/ZhannaM85/my-money/issues/176) | ✅ Done | Update: existing As of amount is read-only with edit icon | Snapshot on that date → read-only + pencil; missing → input. Validated on-device 2026-08-31. |
| [#177](https://github.com/ZhannaM85/my-money/issues/177) | ✅ Done | Comparison: edit a cell amount (inline preferred, not any-click) | Empty dash (e.g. BOG-GEL 5 Jan). Pencil, not whole-cell tap. Prefer inline over navigate. Related #176. Validated on-device 2026-08-31. |
| [#178](https://github.com/ZhannaM85/my-money/issues/178) | ✅ Done | Update header: description wraps beside the As of date | Hint is a full-width row under title + As of, not in the leftover column. Validated on-device 2026-08-31. |
| [#179](https://github.com/ZhannaM85/my-money/issues/179) | ✅ Done | Update page: reorder holdings via icon (toggle save) | Same custom order as Assets. Icon on → grips; icon again saves. Suggested now is a badge. Validated on-device 2026-08-31. |
| [#180](https://github.com/ZhannaM85/my-money/issues/180) | ✅ Done | Update: pre-fill from snapshot before As of, not latest | Placeholder + No change use last amount strictly before As of. Validated on-device 2026-08-31. |
| [#181](https://github.com/ZhannaM85/my-money/issues/181) | ✅ Done | Update: stay on same As of in view mode after Save | No Dashboard hop. Same date; just-saved amounts read-only + pencil (#176). Validated on-device 2026-08-31. |
| [#182](https://github.com/ZhannaM85/my-money/issues/182) | ✅ Done | Comparison: date columns clip amounts; width should follow the number | Columns size to content; extra width scrolls (#139). Validated on-device 2026-08-31. |
| [#183](https://github.com/ZhannaM85/my-money/issues/183) | ✅ Done | Update: show a Save icon on the reorder toggle while reordering | Idle = list icon; reordering = Save. Same toggle as #179. Validated on-device 2026-08-31. |
| [#184](https://github.com/ZhannaM85/my-money/issues/184) | ✅ Done | Update: show institution under the holding title | Under the name when set; last-updated on the next line. Match #109. Validated on-device 2026-08-31. |
| [#185](https://github.com/ZhannaM85/my-money/issues/185) | ✅ Done | Dashboard: keep chart range when leaving and returning | Persist chip + Custom From/To (localStorage, like Comparison). Related #126. Validated on-device 2026-08-31. |

## Tier 18 — Live feedback (2026-09-01)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#187](https://github.com/ZhannaM85/my-money/issues/187) | ✅ Done | CI: History snapshot-day test fails when Month window excludes 1 Aug | Deploy of #186. Month is 30 days; on 2026-09-01, 1 Aug is outside the default range. Validated in CI 2026-09-01. Follow-up: #188. |
| [#186](https://github.com/ZhannaM85/my-money/issues/186) | ✅ Done | Dashboard: Update rates button does nothing | Screenshot: Сводка Converted/RUB, **Обновить курсы** circled. Tap has no spinner, toast, error, or quote change. Validated on-device 2026-09-02. Follow-up: #188. |
| [#188](https://github.com/ZhannaM85/my-money/issues/188) | ✅ Done | Dashboard: larger Update rates button and last-updated time | Follow-up to #186. Screenshot: **Обновить курсы** still a short pill; **Курсы обновлены** has no timestamp. Validated on-device 2026-09-02. |

## Tier 19 — Live feedback (2026-09-02)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#197](https://github.com/ZhannaM85/my-money/issues/197) | ✅ Done | Delete all data on this device | One-tap wipe behind confirm. Makes Import JSON available without deleting each asset. Related #198. Validated on-device 2026-09-03. |
| [#189](https://github.com/ZhannaM85/my-money/issues/189) | ✅ Done | History: calendar view of days with manual snapshots | List \| Calendar; v1 marks snapshot days only. Validated on-device 2026-09-03. Follow-up: #205. |
| [#191](https://github.com/ZhannaM85/my-money/issues/191) | ✅ Done | Update: keep As of date visible while scrolling holdings | Title + As of pinned; holdings list scrolls. Update only. Validated on-device 2026-09-03. |
| [#192](https://github.com/ZhannaM85/my-money/issues/192) | ✅ Done | Update: show the date the suggested amount comes from | Prefill is last snapshot before As of (#180); calendar date shown on the row. Validated on-device 2026-09-03. |
| [#193](https://github.com/ZhannaM85/my-money/issues/193) | ✅ Done | Update: after save, show green/red delta vs previous snapshot date | Comparison arrows vs last snapshot before As of. Validated on-device 2026-09-03. Follow-up: #206. |
| [#195](https://github.com/ZhannaM85/my-money/issues/195) | ✅ Done | Android: Dashboard Zoom out (Уменьшить) is clipped at the right edge | Toolbar wraps; same strip on History and details. Validated on-device 2026-09-03. |
| [#196](https://github.com/ZhannaM85/my-money/issues/196) | ✅ Done | Android: conversion unavailable needs an on-device FX debugger, not a silent fallback | Tap badge → FX debug log with pair+date+window. No invented rate. Validated on-device 2026-09-03. |

## Tier 20 — Live feedback (2026-09-03)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#201](https://github.com/ZhannaM85/my-money/issues/201) | ✅ Done | Update: remove the No changes (Без изменений) button | Button does nothing useful. Drop copy that tells people to tap it. Related #200. Validated on-device 2026-09-03. |
| [#202](https://github.com/ZhannaM85/my-money/issues/202) | ✅ Done | Update: show excluded holdings so their valuation can still change | Hidden from totals, still on Update. Archived unchanged. Validated on-device 2026-09-03. |
| [#204](https://github.com/ZhannaM85/my-money/issues/204) | ✅ Done | Update: enable Save updates only when an amount has been typed | Disabled until a field has a typed amount. Unblocks #200. Validated on-device 2026-09-03. |
| [#203](https://github.com/ZhannaM85/my-money/issues/203) | ✅ Done | Update: scroll to top stops once Save updates is on screen | PTR ignored inner list scroll; swipe up reloaded. Related #191 / #39. Validated on-device 2026-09-03. |
| [#200](https://github.com/ZhannaM85/my-money/issues/200) | ✅ Done | Update: save only non-empty fields; do not block save when fields are empty | On-device: Save no-op if nothing typed. Enable-when-dirty is #204. Validated on-device 2026-09-03. |
| [#205](https://github.com/ZhannaM85/my-money/issues/205) | ✅ Done | History calendar: tap a date to show that day's snapshot entries | Follow-up to #189. Tap dot-date → show entries. Validated on-device 2026-09-03. Follow-up: #209. |
| [#207](https://github.com/ZhannaM85/my-money/issues/207) | ✅ Done | Dashboard: keep As of date visible while scrolling | Pin As of row while chart + Positions scroll. Validated on-device 2026-09-03. |
| [#206](https://github.com/ZhannaM85/my-money/issues/206) | ✅ Done | Update: show green/red delta while editing amount | Live up/down vs previous snapshot while typing; extends #193. Validated on-device 2026-09-03. |
| [#208](https://github.com/ZhannaM85/my-money/issues/208) | ✅ Done | Dashboard Positions shows 0 after today's Update save | Today Positions now use latest holdings, not stale chart range end. Validated on-device 2026-09-03. |
| [#210](https://github.com/ZhannaM85/my-money/issues/210) | ✅ Done | Dashboard chart can stay stuck before today until All is selected | Week/Month/Year default to today; `rangeEndPinned` after pan. Validated on-device 2026-09-03. |
| [#211](https://github.com/ZhannaM85/my-money/issues/211) | ✅ Done | Android: JSON backup export also saves a stray .txt file | Capacitor Share passes `files` only; no stray filename `.txt`. Validated on-device 2026-09-03. |

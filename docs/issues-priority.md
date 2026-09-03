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
| [#194](https://github.com/ZhannaM85/my-money/issues/194) | 🔍 Pending validation | JSON backup omits FX rates so restored today total does not match | **Blocker.** v2 include fxRates + manualFxRates. CSV notes. |
| [#189](https://github.com/ZhannaM85/my-money/issues/189) | 🔍 Pending validation | History: calendar view of days with manual snapshots | List \| Calendar; v1 marks snapshot days only. |
| [#190](https://github.com/ZhannaM85/my-money/issues/190) | 🔍 Pending validation | Android: home-screen glance widget behind a Settings toggle | Off by default. 2×2 net worth + as-of. Provider disabled until on. |
| [#191](https://github.com/ZhannaM85/my-money/issues/191) | 🔍 Pending validation | Update: keep As of date visible while scrolling holdings | Title + As of pinned; holdings list scrolls. Update only. |
| [#192](https://github.com/ZhannaM85/my-money/issues/192) | 🔍 Pending validation | Update: show the date the suggested amount comes from | Prefill is last snapshot before As of (#180); calendar date shown on the row. |
| [#193](https://github.com/ZhannaM85/my-money/issues/193) | 🔍 Pending validation | Update: after save, show green/red delta vs previous snapshot date | Comparison arrows vs last snapshot before As of. |
| [#195](https://github.com/ZhannaM85/my-money/issues/195) | 🔍 Pending validation | Android: Dashboard Zoom out (Уменьшить) is clipped at the right edge | Toolbar wraps; same strip on History and details. |
| [#196](https://github.com/ZhannaM85/my-money/issues/196) | 🔍 Pending validation | Android: conversion unavailable needs an on-device FX debugger, not a silent fallback | Tap badge → FX debug log with pair+date+window. No invented rate. |
| [#198](https://github.com/ZhannaM85/my-money/issues/198) | 🔍 Pending validation | JSON import should replace a non-empty book after confirm | Screenshot: Import JSON greyed out. Confirm then replace, not merge. CSV stays merge. Related #197. |
| [#197](https://github.com/ZhannaM85/my-money/issues/197) | 🔍 Pending validation | Delete all data on this device | One-tap wipe behind confirm. Makes Import JSON available without deleting each asset. Related #198. |

---

## Tier 20 — Live feedback (2026-09-03)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#200](https://github.com/ZhannaM85/my-money/issues/200) | 🔍 Pending validation | Update: save only non-empty fields; do not block save when fields are empty | Empty rows skipped, not snapshotted. All-empty is a no-op. Related #201. |
| [#203](https://github.com/ZhannaM85/my-money/issues/203) | 🔍 Pending validation | Update: scroll to top stops once Save updates is on screen | PTR ignored inner list scroll; swipe up reloaded. Related #191 / #39. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

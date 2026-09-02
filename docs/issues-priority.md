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
| [#162](https://github.com/ZhannaM85/my-money/issues/162) | 🔍 Pending validation | Adopt Capacitor to wrap the app for native iOS/Android builds | Shared foundation. Native `/` base, not GitHub Pages `/my-money/`. |
| [#163](https://github.com/ZhannaM85/my-money/issues/163) | 🔍 Pending validation | Generate iOS/Android icon and splash-screen assets | Reuse PWA mark. Blocks both store listings. |
| [#166](https://github.com/ZhannaM85/my-money/issues/166) | 🔍 Pending validation | Native status bar / safe-area / system theming pass (iOS + Android) | Depends on #162. |
| [#165](https://github.com/ZhannaM85/my-money/issues/165) | 🔍 Pending validation | Android: hardware/gesture back-button navigation handling | Depends on #162. |
| [#169](https://github.com/ZhannaM85/my-money/issues/169) | 🔍 Pending validation | Native: backup and CSV export/import via share sheet | `<a download>` often fails in WebView. Depends on #162. |
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
| [#189](https://github.com/ZhannaM85/my-money/issues/189) | 🔲 Open | History: calendar view of days with manual snapshots | List \| Calendar toggle on History (Turtle pattern). v1: mark snapshot days only. Extra markers later. |
| [#190](https://github.com/ZhannaM85/my-money/issues/190) | 🔲 Open | Android: home-screen glance widget behind a Settings toggle | Turtle 2×2 pattern. Off by default. Content not settled — starter: net worth + as-of. Depends on #162. |
| [#191](https://github.com/ZhannaM85/my-money/issues/191) | 🔲 Open | Update: keep As of date visible while scrolling holdings | Sticky or pin header outside the list. Update only; other dates later. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

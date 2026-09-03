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
| [#209](https://github.com/ZhannaM85/my-money/issues/209) | 🔍 Pending validation | History: shared expand/collapse day row on List and Calendar | Calendar now reuses the exact List row data, including daily delta and formatting. |
| [#212](https://github.com/ZhannaM85/my-money/issues/212) | 🔲 Open | Dashboard: collapse title while keeping As of date sticky | Title + description scroll away; date row stays pinned. Follow-up to #207. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

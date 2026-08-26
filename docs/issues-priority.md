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

## Tier 13 — Live feedback (2026-08-26)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#108](https://github.com/ZhannaM85/my-money/issues/108) | 🔲 Open | Allocation ignores All / Original and shows everything in EUR | Device 2026-08-26: Class/Type still show € (blurb “compared in EUR”). Prior Playwright proof was wrong (empty Class, no Type). Export offered. |
| [#112](https://github.com/ZhannaM85/my-money/issues/112) | 🔲 Open | Dashboard Positions should follow the selected chart day | Device 2026-08-26: tooltip 2026-08-13 vs Positions on 2026-08-22. Chart selection must drive Positions (+ sync As of). |
| [#116](https://github.com/ZhannaM85/my-money/issues/116) | 🔲 Open | Pinch zoom in/out on every chart | Device 2026-08-26: cannot validate — tooltip covers the graph when trying to pinch zoom in. |
| [#120](https://github.com/ZhannaM85/my-money/issues/120) | 🔲 Open | Place chart range / pan / zoom controls under each graph | Follow-up to #111: move controls strip below the chart (not above). |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

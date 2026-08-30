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

## Tier 16 — Live feedback (2026-08-30)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#157](https://github.com/ZhannaM85/my-money/issues/157) | 🔲 Open | Allocation: Show/Hide needs three or four taps (Dashboard is one tap) | Still 3 taps on device after first fix. Tap log via Settings FX debug (Copy). Related #150 / #154. |
| [#158](https://github.com/ZhannaM85/my-money/issues/158) | 🔲 Open | Assets list: Hide/Show like Dashboard Positions | Row is a link to details — same first-tap reveal would steal open. Discuss shape before implementing. |
| [#159](https://github.com/ZhannaM85/my-money/issues/159) | 🔲 Open | Show action should be green (Hide stays red) | SwipeRevealRow uses destructive red for both. Show = restore, should be green. |
| [#160](https://github.com/ZhannaM85/my-money/issues/160) | 🔲 Open | Assets list: show excluded assets at the bottom | Included first; excluded after, still sorted within the group. Archived stays on its chip. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

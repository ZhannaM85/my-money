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

## Tier 15 — Live feedback (2026-08-29)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#133](https://github.com/ZhannaM85/my-money/issues/133) | 🔍 Pending validation | Remove chart holdings tooltip; it duplicates the list above the graph | **Superseded on Dashboard by #135** after Positions moved below (#134). History / asset details already kept the popover. |
| [#134](https://github.com/ZhannaM85/my-money/issues/134) | 🔍 Pending validation | Move Dashboard Positions below the net-worth chart | List currently sits above the graph and can push it off-screen. As of stays with the chart. |
| [#135](https://github.com/ZhannaM85/my-money/issues/135) | 🔍 Pending validation | Restore Dashboard chart holdings tooltip now that Positions are below the graph | Same simple popover as History. No pin / dismiss-on-scroll. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

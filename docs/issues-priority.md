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
| [#146](https://github.com/ZhannaM85/my-money/issues/146) | 🔍 Pending validation | Dashboard Positions: swipe left to reveal Hide | Slide left on a Positions card → Hide CTA; after hide, swipe → Show. Not archive (#31). |
| [#148](https://github.com/ZhannaM85/my-money/issues/148) | 🔍 Pending validation | Dashboard-hidden assets stay in Positions in a disabled state | Row stays, greyed/muted. Depends on #146. |
| [#147](https://github.com/ZhannaM85/my-money/issues/147) | 🔍 Pending validation | Exclude dashboard-hidden assets from totals and the chart | Drop hidden values from header, Positions total, chart, Allocation. Depends on #146. Prefer excluded (#30). |
| [#149](https://github.com/ZhannaM85/my-money/issues/149) | 🔍 Pending validation | Quick add: House chip on Add asset | Type `house` already exists. Chip missing next to Apartment (screenshot: Квартира circled). |
| [#150](https://github.com/ZhannaM85/my-money/issues/150) | 🔍 Pending validation | Allocation: hide/exclude assets and drop them from comparison | Same hide as #146–#148 on Распределение; omit from comparison rows/totals. |
| [#151](https://github.com/ZhannaM85/my-money/issues/151) | 🔍 Pending validation | Show ownership share on Positions so partial-share prices are not confusing | Screenshot: Домик Сосново / Квартира Ручьи. Share already stored (#28); lists omit it. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

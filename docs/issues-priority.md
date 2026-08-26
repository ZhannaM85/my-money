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
| [#107](https://github.com/ZhannaM85/my-money/issues/107) | 🔲 Open | Add support for GEL (Georgian Lari) | Currency picker (Add asset) has no GEL. Include in `BASE_CURRENCIES` + FX for Converted. NBG already used via GEL for RUB (#47). |
| [#108](https://github.com/ZhannaM85/my-money/issues/108) | 🔲 Open | Allocation ignores All / Original and shows everything in EUR | Settings All + Original; Allocation Class/Currency/Type still € (RUB/USD rows labeled native, amounts in €). Sibling of #42/#46/#96 for Allocation. |
| [#109](https://github.com/ZhannaM85/my-money/issues/109) | 🔲 Open | Show institution on Assets subtitle and Dashboard holdings second row | Assets: type · institution on muted second row. Dashboard holdings: institution under name, muted; omit if empty. Follow-up to #102. |
| [#110](https://github.com/ZhannaM85/my-money/issues/110) | 🔲 Open | Do not allow negative Y-axis when chart values are non-negative | Asset details chart pads below 0 (−7 тыс.) though snapshots are positive. Clamp floor to 0 when data ≥ 0. |
| [#111](https://github.com/ZhannaM85/my-money/issues/111) | 🔲 Open | Allow user to navigate the chart timeline (pan) | Zoom exists (#41/#54); add horizontal pan to shift the visible date window. Clamp to available history. |
| [#112](https://github.com/ZhannaM85/my-money/issues/112) | 🔲 Open | Dashboard Positions should follow the selected chart day | Chart tooltip is historical; Positions stay on latest and do not match the tooltip total. Sync list to selected day. |
| [#113](https://github.com/ZhannaM85/my-money/issues/113) | 🔲 Open | Loading Dashboard takes a long time | Slow open on device (seen offline / Original+All). Prefer local-first; skip unused FX work; avoid offline timeouts. |
| [#114](https://github.com/ZhannaM85/my-money/issues/114) | 🔲 Open | Pinch zoom does not work on asset details chart | Dashboard has #54; asset details chart ignores pinch. Wire same zoom gesture / shared helper. |
| [#115](https://github.com/ZhannaM85/my-money/issues/115) | 🔲 Open | Warn on duplicate snapshot (same date and amount) without blocking | Soft warn when date+sum match an existing row; allow save anyway. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

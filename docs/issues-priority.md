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

## Tier 9 — Live feedback (2026-08-18)

_EUR base + RUB assets; iPhone tab bar; appearance; car; joint ownership; decimals; exclude/hide/delete; input formatting._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#25](https://github.com/ZhannaM85/my-money/issues/25) | 🔲 Open | Tab bar disconnects from the bottom on iPhone Safari | Still jumps on History scroll vs Turtle (IMG_0348 vs IMG_0349). Visual-viewport pin is not Turtle’s still footer. Keyboard hide is #80. |

---

## Tier 12 — Live feedback (2026-08-22)

_Existing-asset details: no dated history, and Save is a no-op when viewing._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#87](https://github.com/ZhannaM85/my-money/issues/87) | 🔍 Pending validation | All currencies selected but EUR still shown | Converted Dashboard shows the base currency in the filter, not All. Original + All unchanged. |
| [#90](https://github.com/ZhannaM85/my-money/issues/90) | 🔍 Pending validation | History 3M change is last two snapshot days, not three months | 3M uses the 90-day window when data exists; if history is shorter, the label is “since first snapshot”. Related #79, #89. |
| [#91](https://github.com/ZhannaM85/my-money/issues/91) | 🔍 Pending validation | Tab bar floats mid-screen after bringing the app back from background | Re-reads visualViewport on resume (visibility/pageshow/focus). Related #25, #80. |
| [#92](https://github.com/ZhannaM85/my-money/issues/92) | 🔍 Pending validation | Chart holdings popover clips the last row and cannot scroll | Taller popover (`70svh` / 32rem) with inner overflow-y-scroll and a visible scrollbar. Related #77. |
| [#93](https://github.com/ZhannaM85/my-money/issues/93) | 🔍 Pending validation | Rate editor shows 1 RUB = 119474 USD | Rate fields use parseRate (many decimals), not money parseAmount. Related #45. |
| [#94](https://github.com/ZhannaM85/my-money/issues/94) | 🔍 Pending validation | Settings: root-cause log for shipped issues, like the changelog | Sibling of Release notes. Skip #19/#20 until they ship. |
| [#95](https://github.com/ZhannaM85/my-money/issues/95) | 🔍 Pending validation | Date field is too narrow; expand width by 1.5 | DateField is 1.5× Turtle `w-36` (`w-[13.5rem]`). Related #84. |
| [#96](https://github.com/ZhannaM85/my-money/issues/96) | 🔍 Pending validation | History shows EUR when All currencies is selected | Original / All uses native totals on History, not leftover baseCurrency. Related #87. |
| [#97](https://github.com/ZhannaM85/my-money/issues/97) | 🔲 Open | Add optional comments on asset entries and show them in History | Note on snapshots; show on History, asset details, and other applicable surfaces. |
| [#98](https://github.com/ZhannaM85/my-money/issues/98) | 🔍 Pending validation | Fresh and Neutral appearance moods look the same | Neutral is slate charcoal primary; Fresh stays design-system blue. Related #78, #57. |
| [#99](https://github.com/ZhannaM85/my-money/issues/99) | 🔍 Pending validation | Add bank card / debit card as a Money type | Money type `debit_card` (EN/RU). Distinct from liability credit card. |
| [#100](https://github.com/ZhannaM85/my-money/issues/100) | 🔲 Open | Sort Assets by name or amount, and allow drag-and-drop order | List is IndexedDB id order today. Name/amount asc/desc + persisted drag order. |
| [#101](https://github.com/ZhannaM85/my-money/issues/101) | 🔲 Open | Add regression tests so phone bugs are caught in CI, not only on device | Vitest exists; live-feedback bugs often had no failing test first. Tie RCAs (#94) to regression tests. |
| [#102](https://github.com/ZhannaM85/my-money/issues/102) | 🔲 Open | Show institution name in the asset details sub-header next to currency | Today: type · RUB. Include optional institution before or after currency. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

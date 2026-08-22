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
| [#25](https://github.com/ZhannaM85/my-money/issues/25) | 🔲 Open | Tab bar disconnects from the bottom on iPhone Safari | Still intermittent. Hide-on-viewport-shrink is now itself a problem — see #80 / `IMG_0318.MP4`. |

---

## Tier 12 — Live feedback (2026-08-22)

_Existing-asset details: no dated history, and Save is a no-op when viewing._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#68](https://github.com/ZhannaM85/my-money/issues/68) | 🔲 Open | Date input is broken in the PWA | Reopened: date field still wider than the card when adding an asset (Safari/PWA). Picker overlay did not fix width. Related #82, #84. |
| [#69](https://github.com/ZhannaM85/my-money/issues/69) | 🔍 Pending validation | Show assets distribution on Dashboard when currency is All | Reverted dashboard donut. Currency totals expand to holdings. Allocation page unchanged. |
| [#77](https://github.com/ZhannaM85/my-money/issues/77) | 🔍 Pending validation | Dashboard chart tooltip stays visible while scrolling | Scroll and touchmove dismiss the Recharts tooltip; tap the chart again to show it. |
| [#78](https://github.com/ZhannaM85/my-money/issues/78) | 🔲 Open | Adopt the My Money design system as the default UI | **Do not change existing moods.** Add a new mood named Fresh or Trendy from `docs/DESIGN_SYSTEM.md`, then make that the applied default. |
| [#79](https://github.com/ZhannaM85/my-money/issues/79) | 🔍 Pending validation | History list shows every calendar day, not only days the user added | List is snapshot days only. Chart still uses the daily series. |
| [#80](https://github.com/ZhannaM85/my-money/issues/80) | 🔲 Open | Tab bar hides on scroll and can reappear mid-page | Also on asset details: bar sits mid-page over history; Update this asset is below it. Related #25. |
| [#81](https://github.com/ZhannaM85/my-money/issues/81) | 🔲 Open | Dashboard and History show different net worth totals | Same day Converted ₽: Dashboard 2,810,175.64 vs History 2,798,217.19. |
| [#82](https://github.com/ZhannaM85/my-money/issues/82) | 🔲 Open | Update-this-asset inputs overflow the phone screen | Date field and Save are clipped on the right. History/Details rows fit. |
| [#83](https://github.com/ZhannaM85/my-money/issues/83) | 🔍 Pending validation | No way to change currency when editing a past snapshot | Snapshot editor now has a currency select; save persists it on that row. |
| [#84](https://github.com/ZhannaM85/my-money/issues/84) | 🔲 Open | Safari date fields overflow the card when editing snapshots | Reopened: #84 clamp **widened the whole page** to the date field. Must copy Turtle date inputs (#47 `w-36`, TodayScreen `max-w-48` / WebKit). Do not ignore Turtle. Related #68, #82. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

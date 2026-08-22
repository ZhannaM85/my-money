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
| [#25](https://github.com/ZhannaM85/my-money/issues/25) | 🔍 Pending validation | Tab bar disconnects from the bottom on iPhone Safari | Pins `fixed` tab bar to the visual viewport. Keyboard still hides it (#80). |

---

## Tier 12 — Live feedback (2026-08-22)

_Existing-asset details: no dated history, and Save is a no-op when viewing._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#68](https://github.com/ZhannaM85/my-money/issues/68) | 🔍 Pending validation | Date input is broken in the PWA | Add-asset As of uses Turtle `w-36` DateField (#84). Picker overlay kept. |
| [#69](https://github.com/ZhannaM85/my-money/issues/69) | 🔍 Pending validation | Show assets distribution on Dashboard when currency is All | Reverted dashboard donut. Currency totals expand to holdings. Allocation page unchanged. |
| [#77](https://github.com/ZhannaM85/my-money/issues/77) | 🔍 Pending validation | Dashboard chart tooltip stays visible while scrolling | Scroll and touchmove dismiss the Recharts tooltip; tap the chart again to show it. |
| [#78](https://github.com/ZhannaM85/my-money/issues/78) | 🔍 Pending validation | Adopt the My Money design system as the default UI | New **Fresh** mood from `docs/DESIGN_SYSTEM.md`; default for new installs. Existing moods untouched. |
| [#79](https://github.com/ZhannaM85/my-money/issues/79) | 🔍 Pending validation | History list shows every calendar day, not only days the user added | List is snapshot days only. Chart still uses the daily series. |
| [#80](https://github.com/ZhannaM85/my-money/issues/80) | 🔍 Pending validation | Tab bar hides on scroll and can reappear mid-page | No longer hides when the visual viewport shrinks. Keyboard focus still hides it. Pin-to-bottom is #25. |
| [#81](https://github.com/ZhannaM85/my-money/issues/81) | 🔍 Pending validation | Dashboard and History show different net worth totals | Dashboard Converted headline is today’s historicalNetWorth point (same as History). |
| [#82](https://github.com/ZhannaM85/my-money/issues/82) | 🔍 Pending validation | Update-this-asset inputs overflow the phone screen | Amount and Save stack full-width. Date field width is #84. |
| [#83](https://github.com/ZhannaM85/my-money/issues/83) | 🔍 Pending validation | No way to change currency when editing a past snapshot | Snapshot editor now has a currency select; save persists it on that row. |
| [#84](https://github.com/ZhannaM85/my-money/issues/84) | 🔍 Pending validation | Safari date fields overflow the card when editing snapshots | Copied Turtle #47: DateField is `h-12 w-36`, not a max-width/overflow clamp. Related #68, #82. |
| [#85](https://github.com/ZhannaM85/my-money/issues/85) | 🔍 Pending validation | Dashboard month change has no breakdown (cash exchange looks like a 61k loss) | Tappable hint plus expand From amounts / From rates by holding. Magnitude is #86. |
| [#86](https://github.com/ZhannaM85/my-money/issues/86) | 🔍 Pending validation | Dashboard this-month change includes FX on existing dollars (~61k instead of ~6k) | StatCard “this month” uses From amounts. From rates stays visible (#88). |
| [#87](https://github.com/ZhannaM85/my-money/issues/87) | 🔍 Pending validation | All currencies selected but EUR still shown | Converted Dashboard shows the base currency in the filter, not All. Original + All unchanged. |
| [#88](https://github.com/ZhannaM85/my-money/issues/88) | 🔍 Pending validation | Show amount change vs rate change on Dashboard (FX drop visible before a cash exchange) | Converted shows From amounts / From rates plus Update rates (fetch only). Related #85, #86. |
| [#89](https://github.com/ZhannaM85/my-money/issues/89) | 🔲 Open | Dashboard and History show different period deltas | Same total 2,748,283.82 ₽. Dashboard «за этот месяц» −49,933.36 (amounts); History «за 3М» −61,891.82 (amounts+rates). Related #81, #86. |
| [#90](https://github.com/ZhannaM85/my-money/issues/90) | 🔲 Open | History 3M change is last two snapshot days, not three months | −61,891.82 ₽ за 3М equals 2026-08-22 vs 2026-08-17. Chart axis also 17–22 авг. Related #79, #89. |
| [#91](https://github.com/ZhannaM85/my-money/issues/91) | 🔲 Open | Tab bar floats mid-screen after bringing the app back from background | iPhone: bar overlaps Dashboard chart after resume. Related #25, #80. |
| [#92](https://github.com/ZhannaM85/my-money/issues/92) | 🔍 Pending validation | Chart holdings popover clips the last row and cannot scroll | Taller popover (`70svh` / 32rem) with inner overflow-y-scroll and a visible scrollbar. Related #77. |
| [#93](https://github.com/ZhannaM85/my-money/issues/93) | 🔍 Pending validation | Rate editor shows 1 RUB = 119474 USD | Rate fields use parseRate (many decimals), not money parseAmount. Related #45. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

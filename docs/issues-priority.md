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
| [#108](https://github.com/ZhannaM85/my-money/issues/108) | 🔲 Open | Allocation ignores All / Original and shows everything in EUR | Device 2026-08-26: Class/Type still show leftover € in Original+All. Currency alone is not enough. Screenshot proof process → #118. |
| [#111](https://github.com/ZhannaM85/my-money/issues/111) | 🔲 Open | Allow user to navigate the chart timeline (pan) | Device 2026-08-26: need visible ← → arrows (not drag-only). All currently disables pan. |
| [#112](https://github.com/ZhannaM85/my-money/issues/112) | 🔲 Open | Dashboard Positions should follow the selected chart day | Device 2026-08-26: Positions stay on latest while tooltip is historical. Must match tooltip amounts; show selected date in Positions header. Date field → #117. |
| [#116](https://github.com/ZhannaM85/my-money/issues/116) | 🔍 Pending validation | Pinch zoom in/out on every chart | Required `onZoomIn`/`onZoomOut`; History zoom buttons + pinch; call-site guard. |
| [#117](https://github.com/ZhannaM85/my-money/issues/117) | 🔲 Open | Dashboard date input to choose which day Positions show | Separate from #112: As of date field drives Positions / header; sync with chart selection. |
| [#118](https://github.com/ZhannaM85/my-money/issues/118) | 🔲 Open | Attach Playwright screenshots to GitHub issues as proof before validation | Capture key screens after a fix; attach to the issue before `validation`. Reduce reopen churn. |
| [#119](https://github.com/ZhannaM85/my-money/issues/119) | 🔍 Pending validation | Show soft warnings (e.g. duplicate snapshot) in light orange | Follow-up to #115: `text-warning` / `--warning` token instead of muted gray. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

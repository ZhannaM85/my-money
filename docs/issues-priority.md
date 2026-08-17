# Issues Priority List

Active work queue only (open, pending validation, not started, partial). Closed history lives in [`docs/issues-priority-archive/`](./issues-priority-archive/README.md).

Work top-to-bottom within each tier; dependencies are noted where order matters. When an issue is confirmed done, move its row to the archive.

The **initial backlog (Tiers 1–7)** is the planned implementation sequence from `PROJECT_BRIEF.md`, filed at project start — same shape as turtle-steps' original Phase 1/2 epics, not a same-day live-feedback split. Later live-feedback filings on a given calendar day append to that day's tier (see `docs/AGENT_WORKFLOW.md`).

Prototype checkpoint after Tier 5: the four flows in `PROJECT_BRIEF.md` §25 (onboarding, dashboard, update, asset details) should feel good before native platforms.

---

## Tier 1 — Architecture foundation (Phase 1)

_Scaffolding, domain model, and persistence. Everything downstream depends on this._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#1](https://github.com/ZhannaM85/my-money/issues/1) | 🔍 Pending validation | Epic 0 — Project scaffolding & tooling | Vite + React 19 + TS strict + Tailwind/shadcn + Vitest. Empty shell only. `npm test` / `lint` / `build` clean. |
| [#2](https://github.com/ZhannaM85/my-money/issues/2) | 🔍 Pending validation | Epic 1 — Domain model & persistence layer | Dexie `my-money` DB. Pure `netWorth` / historical FX. 16 tests. |

---

## Tier 2 — Design system & app shell

_Shared primitives and routing skeleton before any real feature screen._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#3](https://github.com/ZhannaM85/my-money/issues/3) | 🔍 Pending validation | Epic 2 — Design system & app shell | Primitives + bottom nav + empty route screens. |

---

## Tier 3 — First vertical slice

_Base currency → create assets → first net worth. This is prototype Flow 1. Single-currency is enough; FX can still be identity rates._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#4](https://github.com/ZhannaM85/my-money/issues/4) | 🔍 Pending validation | Epic 3 — Settings: base currency and preferences | IndexedDB settings + Zustand. Changing currency does not rewrite snapshots. |
| [#5](https://github.com/ZhannaM85/my-money/issues/5) | 🔍 Pending validation | Epic 4 — Assets: create, edit, archive, tracking | List + filters + form. Archive keeps snapshots. |
| [#6](https://github.com/ZhannaM85/my-money/issues/6) | 🔍 Pending validation | Epic 5 — Onboarding: first assets to first net worth | Currency → first asset → Dashboard net worth. Skip via welcome or Settings. Does not reappear once a book exists. |

---

## Tier 4 — Data safety & deployment (pulled forward)

_Once real balances exist (Tier 3), IndexedDB is the only copy — backup and a real deployed build should not wait until the end of the queue. Same pull-forward as turtle-steps Epic 8/9._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#13](https://github.com/ZhannaM85/my-money/issues/13) | 🔍 Pending validation | Epic 12 — JSON export and import | Version 1 bundle. Restore into an empty book only. Entry point on Settings. |
| [#14](https://github.com/ZhannaM85/my-money/issues/14) | 🔍 Pending validation | Epic 13 — GitHub Pages deployment | CI on push/PR. Deploy workflow on `main`. Live: https://zhannam85.github.io/my-money/ |

---

## Tier 5 — Core product (prototype flows 2–4)

_FX, then the remaining three prototype flows, plus allocation and history. Order matters: FX before converted totals and historical series._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#7](https://github.com/ZhannaM85/my-money/issues/7) | 🔍 Pending validation | Epic 6 — FX rates via Frankfurter | Cached historical quotes. RUB is not in the ECB set. Converted figures labeled as estimates. |
| [#8](https://github.com/ZhannaM85/my-money/issues/8) | 🔍 Pending validation | Epic 7 — Dashboard | Net worth, this-month change, line chart, class totals. |
| [#9](https://github.com/ZhannaM85/my-money/issues/9) | 🔍 Pending validation | Epic 8 — Quick update flow | Native amounts. No change writes a same-amount snapshot. Yearly/manual shown, not nagged. |
| [#10](https://github.com/ZhannaM85/my-money/issues/10) | 🔍 Pending validation | Epic 9 — Asset details | Native/base toggle, history chart + list, in-place amount update. FX-vs-value split left for later. |
| [#11](https://github.com/ZhannaM85/my-money/issues/11) | 🔍 Pending validation | Epic 10 — Allocation screen | Own route `/allocation` from More + Dashboard. Not a 6th tab. Donut uses abs size; legend shows signed amounts. |
| [#12](https://github.com/ZhannaM85/my-money/issues/12) | 🔍 Pending validation | Epic 11 — History: net worth over time | Range chips 1M–All. Historical FX per date. Asset/liability filters left as follow-up. |

---

## Tier 6 — Completeness

_CSV, PWA, i18n, accessibility. Any order after Tier 5, except CSV should not precede JSON (#13)._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#15](https://github.com/ZhannaM85/my-money/issues/15) | 🔲 Open | Epic 14 — CSV export and import | Mapping flow; JSON remains the backup. |
| [#16](https://github.com/ZhannaM85/my-money/issues/16) | 🔲 Open | Epic 15 — PWA installability | Offline-tolerant (cached FX); Capacitor-compatible. |
| [#17](https://github.com/ZhannaM85/my-money/issues/17) | 🔲 Open | Epic 16 — Localization (English and Russian) | Typed dictionary; backup field names stay English. |
| [#18](https://github.com/ZhannaM85/my-money/issues/18) | 🔲 Open | Epic 17 — Accessibility and responsive QA pass | Sweep only — a11y is still required on each earlier epic as it ships. |

---

## Tier 7 — Native platforms

_After the four web flows feel good. Android wraps this app; iOS does not._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#19](https://github.com/ZhannaM85/my-money/issues/19) | 🔲 Open | Epic 18 — Android via Capacitor | Wrap, don’t rewrite. Store listing can be child issues later. |
| [#20](https://github.com/ZhannaM85/my-money/issues/20) | 🔲 Open | Epic 19 — Native iOS app (Swift / SwiftUI) | Tracking epic. Requires a Mac. Split into children when scheduled. Shares JSON schema with #13. |

---

## Tier 8 — Branding (2026-08-17)

_User supplied light and dark logo marks. Blocked on #1 (no `public/` yet). Tiny favicons should crop to the circular **M**; full lockup is for larger icons._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#21](https://github.com/ZhannaM85/my-money/issues/21) | 🔍 Pending validation | Use light and dark My Money marks as favicons | Source: `docs/branding/logo-light.png` + `logo-dark.png`. `prefers-color-scheme`. Tiny sizes are a center crop of the **M**. |
| [#22](https://github.com/ZhannaM85/my-money/issues/22) | 🔲 Open | Tab favicon is clipped; generate tiny sizes from the 192px marks | Tab still shows the full lockup. Use `public/icon-light-192.png` + `icon-dark-192.png`. Pad the circular **M**. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

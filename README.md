# My Money

A private, local-first personal balance sheet. Add what you own and owe — bank
accounts, investments, cash, property, valuables, loans — see everything in one
base currency, and watch how the picture changes over time.

No bank connections. No accounts. No budgeting. Manual updates are the point,
and they have to be fast.

> **Know what you own. In one currency. Over time.**

## Status

The web app is deployed on GitHub Pages, and Android and iOS builds use the
Capacitor wrapper. Product data stays on the device; there is no backend or
account system. Public pages for the store listing do not require a book:
welcome, support, and privacy.

**Repo:** [github.com/ZhannaM85/my-money](https://github.com/ZhannaM85/my-money)

**Live app:** [zhannam85.github.io/my-money](https://zhannam85.github.io/my-money/)

**Welcome:** [zhannam85.github.io/my-money/welcome](https://zhannam85.github.io/my-money/welcome) —
App Store Developer Website page: what My Money is, links to privacy and
support, and the author line (Zhanna M.).

**Support:** [zhannam85.github.io/my-money/support](https://zhannam85.github.io/my-money/support) —
contact email and a short FAQ (App Store Support URL). Also linked from
More → About.

**Privacy:** [zhannam85.github.io/my-money/privacy](https://zhannam85.github.io/my-money/privacy)

Start at [`docs/issues-priority.md`](docs/issues-priority.md).

## What it does

- Track assets and liabilities across categories and currencies, with asset
  details, editable dated snapshots, and included, excluded, or archived status.
- End a holding on a chosen day and keep earlier history. From that day it
  leaves the active list, the Dashboard total, and Positions; it stays under
  Hidden, and the removal can be undone. Assets uses the same As of control as
  Dashboard, so a past day shows the list and total as they were, including
  holdings that were removed later.
- Convert everything into a user-chosen base currency (Frankfurter online for non-RUB/GEL, live NBG for RUB with static RUB as the offline fallback, optional manual overrides). See [`docs/FX.md`](docs/FX.md).
- Keep dated balance history per asset and use historical exchange rates when
  calculating past net worth.
- Review net worth, holdings, allocation, and changes over time; compare selected
  dates and inspect the holdings behind each total. Dashboard Positions can use
  a compact density, and zero-balance holdings stay at the end of the list.
  Allocation keeps Dashboard highlighted in the tab bar and shows a breadcrumb
  back to Dashboard or More.
- Update many balances together, with suggested values based on update frequency
  and a quick way to keep an unchanged value.
- Choose base-currency or native-currency display, English or Russian, and a
  visual theme. On Android, an optional home-screen widget shows net worth and
  its as-of date.
- Keep data on-device in IndexedDB. Export or restore a JSON backup, or move
  snapshot rows with CSV. JSON restore replaces the local book after
  confirmation; CSV imports append matching rows. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Platforms

| Platform | Approach |
|---|---|
| Web / PWA | React + TypeScript + Vite |
| Android | Same web app, wrapped with Capacitor |
| iOS | Same web app, wrapped with Capacitor (Xcode/TestFlight still need a Mac) |

## Tech stack

- React 19 + TypeScript (strict) + Vite
- Tailwind CSS + shadcn/ui
- IndexedDB via Dexie, behind repository interfaces (see `docs/ARCHITECTURE.md`)
- Zustand for UI/session state
- Zod for backup and FX payload validation
- Recharts for net-worth history
- Vitest + React Testing Library
- English and Russian localization

## Development

```bash
npm install
npm run dev      # start the dev server
npm run test     # run the test suite
npm run lint     # lint
npm run build    # typecheck + production web build
npm run cap:sync # web build (base /) + copy into android/ and ios/
```

The project requires Node.js 22. `npm run build` runs the TypeScript build
check before producing the web bundle.

Native device steps: [`docs/native-app-device-testing.md`](docs/native-app-device-testing.md).

## More

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the codebase is structured and why.
- [`docs/FX.md`](docs/FX.md) — real FX pipeline (Frankfurter, live NBG for RUB, static RUB, manual).
- [`docs/native-app-device-testing.md`](docs/native-app-device-testing.md) — Android/iOS debug installs.
- [`docs/issues-priority.md`](docs/issues-priority.md) — the work queue, in order.
- [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) — the original product brief.
- [`docs/mocks/`](docs/mocks/) — starting UI mocks (can change).

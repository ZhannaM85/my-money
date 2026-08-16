# Pocket Balance

A private, local-first personal balance sheet. Add what you own and owe — bank
accounts, investments, cash, property, valuables, loans — see everything in one
base currency, and watch how the picture changes over time.

No bank connections. No accounts. No budgeting. Manual updates are the point,
and they have to be fast.

> **Know what you own. In one currency. Over time.**

## Status

Greenfield. Architecture and the initial GitHub backlog are in place; the app
itself is not scaffolded yet. Start at
[`docs/issues-priority.md`](docs/issues-priority.md).

## What it will do

- Track assets and liabilities across categories and currencies.
- Convert everything into a user-chosen base currency (Frankfurter / ECB rates).
- Keep a snapshot history per asset, including historical FX.
- Show net worth, allocation, and change over time.
- Make a full-picture update take under a minute (previous value + “no change”).
- Stay on-device (IndexedDB). Export/import is the backup.

## Platforms

| Platform | Approach |
|---|---|
| Web / PWA | React + TypeScript + Vite |
| Android | Same web app, wrapped with Capacitor |
| iOS | Native Swift / SwiftUI, sharing the data model and export format |

## Tech stack (planned)

- React 19 + TypeScript (strict) + Vite
- Tailwind CSS + shadcn/ui
- IndexedDB via Dexie, behind repository interfaces (see `docs/ARCHITECTURE.md`)
- Zustand for UI/session state
- React Hook Form + Zod
- Recharts
- Vitest + React Testing Library
- English and Russian localization

## More

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the codebase is structured and why.
- [`docs/issues-priority.md`](docs/issues-priority.md) — the work queue, in order.
- [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) — the original product brief.
- [`docs/mocks/`](docs/mocks/) — starting UI mocks (can change).

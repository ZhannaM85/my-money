# Pocket Balance — Project Brief

**Repo:** `pocket-balance`  
**Positioning:** Know what you own. In one currency. Over time.

Architecture lives in `docs/ARCHITECTURE.md`. The work queue lives in `docs/issues-priority.md`. Screen mocks live in `docs/mocks/`.

The original product brief follows. Implementation is sequenced as GitHub issues, not as a single-pass build.

---

# Personal Wealth Tracker — Project Brief

## 1. Product Summary

A privacy-first personal wealth tracking application that gives users a single, clear view of everything they own and owe.

The user manually adds assets and liabilities — bank accounts, investments, cash, property, vehicles, jewelry, crypto, loans, etc. The application converts everything into the user's preferred base currency and tracks how their financial position changes over time.

The product deliberately does **not** require bank connections in its initial version.

### Core promise

> **Know what you own. In one currency. Over time.**

The application is not primarily a budgeting or expense-tracking tool. It is a personal balance sheet and net-worth tracker.

---

## 2. Problem

People often have money and assets spread across many places:

- multiple bank accounts;
- different currencies;
- investment and brokerage accounts;
- cash;
- crypto;
- property;
- cars;
- jewelry and other valuables;
- loans and other liabilities.

Existing personal-finance applications often focus on transactions, budgeting, spending categories, or automatic bank aggregation.

There is an opportunity for a simpler product focused on one question:

> **What is my total financial position right now, and how has it changed?**

The main challenge is that without bank integrations, updating balances can become tedious.

Therefore, the product must make manual updating extremely fast and low-friction.

---

## 3. Target User

The primary user is someone who:

- has multiple financial accounts or asset types;
- uses more than one currency;
- wants to understand their overall net worth;
- does not necessarily want detailed expense tracking;
- is comfortable manually updating balances;
- values privacy and does not want to connect bank accounts;
- wants historical information about their financial position.

The initial product should target relatively financially organized users rather than trying to serve everyone.

---

## 4. Product Principles

### 4.1 Privacy first

Financial data should remain on the user's devices whenever possible.

The MVP should not require:

- bank passwords;
- bank integrations;
- transaction data;
- a financial institution connection;
- a backend containing the user's complete financial history.

The product can communicate with external services for non-sensitive information such as currency exchange rates.

### 4.2 Simplicity over completeness

The goal is not to recreate a bank, accounting system, or Bloomberg terminal.

The user should be able to understand their financial position within seconds.

### 4.3 Manual does not mean tedious

Manual data entry is an intentional privacy choice, but the UX must make it extremely fast.

Updating 5–10 assets should ideally take less than a minute.

### 4.4 History is a first-class feature

The application should not only answer:

> How much do I have today?

It should answer:

> How much did I have six months ago?

> Which assets grew?

> Which assets decreased?

> How much of the change came from FX?

---

## 5. Core Concepts

### Assets

#### Money

- Bank account
- Savings account
- Cash
- Deposit

#### Investments

- Brokerage account
- Stocks
- ETF
- Bonds
- Crypto
- Other investments

#### Property

- Apartment
- House
- Land
- Vehicle

#### Valuables

- Jewelry
- Watches
- Electronics
- Collectibles
- Other valuables

### Liabilities

- Mortgage
- Personal loan
- Credit card debt
- Other debt

---

## 6. Net Worth

The primary metric is:

> **Net Worth = Total Assets − Total Liabilities**

The user chooses a base currency.

---

## 7. Multi-Currency Support

Every asset has its own currency.

The application converts all values into the user's selected base currency.

The user can change their base currency at any time.

### FX Provider

The initial implementation should use a public currency-rate API such as **Frankfurter**, preferably using ECB reference rates where appropriate.

Requirements:

- current rates;
- historical rates;
- no API key for the MVP if the selected provider supports this;
- support for multiple currencies;
- ability to retrieve historical rates for historical snapshots.

The displayed converted value is an estimate based on reference exchange rates, not necessarily the amount the user would receive in an actual currency exchange.

---

## 8. Historical Snapshots

Every balance update creates a snapshot.

The application can then display:

- balance history;
- percentage change;
- absolute change;
- historical value in original currency;
- historical value in base currency.

Historical FX rates should be applied based on the snapshot date rather than today's exchange rate.

---

## 9. Asset Details

Every asset has its own detail page showing current value, performance, and history.

The user should be able to switch between:

- Original currency
- Base currency

For currency-sensitive assets, the product may distinguish between:

- change in underlying asset value;
- FX impact.

---

## 10. Asset Valuation

Not every asset has an objective market price.

For assets such as jewelry, cars, property, and collectibles, the user can enter an estimated current value.

The asset may optionally contain:

- purchase price;
- current estimated value;
- valuation date;
- valuation method (My estimate / Recent appraisal / Market price / Purchase price).

The application should clearly distinguish estimated values from precise account balances.

---

## 11. Asset Tracking Toggle

Users must be able to enable or disable tracking for individual assets.

Disabling tracking must **not delete historical data**.

Possible states:

### Included

The asset contributes to current net worth.

### Excluded

The asset and history are retained but it does not contribute to current net worth.

### Archived

The asset is no longer part of the active asset list.

---

## 12. Dashboard

The Dashboard is the main screen.

### Primary information

**Net Worth** and current-period change.

### Asset allocation

- Bank accounts
- Investments
- Cash
- Property
- Other

### Net worth chart

A historical line chart showing the user's total net worth.

### Recent changes

Category-level and FX impact, kept visually simple.

---

## 13. Quick Update Flow

This is one of the most important UX features.

Instead of opening every asset individually, the user selects **Update finances**. The application shows all tracked assets with their previous values. Assets that have not changed can be marked **No change**.

The goal is to update an entire financial picture in approximately 30–60 seconds.

---

## 14. Update Frequency

Each asset may have an optional update frequency:

- Weekly
- Monthly
- Yearly
- Manual only

The application should avoid unnecessarily asking users to update assets that rarely change.

---

## 15. Import / Export

### Export

- JSON
- CSV

Potential later feature: PDF financial report.

### Import

Users should be able to import CSV data with a generic mapping flow (date, asset, amount, currency).

---

## 16. Privacy & Data Architecture

The preferred architecture is **local-first**.

### MVP

User data is stored locally.

Potential technologies:

- IndexedDB for web/PWA;
- local storage for lightweight settings;
- native local persistence on iOS;
- encrypted local storage where appropriate.

The application should not require an account for the initial version.

External network communication should primarily be limited to currency exchange rates.

### Future

If synchronization becomes necessary, a secure cloud-sync architecture can be introduced later. Cloud synchronization should not be required to validate the product concept.

---

## 17. Platform Strategy

The product will support three platforms.

### Web / PWA

- React
- TypeScript
- PWA
- Capacitor-compatible architecture

### Android

- React
- TypeScript
- Capacitor

### iOS

- Native iOS application
- Swift / SwiftUI

The three implementations should share the same:

- product model;
- UX principles;
- terminology;
- calculations;
- data model;
- import/export format.

The UI may be adapted to platform conventions rather than being pixel-identical.

---

## 18. Suggested Technical Architecture

### Shared conceptual model

```text
User
 ├── Settings
 │    ├── baseCurrency
 │    └── preferences
 │
 ├── Assets
 │    ├── Asset
 │    └── AssetSnapshot[]
 │
 └── Liabilities
      ├── Liability
      └── LiabilitySnapshot[]
```

Net worth is calculated rather than stored as a primary value.

```text
Net Worth =
    Σ tracked asset values
    −
    Σ tracked liability values
```

Historical net worth is calculated using the relevant historical FX rate.

---

## 19. MVP Scope

The first version should include:

### Dashboard

- current net worth;
- asset allocation;
- net worth history;
- current-period change.

### Assets

- create asset;
- edit asset;
- delete/archive asset;
- enable/disable tracking;
- asset categories;
- multiple currencies.

### Liabilities

- create liability;
- track balance;
- include/exclude from net worth.

### Updates

- quick update flow;
- no-change action;
- historical snapshots.

### Asset Details

- current value;
- historical graph;
- original/base currency toggle;
- change over time.

### Currency

- base currency;
- current FX rates;
- historical FX rates.

### Data

- local persistence;
- JSON export/import;
- CSV export/import.

### Platforms

- responsive web app;
- PWA;
- Android via Capacitor;
- native iOS application.

---

## 20. Explicitly Out of Scope for MVP

Do not build these initially:

- direct bank integrations;
- Open Banking;
- transaction tracking;
- budgeting;
- expense categorization;
- investment recommendations;
- financial advice;
- automatic property valuation;
- automatic jewelry valuation;
- portfolio trading;
- tax calculations;
- social features;
- AI financial advisor;
- complex retirement planning.

The purpose of the MVP is to validate the core behavior:

> **Will users regularly update their balances in exchange for having a clear historical picture of their wealth?**

---

## 21. Potential Future Features

If the core product proves useful:

- Automatic integrations (Open Banking, brokerage APIs, crypto APIs)
- Smart valuation (property, vehicles, watches/jewelry, investment price feeds)
- Goals (e.g. buy house — progress against net worth)
- Financial insights
- Reports (monthly/yearly snapshots)
- Cloud synchronization (optional encrypted sync)

---

## 22. Key Product Metrics

The most important metric is not downloads. It is:

> **Weekly active users who successfully update at least one asset.**

The most important UX metric:

> **Time required to update the complete financial picture.**

Target: **< 60 seconds**

---

## 23. Product Positioning

The application should not position itself primarily as a budgeting app, an investment tracker, or a bank aggregator.

Instead:

> **A private personal balance sheet.**

> **Know what you own. In one currency. Over time.**

---

## 24. Competitive Position

Existing products such as Kubera, Empower, Monarch, Copilot, getquin, and Portfolio Performance demonstrate that there is an established market for net-worth and wealth tracking.

The differentiation should not be trying to match their breadth.

The product should focus on:

1. **Privacy**
2. **Manual-first simplicity**
3. **All asset types**
4. **Excellent multi-currency support**
5. **Historical asset-level tracking**
6. **Extremely fast periodic updates**
7. **Local-first architecture**
8. **Cross-platform availability**

---

## 25. First Prototype

The first prototype should focus on only four flows:

### Flow 1 — Onboarding

Create first assets → select base currency → see first net worth.

### Flow 2 — Dashboard

See net worth → allocation → historical graph.

### Flow 3 — Update

Update all assets quickly → save snapshots → see change.

### Flow 4 — Asset details

Open one asset → see historical graph → switch currencies → update value.

If these four flows feel good, the project has a strong foundation.

---

## 26. Success Criteria for the Pet Project

The project is worth continuing if, after using it personally for several weeks, the following statement feels true:

> **“I actually want to open this every week to see how my financial position changed.”**

---

## 27. Working Product Concept

**Category:** Personal wealth / net-worth tracker

**Platforms:** Web, PWA, Android, native iOS

**Primary technology:** React + TypeScript + Capacitor

**iOS:** Native Swift / SwiftUI

**Data strategy:** Local-first

**Primary external service:** FX rates

**Core object:** Asset + historical snapshots

**Core metric:** Net worth

**Core interaction:** Fast periodic balance update

**Core differentiator:** Private, simple, multi-currency personal balance sheet

---

## 28. Implementation notes for this repo

- Do not generate the entire application in a single pass.
- File and work GitHub issues one coherent unit at a time (see `docs/AGENT_WORKFLOW.md`).
- `domain/` must stay free of React, Zustand, and Dexie.
- Liabilities are the same persistence shape as assets (one `Asset` entity with an asset class of `liabilities`) so net-worth math, snapshots, FX, and export stay on one path.
- Net worth is always calculated, never stored as a primary row.
- Screen mocks in `docs/mocks/` are a starting point and may change.

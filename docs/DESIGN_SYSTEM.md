# My Money — Design System

## Design Direction

My Money is a calm, private, modern fintech application.

The interface should feel:
- Private
- Simple
- Trustworthy
- Modern
- Calm
- Premium without feeling expensive or exclusive

The application is a personal financial balance sheet, not a banking dashboard, accounting system, trading terminal, or budgeting application.

### Visual inspiration

Apple Health × modern fintech × Linear.

### Avoid

- Flashy crypto aesthetics
- Excessive gradients
- Excessive shadows
- Dense accounting-style interfaces
- Heavy borders
- Large decorative illustrations inside normal screens
- Excessive use of color
- Multiple competing accent colors
- Traditional banking visual patterns
- Dark dashboards filled with neon colors

### Core principle

> **Color should communicate, not decorate.**

The logo may be colorful. The application UI should remain calm and restrained.

---

## Brand Identity

**Product:** My Money

**Primary tagline:** See the whole picture.

**Alternative tagline:** All your money. In one place.

The product icon uses a circular arrangement of asset/currency symbols around an `M`.

Use the full colorful logo on landing pages, splash screens, onboarding, and marketing material. Use a simplified version for the app icon because detailed labels are not readable at small sizes.

---

## Color System

### Brand

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#142B4A` | Brand, primary headings, important text |
| `--color-primary-dark` | `#0B1D33` | Strong headings, pressed states |
| `--color-primary-light` | `#EAF2FF` | Selected backgrounds, subtle emphasis |
| `--color-action` | `#2878E8` | Primary actions, links, interactive elements |
| `--color-action-hover` | `#1F68D0` | Hover state |
| `--color-action-pressed` | `#1959B8` | Pressed state |

Use **navy for identity** and **blue for interaction**.

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `--color-positive` | `#16A878` | Positive changes, growth, active states |
| `--color-negative` | `#E05252` | Negative changes, liabilities, destructive actions |
| `--color-warning` | `#F2A51A` | Warnings, attention |
| `--color-info` | `#2878E8` | Informational states |

Positive financial movement uses `--color-positive`; negative movement uses `--color-negative`; neutral values use primary text.

Do not use red simply because an asset decreased if the UI is not communicating a problem.

---

## Asset Category Colors

| Category | Color | Token |
|---|---|---|
| Bank accounts | `#2878E8` | `--asset-bank` |
| Investments | `#16A878` | `--asset-investments` |
| Cash | `#F2A51A` | `--asset-cash` |
| Property | `#7656D6` | `--asset-property` |
| Vehicles | `#20B89A` | `--asset-vehicles` |
| Valuables | `#A45BC7` | `--asset-valuables` |
| Crypto | `#F7931A` | `--asset-crypto` |
| Other | `#667085` | `--asset-other` |
| Liabilities | `#E05252` | `--asset-liabilities` |

Use category colors for icons, allocation charts, small indicators, and badges. Do not color entire cards.

---

## Currency Colors

Use currency colors sparingly, primarily for icons or small indicators.

| Currency | Color |
|---|---|
| EUR | `#2878E8` |
| USD | `#3B82F6` |
| GBP | `#7656D6` |
| RUB | `#7656D6` |
| BTC | `#F7931A` |
| USDT | `#26A17B` |

Currency colors never override semantic colors. A negative USD change is still shown using the negative color.

---

## Light Theme

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#F8F9FB` | Application background |
| `--surface` | `#FFFFFF` | Cards, sheets, navigation |
| `--surface-elevated` | `#FFFFFF` | Modals, popovers |
| `--border` | `#E4E8EE` | Standard borders |
| `--border-subtle` | `#EEF1F5` | Subtle separators |

---

## Dark Theme

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#0B1422` | Application background |
| `--surface` | `#142235` | Cards |
| `--surface-elevated` | `#1B2C43` | Modals and elevated surfaces |
| `--border` | `#29394E` | Borders |
| `--text-primary` | `#F4F7FB` | Main text |
| `--text-secondary` | `#A9B5C5` | Secondary text |
| `--text-tertiary` | `#7F8DA0` | Metadata |
| `--action` | `#4B91F5` | Primary actions |
| `--positive` | `#35C79A` | Positive values |
| `--negative` | `#F06A6A` | Negative values |
| `--warning` | `#F5B63D` | Warnings |
| `--purple` | `#9277E8` | Category accent |
| `--teal` | `#35CBAA` | Category accent |

Keep dark mode calm. Avoid neon effects.

---

## Typography

Use a clean modern sans-serif.

Preferred:
1. System font
2. Inter
3. SF Pro on native Apple platforms

### Hierarchy

**Display number**
- Weight: 600
- Large
- Tight letter spacing
- Primary text color

**Page heading**
- Weight: 600
- 24–28px

**Section heading**
- Weight: 600
- 18–20px

**Asset name**
- Weight: 500–600
- 15–16px

**Secondary information**
- Weight: 400
- 13–14px
- Secondary text color

**Metadata**
- Weight: 400
- 12–13px
- Tertiary text color

---

## Text Colors

### Light mode

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#17243A` | Main text |
| `--text-secondary` | `#667085` | Secondary information |
| `--text-tertiary` | `#98A2B3` | Metadata |
| `--text-disabled` | `#B8C0CC` | Disabled content |

Use no more than three text levels on a normal screen: primary, secondary, tertiary.

---

## Spacing

Use a 4px base unit:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`

Typical usage:
- Icon/text gap: 8px
- Small card padding: 12px
- Standard card padding: 16px
- Section spacing: 24px
- Major section spacing: 32px
- Page horizontal padding: 16–24px

Avoid arbitrary spacing values.

---

## Border Radius

| Element | Radius |
|---|---:|
| Small controls | 8px |
| Buttons | 10–12px |
| Inputs | 10–12px |
| Cards | 16px |
| Large feature cards | 20px |
| Bottom sheets | 20–24px |
| Circular elements | 50% |

Cards should feel soft but not excessively rounded.

---

## Shadows

Use shadows very sparingly.

Light theme example:

`0 2px 8px rgba(20, 43, 74, 0.06)`

Use shadows mainly for floating buttons, modals, popovers, and elevated sheets. Standard cards should preferably use a subtle border instead.

---

## Buttons

### Primary

- Background: `--color-action`
- Text: white
- Use for the main action on a screen

Examples:
- Update balances
- Add asset
- Save changes

### Secondary

- Background: `--surface`
- Text: `--text-primary`
- Border: `--border`

Examples:
- Cancel
- Edit
- View details

### Destructive

- Background: `--color-negative`
- Use only for destructive actions such as Delete asset

Do not use destructive styling for normal negative financial changes.

---

## Inputs

Light theme:

- Background: `#FFFFFF`
- Border: `#E4E8EE`
- Text: `#17243A`

Focus border:

`#2878E8`

Error border:

`#E05252`

Avoid excessive input decoration.

---

## Toggles

For asset tracking:

**Enabled:** `--color-positive`

**Disabled:** `#CBD2DC`

Meaning:
- Green = active/included
- Gray = inactive/excluded

Do not use blue for tracking status.

---

## Cards

Standard card:

```text
background: var(--surface)
border: 1px solid var(--border)
border-radius: 16px
padding: 16px
```

Cards provide structure, not decoration.

Avoid thick colored borders, large gradients, excessive shadows, and colored backgrounds for entire asset cards.

Use a small category icon or indicator instead.

---

## Dashboard

Prioritize:

1. Net worth
2. Change
3. Net worth history
4. Asset overview
5. Recent changes

Example:

```text
Net worth
€73,100

↑ €2,450 · 3.47% this month

[ Net worth chart ]

Assets overview

Bank accounts          €21,450
Investments            €35,200
Cash                    €9,250
Property               €12,500
Liabilities            −€5,300
```

The main number should visually dominate the screen.

---

## Charts

### Net Worth

Primary color: `--color-positive`

The main net-worth chart should normally use emerald, with a very subtle area fill.

Avoid:
- rainbow charts;
- excessive gradients;
- 3D charts;
- heavy grid lines.

Grid: `--border-subtle`

Axis labels: `--text-tertiary`

### Asset History

Use the asset category color.

### Currency Comparison

When showing original vs base currency:
- primary series: asset/category color;
- secondary series: neutral blue/gray.

Do not use red/green to distinguish currencies.

---

## Allocation Charts

Use the asset category palette consistently.

If Investments is green on the Dashboard, it must remain green in allocation, asset lists, asset details, charts, and filters.

---

## Navigation

Bottom navigation should be restrained.

- Active: `--color-primary`
- Inactive: `--text-tertiary`
- Central add/update action: `--color-action`

Example:

```text
Dashboard    Assets       +       History    More
```

Do not use different colors for each navigation item.

---

## Icons

Use simple outline or softly rounded icons.

- Neutral actions: `--text-secondary`
- Asset icons: asset category color
- Status: semantic colors

Avoid mixing multiple icon styles.

---

## Asset Icons

| Asset | Icon |
|---|---|
| Bank account | Bank |
| Savings | Wallet |
| Cash | Coins |
| Investment | Trending up |
| Crypto | Bitcoin |
| Property | House |
| Vehicle | Car |
| Jewelry | Gem |
| Loan | Credit card / receipt |
| Other | Layers / box |

Icons should remain recognizable at small sizes.

---

## Financial Value Formatting

Format monetary values according to the user's selected locale and currency.

Examples:

`€73,100`

`$20,000`

`£12,500`

`₽500,000`

Use compact formatting only when space is limited:

`€127K`

`$1.2M`

Never mix formatting conventions within the same screen.

---

## Estimated Values

Estimated values should not use warning colors.

Example:

```text
Apartment
€125,000
Estimated
```

Use the normal primary value with a small tertiary `Estimated` label.

---

## Privacy Messaging

Preferred:

> **Your financial data stays on your device.**

> **No bank connections required.**

> **You control what is tracked.**

Avoid alarmist language. The product should feel trustworthy rather than paranoid.

---

## Empty States

Example:

> **Your financial picture starts here.**

> Add your first asset to see your net worth.

Primary action:

> **Add asset**

Avoid generic “No data” messages.

---

## Loading States

Use subtle skeletons or progress indicators.

Do not use large animated loaders unless necessary.

For FX rates:

> Updating exchange rates…

Keep the UI usable while rates are loading where possible.

---

## Error States

Errors should be concise and actionable.

Preferred:

> **Couldn't update exchange rates.**

> Your existing rates will be used for now.

> **Try again**

Do not use red for an entire page unless the situation is genuinely critical.

---

## Motion

Motion should be subtle.

Recommended:
- 150–250ms for small transitions;
- smooth chart transitions;
- gentle card state changes;
- subtle button feedback.

Avoid bouncing, particle effects, large page transitions, and decorative animations.

A financial application should feel stable.

---

## Responsive Design

Support:
- iPhone
- Android phones
- tablets
- desktop browsers
- PWA

Mobile is the primary interaction model.

Desktop should use additional horizontal space rather than simply stretching the mobile layout.

---

## Platform Differences

React + TypeScript is shared between Web/PWA and Android/Capacitor.

iOS uses native Swift/SwiftUI.

Share:
- design tokens;
- colors;
- typography principles;
- spacing;
- product terminology;
- interaction semantics.

They do not need to be pixel-identical. Follow platform conventions where they improve usability.

---

## Accessibility

Requirements:
- sufficient text contrast;
- touch targets of at least 44×44px where practical;
- do not communicate information through color alone;
- support Dynamic Type on iOS;
- support system font scaling;
- accessible labels for icons;
- meaningful focus states;
- keyboard accessibility on web.

Positive change should not be communicated only by green. Use both color and symbols/text, e.g. `↑ +€2,450`.

---

## Design Token Implementation

Implement tokens centrally.

Example:

```css
:root {
  --color-primary: #142B4A;
  --color-primary-dark: #0B1D33;
  --color-primary-light: #EAF2FF;

  --color-action: #2878E8;
  --color-action-hover: #1F68D0;
  --color-action-pressed: #1959B8;

  --color-positive: #16A878;
  --color-negative: #E05252;
  --color-warning: #F2A51A;
  --color-info: #2878E8;

  --background: #F8F9FB;
  --surface: #FFFFFF;
  --surface-elevated: #FFFFFF;

  --border: #E4E8EE;
  --border-subtle: #EEF1F5;

  --text-primary: #17243A;
  --text-secondary: #667085;
  --text-tertiary: #98A2B3;
  --text-disabled: #B8C0CC;

  --asset-bank: #2878E8;
  --asset-investments: #16A878;
  --asset-cash: #F2A51A;
  --asset-property: #7656D6;
  --asset-vehicles: #20B89A;
  --asset-valuables: #A45BC7;
  --asset-crypto: #F7931A;
  --asset-other: #667085;
  --asset-liabilities: #E05252;
}
```

Dark theme values should be defined under the appropriate dark-theme selector.

---

## Agent Implementation Rules

When implementing UI for My Money:

1. Read this document before creating or modifying UI.
2. Use design tokens rather than hard-coded colors.
3. Do not invent new colors without updating this design system.
4. Do not introduce gradients unless explicitly requested.
5. Do not introduce heavy shadows.
6. Keep the interface visually calm.
7. Use color consistently according to its semantic meaning.
8. Keep financial numbers visually prominent.
9. Prefer whitespace and hierarchy over decoration.
10. Do not turn every card into a colorful component.
11. Preserve accessibility when using colors.
12. Keep light and dark themes visually consistent.
13. Reuse existing components and tokens before creating new variants.
14. If a new visual pattern is needed repeatedly, add it to this design system rather than implementing one-off styling.

---

## Design Philosophy

The product should feel like a **small, thoughtful personal tool**, not a giant financial platform.

The user should open My Money and immediately feel:

> **“I understand my financial picture.”**

The visual design should support that feeling through:

- clarity;
- restraint;
- hierarchy;
- consistent color;
- generous whitespace;
- trustworthy typography;
- subtle interaction;
- minimal complexity.

> **Calm interface. Clear numbers. Complete picture.**

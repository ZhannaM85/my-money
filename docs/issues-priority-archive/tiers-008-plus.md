# Issues Priority — Archive tiers 8+

Closed live-feedback rows from Tier 8 onward. Open / pending items stay in [`../issues-priority.md`](../issues-priority.md).

---

## Tier 8 — Branding (2026-08-17)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#21](https://github.com/ZhannaM85/my-money/issues/21) | ✅ Done | Use light and dark My Money marks as favicons | Source: `docs/branding/logo-light.png` + `logo-dark.png`. `prefers-color-scheme`. Tiny sizes are a center crop of the **M**. Validated on-device 2026-08-22. |
| [#22](https://github.com/ZhannaM85/my-money/issues/22) | ✅ Done | Tab favicon is clipped; generate tiny sizes from the 192px marks | 64px tab icons from `icon-*-192.png` with padding, same pattern as turtle-steps `favicon-64.png`. Validated on-device 2026-08-22. |

## Tier 9 — Live feedback (2026-08-18)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#23](https://github.com/ZhannaM85/my-money/issues/23) | ✅ Done | RUB assets show €0 when base currency is EUR | `RUB` pairs no longer go through Frankfurter. They now use the app-hosted static ruble dataset path so one selected base currency can produce one converted mixed-currency total. Validated on-device 2026-08-22. |
| [#24](https://github.com/ZhannaM85/my-money/issues/24) | ✅ Done | Tab bar sits flush on the iPhone home indicator | Turtle: `viewport-fit=cover` so `pb-[env(safe-area-inset-bottom)]` is not 0. Tab links `min-h-20`. Validated on-device 2026-08-22. |
| [#25](https://github.com/ZhannaM85/my-money/issues/25) | ✅ Done | Tab bar disconnects from the bottom on iPhone Safari | CSS is already `fixed bottom-0`. Same WebKit visual-viewport class as Turtle #120/#188 — hide bar while keyboard/viewport shrunk. Validated on-device 2026-08-22. |
| [#26](https://github.com/ZhannaM85/my-money/issues/26) | ✅ Done | Add a colorful appearance mood matching the design mockups | Keep current green as one mood. Second mood: neutral chrome + category colors (blue/teal, green, amber, purple, coral). Turtle `data-mood` pattern. Validated on-device 2026-08-22. |
| [#27](https://github.com/ZhannaM85/my-money/issues/27) | ✅ Done | Make car a first-class, obvious asset | Brief already includes cars. Model has Property → Vehicle. Forks: own class vs keep under Property; Car vs Vehicle; included vs excluded by default. Validated on-device 2026-08-22. |
| [#28](https://github.com/ZhannaM85/my-money/issues/28) | ✅ Done | Record ownership share for jointly owned assets | Lake house 1/2 with spouse. Store full value + share; net worth uses share × value. Forks: share on asset vs snapshot; % vs fraction. Validated on-device 2026-08-22. |
| [#29](https://github.com/ZhannaM85/my-money/issues/29) | ✅ Done | Cannot enter kopecks/cents: comma decimals fail validation | `16155,11` → “Enter a current amount”. Forms use `Number()`; CSV `parseAmount` already accepts comma decimals. Validated on-device 2026-08-22. |
| [#30](https://github.com/ZhannaM85/my-money/issues/30) | ✅ Done | Exclude an asset from net worth without hiding it | Domain already has `excluded`. Only a buried Tracking select on edit. Surface a clear Exclude control. Validated on-device 2026-08-22. |
| [#57](https://github.com/ZhannaM85/my-money/issues/57) | ✅ Done | Add Soft Finance, Neutral, and Pastel appearance moods | Colorful and Green stay. Extra moods: Soft Finance, Neutral (slate, not black-black), Pastel. Validated on-device 2026-08-19. |
| [#60](https://github.com/ZhannaM85/my-money/issues/60) | ✅ Done | Collapse Dashboard holdings behind an accordion | Converted Holdings start collapsed; tap the header to expand. Original + All native totals stay visible (they are the main figures). Validated on-device 2026-08-19. |

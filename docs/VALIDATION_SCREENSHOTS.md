# Validation screenshots (#118)

Before adding the `validation` label on a UI fix, **attach screenshots as a comment on that GitHub issue** (paste / drag into “Add a comment”, or use the commands below so images render on the issue page).

## Commands

```bash
# 1) Capture PNGs into e2e/artifacts/
npm run screenshots:capture

# 2) Copy the relevant PNGs into docs/validation-proof/<folder>/
#    (so they can be linked from the issue; gists reject binary PNGs)

# 3) Commit + push those PNGs (with the issue fix, or a small docs commit)

# 4) Comment raw GitHub image URLs onto the issue
npm run screenshots:attach -- <issue-number> <proof-folder>
```

Example after capturing Allocation Original screens:

```bash
npm run screenshots:capture
# copy e2e/artifacts/108-*.png → docs/validation-proof/108/
git add docs/validation-proof/108 && git commit -m "#108: validation screenshots." && git push
npm run screenshots:attach -- 108 108
gh issue edit 108 --add-label validation
```

## What is captured by default

| File | Surface |
|------|---------|
| `108-allocation-original-class.png` | Allocation · Original · Class |
| `108-allocation-original-currency.png` | Allocation · Original · Currency |
| `121-allocation-original-class.png` | Allocation · Original · Class share % (#121) |
| `121-allocation-original-currency.png` | Allocation · Original · Currency share % (#121) |
| `122-allocation-class-expanded.png` | Allocation · Class row expanded to assets (#122) |
| `122-allocation-currency-expanded.png` | Allocation · Currency row expanded to assets (#122) |
| `123-allocation-type-expanded.png` | Allocation · Type row expanded to assets (#123) |
| `dashboard-chart-and-asof.png` | Dashboard · arrows + As of (#111/#112/#116/#117) |
| `124-dashboard-positions-total.png` | Dashboard · Positions Total for As of (#124) |
| `125-dashboard-asof-today.png` | Dashboard · Today button next to As of (#125) |
| `126-dashboard-range-picker.png` | Dashboard · Week/Month/Year/All/Custom chips (#126) |
| `126-dashboard-range-custom.png` | Dashboard · Custom From/To dates (#126) |
| `119-duplicate-soft-warning.png` | Asset details duplicate soft warning (#119) |
| `149-add-asset-house-chip.png` | Add asset · Quick add House chip selected (#149) |
| `146-positions-swipe-hide.png` | Dashboard Positions · swipe left Hide CTA (#146) |
| `154-positions-tap-hide.png` | Dashboard Positions · tap row to reveal Hide (#154) |
| `155-allocation-hidden-slice.png` | Allocation · Property slice stays greyed when all hidden (#155) |
| `156-positions-hidden-after-allocation.png` | Dashboard Positions · greyed row after hide from Allocation / reload (#156) |
| `157-allocation-first-tap-show.png` | Allocation · first tap on holding reveals Show (#157) |
| `159-positions-show-green.png` | Dashboard Positions · Show action green (#159) |
| `160-assets-excluded-at-bottom.png` | Assets · excluded rows at the bottom (#160) |
| `158-assets-hide-greyed.png` | Assets · ⋮ menu Hide/Show; excluded row greyed (#158) |
| `161-fx-debug-save-txt.png` | Settings · FX debug Save .txt (#161) |
| `147-positions-hidden-from-total.png` | Dashboard · hidden asset dropped from total (#147) |
| `150-allocation-swipe-hide.png` | Allocation · tap expanded holding to reveal Hide (#150) |
| `148-positions-hidden-disabled.png` | Dashboard Positions · hidden row disabled (#148) |
| `151-positions-ownership-share.png` | Dashboard Positions · ownership share cue (#151) |
| `152-positions-property-full-share.png` | Dashboard Positions · property Your share: 1/1 (#152) |
| `153-assets-filter-chips-wrap.png` | Assets · filter chips wrap to extra rows (#153) |

Fixtures are seeded in IndexedDB (`e2e/seed.ts`). Local only — no user balances leave the device.

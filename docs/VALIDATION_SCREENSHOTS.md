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
| `164-privacy-policy.png` | Privacy policy page (#164) |
| `174-comparison-deltas.png` | Comparison · green/red arrows + delta vs first date (#174) |
| `175-update-as-of.png` | Update · shared As of date, default today (#175) |
| `176-update-locked-edit.png` | Update · existing As of amount read-only + pencil (#176) |
| `177-comparison-cell-edit.png` | Comparison · pencil to edit a cell amount (#177) |
| `178-update-header-hint.png` | Update · full-width hint under title + As of (RU, #178) |
| `179-update-reorder.png` | Update · reorder icon on, drag grips (#179) |
| `180-update-prefill-previous.png` | Update · past As of placeholder from prior snapshot, not later latest (#180) |
| `181-update-stay-view.png` | Update · after Save, same As of, locked amounts (#181) |
| `182-comparison-column-width.png` | Comparison · date columns grow with the amount (#182) |
| `183-update-reorder-save-icon.png` | Update · Save icon while reordering (#183) |
| `184-update-institution.png` | Update · institution under holding title (#184) |
| `185-dashboard-range-persist.png` | Dashboard · All range still selected after a tab hop (#185) |
| `186-dashboard-update-rates.png` | Dashboard · Update rates shows a result after tap (#186) |
| `188-dashboard-update-rates-time.png` | Dashboard · larger Update rates + last-updated time (#188) |
| `192-update-suggested-from-date.png` | Update · suggested amount shows source calendar date (#192) |
| `191-update-as-of-pinned.png` | Update · As of pinned above scrolling holdings (#191) |
| `193-update-post-save-delta.png` | Update · green/red delta vs previous snapshot after Save (#193) |
| `200-update-save-nonempty.png` | Update · Save writes only filled rows; empty stays editable (#200) |
| `201-update-no-change-removed.png` | Update · No change button gone; amount field only (#201) |
| `196-fx-debug-conversion-unavailable.png` | Settings · FX debug after tapping Conversion not available (#196) |
| `189-history-calendar.png` | History · Calendar marks snapshot days (#189) |
| `147-positions-hidden-from-total.png` | Dashboard · hidden asset dropped from total (#147) |
| `150-allocation-swipe-hide.png` | Allocation · tap expanded holding to reveal Hide (#150) |
| `148-positions-hidden-disabled.png` | Dashboard Positions · hidden row disabled (#148) |
| `151-positions-ownership-share.png` | Dashboard Positions · ownership share cue (#151) |
| `152-positions-property-full-share.png` | Dashboard Positions · property Your share: 1/1 (#152) |
| `153-assets-filter-chips-wrap.png` | Assets · filter chips wrap to extra rows (#153) |

Fixtures are seeded in IndexedDB (`e2e/seed.ts`). Local only — no user balances leave the device.

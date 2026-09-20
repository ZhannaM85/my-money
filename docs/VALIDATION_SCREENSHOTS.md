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
| `221-dashboard-subtitle.png` | Dashboard · subtitle “Активы минус долги…” (RU, #221; superseded by #230) |
| `230-dashboard-no-helper-blurbs.png` | Dashboard · no grey helper blurbs; Из сумм / Из курсов remain (RU, #230) |
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
| `178-update-header-hint.png` | Update · full-width hint under title + As of (RU, #178; superseded by #238) |
| `238-update-no-helper-blurb.png` | Update · no grey helper blurb under title; As of remains (RU, #238) |
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
| `202-update-excluded-holdings.png` | Update · excluded holding listed with not-counted hint (#202) |
| `203-update-save-pinned.png` | Update · Save pinned below scrolling holdings (#203) |
| `204-update-save-disabled.png` | Update · Save disabled until an amount is typed (#204) |
| `196-fx-debug-conversion-unavailable.png` | Settings · FX debug after tapping Conversion not available (#196) |
| `189-history-calendar.png` | History · Calendar marks snapshot days (#189) |
| `147-positions-hidden-from-total.png` | Dashboard · hidden asset dropped from total (#147) |
| `150-allocation-swipe-hide.png` | Allocation · tap expanded holding to reveal Hide (#150) |
| `148-positions-hidden-disabled.png` | Dashboard Positions · hidden row disabled (#148) |
| `151-positions-ownership-share.png` | Dashboard Positions · ownership share cue (#151) |
| `152-positions-property-full-share.png` | Dashboard Positions · property Your share: 1/1 (#152) |
| `153-assets-filter-chips-wrap.png` | Assets · filter chips wrap to extra rows (#153) |
| `229-dashboard-tab-bar-inset.png` | Dashboard · Allocation control above tab bar (#229) |
| `229-assets-tab-bar-inset.png` | Assets · last row above tab bar (#229) |
| `229-history-tab-bar-inset.png` | History · last day card above tab bar (#229) |
| `229-settings-tab-bar-inset.png` | More · last section above tab bar (#229) |
| `231-asset-details-refresh-top-collapsed.png` | Asset details · Update this asset + collapsed Сведения near top (RU, #231) |
| `231-asset-details-svedeniya-expanded.png` | Asset details · Сведения expanded (RU, #231) |
| `255-dashboard-net-worth-chart.png` | Dashboard · emerald net-worth series + fill (#255) |
| `255-allocation-class-colors.png` | Allocation · slices colored by class id (#255) |
| `256-dashboard-hero-original-all.png` | Dashboard · Original+All stacked hero (#256) |
| `257-update-tab-bar-with-keyboard.png` | Update · tab bar stays visible with amount focused (#257) |
| `259-dashboard-as-of-ru.png` | Dashboard · На дату uses Russian month, not January (#259) |
| `262-update-header-tight.png` | Update · no На дату title; reorder next to date (RU, #262) |
| `261-comparison-totals-align.png` | Comparison · Итого aligned with date columns (#261) |
| `263-comparison-total-valign.png` | Comparison · Итого vertically aligned with totals (RU, #263) |
| `264-assets-institution-own-row.png` | Assets · institution on its own row under type (RU, #264) |
| `265-assets-excluded-no-not-counted.png` | Assets · excluded row greyed, no Не учитывается (RU, #265) |
| `266-assets-native-under-converted.png` | Assets · muted native under converted amount (#266) |
| `267-assets-reorder-icon.png` | Assets · icon-only Order next to sort (RU, #267) |
| `267-update-reorder-icon.png` | Update · same Order icon next to date (RU, #267) |
| `268-assets-reorder-save-icon.png` | Assets · Save icon while reordering, no Отмена (RU, #268) |
| `269-allocation-type-colors.png` | Allocation · Type view distinct sector colors (RU, #269) |
| `269-allocation-currency-colors.png` | Allocation · Currency EUR/USD/RUB/GEL distinct (RU, #269) |
| `270-settings-positions-toggle.png` | More · Dashboard Positions Shown/Hidden (RU, #270) |
| `270-dashboard-positions-hidden.png` | Dashboard · Positions block hidden (RU, #270) |
| `271-settings-feature-toggles.png` | More · Feature toggles card with switch (RU, #271) |
| `271-dashboard-positions-hidden.png` | Dashboard · Positions hidden via Feature toggles (RU, #271) |
| `272-settings-section-cards.png` | More · Preferences / Rates / Tools cards (RU, #272) |
| `273-dashboard-comparison-already-added.png` | Dashboard · + still enabled; already-added notice (RU, #273) |
| `274-dashboard-asof-chart-sync.png` | Dashboard · На дату matches chart pin (RU, #274) |
| `275-update-optional-comment.png` | Update · optional comment under USD cash amount (RU, #275) |
| `275-history-update-comment.png` | History · comment from Update on the day’s holdings (RU, #275) |
| `279-update-spend-lines.png` | Update · Given/spent multi-line spends (RU, #279) |
| `279-asset-detail-spend-lines.png` | Asset details · same spend lines on Обновить этот актив (RU, #279) |
| `279-history-same-day-spends.png` | History · same-day spends listed separately after All (RU, #279) |
| `280-update-editable-spends.png` | Update · saved given/spent lines in the editor (RU, #280) |
| `280-update-given-spent-headline.png` | Update · Given/spent header is since last refill, not remaining (RU, #280) |
| `280-asset-detail-editable-spends.png` | Asset details · saved spend lines on Обновить этот актив (RU, #280) |
| `283-update-readonly-spends.png` | Update · saved given/received lines read-only with pencil (RU, #283) |
| `283-update-after-line-save.png` | Update · line locked again after per-line Save (RU, #283) |
| `283-asset-detail-readonly-spends.png` | Asset details · same read-only lines on Обновить этот актив (RU, #283) |
| `289-update-spend-edit-row.png` | Update · purpose + amount on one given/received edit row (RU, #289) |
| `289-update-spend-view-row.png` | Update · purpose + amount on one read-only row (RU, #289) |
| `289-asset-detail-spend-row.png` | Asset details · same single-row spend line (RU, #289) |
| `288-update-field-save-diskette.png` | Update · Остаток / comment field save is diskette (RU, #288) |
| `288-update-spend-line-save-diskette.png` | Update · Отдано/получено line save is diskette (RU, #288) |
| `288-asset-detail-field-save-diskette.png` | Asset details · same diskette field saves (RU, #288) |
| `284-update-field-save.png` | Update · per-field save on Остаток / comment (RU, #284) |
| `284-update-spend-line-save.png` | Update · per-line save on Отдано/получено (RU, #284) |
| `284-asset-detail-field-save.png` | Asset details · same field save on Обновить этот актив (RU, #284) |
| `276-update-delta-entry.png` | Update · Remaining / Given chips + new balance / ± (RU, #276) |
| `276-asset-detail-delta-entry.png` | Asset details · Update this asset same chips + remaining field (RU, #276) |
| `258-history-locale-dates.png` | History · list rows use locale dates (#258) |
| `258-asset-snapshot-locale-dates.png` | Asset details · snapshot list locale dates (#258) |

Fixtures are seeded in IndexedDB (`e2e/seed.ts`). Local only — no user balances leave the device.

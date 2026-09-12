# FX pipeline

Canonical contract for currency conversion. `stores/fxStore.ts` is the
runtime orchestrator. **Do not add a third live fetch** in the browser.

Folders that look like bank APIs (`cbr/`, `nbg/` under `src/`) are not
part of the runtime. NBG (and leftover CBR helpers) run at **generate
time** only.

---

## Runtime (browser / PWA / Capacitor)

Three sources, in this order. Manual quotes win on the same pair + date.

| Source | When | Where | Network |
|--------|------|-------|---------|
| Frankfurter | Online, pairs that are not RUB/GEL | `infrastructure/fx/frankfurter/` | Live: `https://api.frankfurter.dev/v2` |
| Static RUB | Pair involves RUB | `infrastructure/fx/rubStatic/` | Same-origin `{BASE_URL}fx/rub/{CODE}.json` |
| Manual overrides | User saved today’s rates in Settings | `IndexedDbManualFxRateRepository` + `mergeRateTables` | None |

Frankfurter is skipped while offline (`shouldFetchFrankfurter`). RUB and
GEL are not on ECB/Frankfurter (`FRANKFURTER_UNSUPPORTED`); those pairs
use static RUB and/or manual rates.

Both Frankfurter and static RUB write through `FxRateRepository`
(IndexedDB). Converted screens then read the merged table. Same-currency
pairs are rate `1` with no fetch. History uses `lookupRateOnOrBefore` so
a missing same-day quote carries the last earlier rate.

Only currency codes and dates leave the device. User balances never do.

Converted figures are reference estimates, not executable quotes.

---

## Generate time (CI / deploy)

`npm run generate:rub-rates` → `scripts/generate-rub-rates.mjs`.

GitHub Pages deploy runs this **before** `vite build`. The script:

1. Fetches National Bank of Georgia JSON (each currency vs GEL).
2. Crosses to CODE→RUB (`scripts/lib/nbgSeries.mjs`; quantity applied;
   GEL→RUB is the invert of the RUB row).
3. Fill-forwards gaps (`scripts/lib/cbrSeries.mjs` date helpers).
4. Writes `public/fx/rub/{CODE}.json` (`source: "NBG"`).

The browser never calls NBG or CBR. `rubStatic` only loads those
generated files.

CBR XML parsing stays in `scripts/lib/cbrSeries.mjs` for generate-time
history. It is **not** a runtime client and must not be re-homed under
`src/infrastructure/fx/`.

---

## Do not

- Do not add `src/infrastructure/fx/cbr` or `src/infrastructure/fx/nbg`.
- Do not fetch CBR or NBG from the app at runtime.
- Do not add a third live FX provider (Fixer, Open Exchange, etc.).
- Do not send amounts, names, or assets to any FX API.
- Do not treat Frankfurter as the RUB path. ARCHITECTURE used to say
  that; it is wrong.

---

## File map

| Path | Role |
|------|------|
| `src/stores/fxStore.ts` | Orchestrates Frankfurter + static RUB + manual merge |
| `src/infrastructure/fx/frankfurter/` | Live client + `ensureFxRates` / `ensureFxRange` |
| `src/infrastructure/fx/rubStatic/` | Same-origin generated RUB series |
| `src/infrastructure/fx/shouldFetchFrankfurter.ts` | Offline gate |
| `src/domain/fx/` | Pure lookup / convert / `mergeRateTables` — no HTTP |
| `src/features/settings/ManualRatesSection.tsx` | Today’s manual overrides |
| `scripts/generate-rub-rates.mjs` | Deploy-time NBG → `public/fx/rub/` |
| `scripts/lib/nbgSeries.mjs` | NBG parse + GEL cross |
| `scripts/lib/cbrSeries.mjs` | Generate-time dates / fill-forward (and CBR XML parse) |

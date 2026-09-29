# FX pipeline

Canonical contract for currency conversion. `stores/fxStore.ts` is the
runtime orchestrator. **Do not add a third live fetch** in the browser
(no Fixer, Open Exchange, or another provider). Frankfurter and NBG are
the two live sources.

CBR helpers stay generate-time only. Do not reintroduce
`src/infrastructure/fx/cbr`.

---

## Runtime (browser / PWA / Capacitor)

Four sources. Manual quotes win on the same pair + date.

| Source | When | Where | Network |
|--------|------|-------|---------|
| Frankfurter | Online, pairs that are not RUB/GEL | `infrastructure/fx/frankfurter/` | Live: `https://api.frankfurter.dev/v2` |
| Static RUB | Pair involves RUB | `infrastructure/fx/rubStatic/` | Same-origin `{BASE_URL}fx/rub/{CODE}.json` |
| NBG | Online, pair involves RUB | `infrastructure/fx/nbg/` | Live: `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/?date=YYYY-MM-DD` |
| Manual overrides | User saved today’s rates in Settings | `IndexedDbManualFxRateRepository` + `mergeRateTables` | None |

Frankfurter and NBG are skipped while offline (`navigator.onLine`, same
gate as `shouldFetchFrankfurter`). RUB and GEL are not on ECB/Frankfurter
(`FRANKFURTER_UNSUPPORTED`).

`ensureRates` / `ensureRange` run in this order:

1. Frankfurter for non-RUB/GEL pairs (online only).
2. Static RUB, which fills IndexedDB from the generated files (also offline).
3. NBG for RUB pairs that are still missing (online only). A force refresh
   (`ensureRange({ force: true })`, used by **Обновить курсы** and
   pull-to-refresh) also refetches the range’s end date so a day already
   cached from static files is replaced with the published NBG quote.

NBG math is the generate-time helper `scripts/lib/nbgSeries.mjs`
(`nbgUrlForDate`, `quotesFromNbgPayload`): each currency is quoted per GEL,
then `CODE→RUB = (CODE/GEL) / (RUB/GEL)`. GEL→RUB inverts the RUB row.
One request per date returns the whole table; the client keeps only the
codes the book needs. The URL carries the date and nothing else.

Runtime NBG does not re-download multi-year history. It asks only for
dates in the last 45 days of the requested window. Older days stay on
the static files (and IndexedDB). If NBG fails, already stored quotes
remain and the store reports `cached_rates`.

Frankfurter, static RUB, and NBG write through `FxRateRepository`
(IndexedDB). A later NBG `put` overwrites the same `date + base + quote`
key from the static file. Converted screens then read the merged table.
Same-currency pairs are rate `1` with no fetch. History uses
`lookupRateOnOrBefore` so a missing same-day quote carries the last
earlier rate.

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

Those files are the bootstrap / offline fallback. The browser also calls
NBG at runtime for recent RUB gaps (`src/infrastructure/fx/nbg`). It does
not call CBR.

CBR XML parsing stays in `scripts/lib/cbrSeries.mjs` for generate-time
history. It is **not** a runtime client and must not be re-homed under
`src/infrastructure/fx/`.

---

## Refreshing rates vs pull-to-refresh (#254, #301)

Pull-to-refresh is the same **intentional** FX refresh as **Update rates**
on More: `refreshFxRates` → `ensureRange({ force: true })`, then
`markRatesFetched`. Capacitor will not change this — the gesture is wired
in `usePullToRefresh` / `PullToRefreshIndicator`.

Force refresh still uses Frankfurter for non-RUB/GEL pairs and static RUB
as fallback. For RUB it also calls NBG, including the end date of the
window, and stores the quotes in IndexedDB. Offline refresh keeps the
cache and static files and does not invent rates.

The shell reload (`reloadForUpdate`) stays on the **app update** banner
when a new service worker is waiting. Pull does not reload the page.

---

## Do not

- Do not add `src/infrastructure/fx/cbr`.
- Do not fetch CBR from the app at runtime.
- Do not add a third live FX provider (Fixer, Open Exchange, etc.).
- Do not send RUB/GEL pairs to Frankfurter, or non-RUB pairs to NBG.
- Do not send amounts, names, or assets to any FX API.
- Do not treat Frankfurter as the RUB path. ARCHITECTURE used to say
  that; it is wrong.
- Do not add a second FX force-fetch beside `refreshFxRates`.

---

## File map

| Path | Role |
|------|------|
| `src/stores/fxStore.ts` | Orchestrates Frankfurter + static RUB + live NBG + manual merge |
| `src/infrastructure/fx/frankfurter/` | Live client + `ensureFxRates` / `ensureFxRange` |
| `src/infrastructure/fx/nbg/` | Live NBG client for RUB (`ensureNbgRates` / `ensureNbgRange`) |
| `src/infrastructure/fx/rubStatic/` | Same-origin generated RUB series (offline / history) |
| `src/infrastructure/fx/shouldFetchFrankfurter.ts` | Offline gate for Frankfurter |
| `src/domain/fx/` | Pure lookup / convert / `mergeRateTables` — no HTTP |
| `src/features/settings/ManualRatesSection.tsx` | Today’s manual overrides |
| `src/features/net-worth/UpdateRates.tsx` | More **Update rates** button |
| `src/features/net-worth/refreshFxRates.ts` | Shared force-fetch used by More and pull-to-refresh |
| `src/shared/hooks/usePullToRefresh.ts` | Gesture; `onRefresh` is the FX force-fetch (#254) |
| `scripts/generate-rub-rates.mjs` | Deploy-time NBG → `public/fx/rub/` |
| `scripts/lib/nbgSeries.mjs` | NBG parse + GEL cross (generate time and runtime) |
| `scripts/lib/cbrSeries.mjs` | Generate-time dates / fill-forward (and CBR XML parse) |

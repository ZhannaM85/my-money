# Issues Priority List

Active work queue only (open, pending validation, not started, partial). Closed history lives in [`docs/issues-priority-archive/`](./issues-priority-archive/README.md).

Work top-to-bottom within each tier; dependencies are noted where order matters. When an issue is confirmed done, move its row to the archive.

The **initial backlog (Tiers 1–7)** is the planned implementation sequence from `PROJECT_BRIEF.md`, filed at project start — same shape as turtle-steps' original Phase 1/2 epics, not a same-day live-feedback split. Later live-feedback filings on a given calendar day append to that day's tier (see `docs/AGENT_WORKFLOW.md`).

Prototype checkpoint after Tier 5: the four flows in `PROJECT_BRIEF.md` §25 (onboarding, dashboard, update, asset details) should feel good before native platforms.

---

## Tier 7 — Native platforms

_After the four web flows feel good. Android and iOS both wrap this app. One tracking epic plus 12 children (turtle-steps native-release shape, minus camera, plus backup/CSV). Row order is the intended sequence, not issue-number order. Apple Developer Program enrolled 2026-08-30; TestFlight still needs a Mac._

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#19](https://github.com/ZhannaM85/my-money/issues/19) | 🔲 Open | Epic 18 — Android and iOS via Capacitor | Tracking only. Children below. |
| [#167](https://github.com/ZhannaM85/my-money/issues/167) | 🔲 Open | iOS: App Store Connect app record + signing (Developer Program enrolled) | Account step. Enrollment is done; Connect record is not. |
| [#168](https://github.com/ZhannaM85/my-money/issues/168) | 🔲 Open | iOS: code signing + first TestFlight beta build | Depends on #162 + #167. Requires a Mac. |
| [#170](https://github.com/ZhannaM85/my-money/issues/170) | 🔲 Open | iOS: App Store listing content and submit for review | Depends on #163, #164, #168. |
| [#171](https://github.com/ZhannaM85/my-money/issues/171) | 🔲 Open | Android: Google Play Console enrollment + app signing setup | Account step. $25 one-time. |
| [#173](https://github.com/ZhannaM85/my-money/issues/173) | 🔲 Open | Android: Play Store listing content + internal/closed testing track | Depends on #162, #163, #164, #171. |
| [#172](https://github.com/ZhannaM85/my-money/issues/172) | 🔲 Open | Android: promote to production + submit for Play Store review | Depends on #173. |

---

## Tier 19 — Live feedback (2026-09-02)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 20 — Live feedback (2026-09-03)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 21 — Live feedback (2026-09-04)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 22 — Live feedback (2026-09-09)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 23 — CI (2026-09-10)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 24 — Live feedback (2026-09-11)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 25 — Live feedback (2026-09-12)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 26 — Live feedback (2026-09-13)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 27 — Live feedback (2026-09-14)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 28 — Live feedback (2026-09-15)

| # | Status | Issue | Notes |
|---|--------|-------|-------|

---

## Tier 29 — Live feedback (2026-09-20)

| # | Status | Issue | Notes |
|---|--------|-------|-------|
| [#290](https://github.com/ZhannaM85/my-money/issues/290) | 🔍 Pending validation | Обновить: hide leaking “noop” on comparison row | Unchanged field save no longer renders the persist sentinel. Comparison delta stays. |
| [#288](https://github.com/ZhannaM85/my-money/issues/288) | 🔍 Pending validation | Unify field-level save icon to diskette (not checkmark) | Остаток, comment, and given/received field saves all use lucide Save. Page-level «Сохранить обновления» left for #285. |
| [#286](https://github.com/ZhannaM85/my-money/issues/286) | 🔍 Pending validation | CI: Assets reorder-grip test flakes after Save | Wait for the #104 grip to leave after async persist. Unblocks CI/Pages after #284. |
| [#284](https://github.com/ZhannaM85/my-money/issues/284) | 🔍 Pending validation | Обновить: per-field / per-card save that persists | Остаток, comment, and #283 spend-line Save write through to IndexedDB immediately. Page-level «Сохранить обновления» kept until #285. |
| [#283](https://github.com/ZhannaM85/my-money/issues/283) | 🔍 Pending validation | Отдано/получено lines: read-only until pencil; save returns to read-only | Saved lines display values; pencil edits that line; per-line Save locks it. New unsaved lines stay editable until first save. Same editor on bulk Обновить and asset-detail. |
| [#282](https://github.com/ZhannaM85/my-money/issues/282) | 🔍 Pending validation | Rename Отдано/потрачено → Отдано/получено; support received money | Copy rename. Mode has Given + Received lines. Headline is net of explicit `flow` entries only (#280). |
| [#280](https://github.com/ZhannaM85/my-money/issues/280) | 🔍 Pending validation | Given/spent headline shows wrong inflated total (not cumulative spent) | Headline = sum of explicit given/received `flow` (not lifetime remaining drawdowns). Saved same-day lines editable. |
| [#279](https://github.com/ZhannaM85/my-money/issues/279) | 🔍 Pending validation | Update given/spent: allow multiple spendings on the same day | Shared spend-line list (amount + optional comment) on bulk Update and asset-detail. Sum decreases remaining; each line appends a snapshot so History/details can show them separately. |
| [#278](https://github.com/ZhannaM85/my-money/issues/278) | 🔍 Pending validation | CI: History list tests fail when 1M no longer includes 2026-08-17 | History list tests now select All so the 2026-08-17 holdings row stays in-range. Unblocks Pages deploy #319. |
| [#277](https://github.com/ZhannaM85/my-money/issues/277) | 🔍 Pending validation | Сводка: rephrase FX rate missing / disclaimer subheader (clearer RU) | Split `fxNote`: missing «Нет курса USD на эту дату — эта валюта не пересчитана в ₽.»; rates exist «Курсы справочные, не банковские котировки.» |
| [#276](https://github.com/ZhannaM85/my-money/issues/276) | 🔍 Pending validation | Assets: toggle update by ± amount + show remaining vs given/spent | Shared entry (new remaining or ±) on bulk Update and asset-detail update. Per-asset headline remaining vs cumulative given/spent. No envelope type. |
| [#275](https://github.com/ZhannaM85/my-money/issues/275) | 🔍 Pending validation | Update assets: allow optional comment when saving a new balance | Optional per-holding note on Обновить; stored on the snapshot; History/details already show notes (#97). Empty does not block Save. |
| [#254](https://github.com/ZhannaM85/my-money/issues/254) | 🔍 Pending validation | Pull-to-refresh should update rates | Product pick: pull = same `refreshFxRates` / `ensureRange({ force: true })` as More Update rates. Does not reload the shell. |

---

## Explicitly not filed

Out of scope for the MVP (`PROJECT_BRIEF.md` §20) — do not implement from chat:

- Bank / Open Banking / brokerage / crypto live sync
- Transactions, budgeting, expense categories
- Advice, AI, tax, social, trading
- Automatic property / jewelry valuation
- Required cloud accounts or sync

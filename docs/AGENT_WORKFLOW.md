# Agent workflow — read this before picking up a new batch of issues

This is the standing operating procedure for working GitHub issues on this
repo. It exists so a new agent session can pick up exactly where the last
one left off. If anything here conflicts with a direct instruction from the
user in the current conversation, the user's instruction wins.

Sibling contract: this is adapted from `turtle-steps-to-the-goal`. Keep the
same issue-first habit; do not invent a second process.

## What this project is

`my-money` (app name: **My Money**) — a local-first personal wealth / net-worth tracker
(React 19 + TypeScript + Vite + Tailwind + Dexie/IndexedDB for web/PWA/
Android; native Swift/SwiftUI later for iOS). No backend, no accounts, no
bank connections. The original scope is `PROJECT_BRIEF.md`. The living
architecture doc is `docs/ARCHITECTURE.md`. `docs/issues-priority.md` is
the **active** open / pending-validation queue (grouped by tier). Closed
history lives in `docs/issues-priority-archive/`.

## The standing contract

1. **Issue-first — the full sequence, not just the GitHub issue.** Don't
   write any code without, in this exact order: (1) `gh issue create`
   **with a `--label`**, (2) add the row to `docs/issues-priority.md`,
   (3) *then* start implementing. Filing the GitHub issue and immediately
   jumping into code still counts as skipping this step.

   **Always pass `--label` on every `gh issue create`, no exceptions.**
   Use this repo's label set: `epic` (top-level epic from the brief),
   `architecture` (foundational/structural decision), `feature` (new
   user-facing capability), `chore` (bug fix, polish, i18n, perf,
   CI/tooling, docs — anything that isn't new capability),
   `good-first-issue` (small, self-contained). Don't use GitHub's stock
   `bug`/`enhancement`/`documentation` labels for new work.

   Use `gh issue create --body-file <path>` for multi-line bodies. Never
   pass `required_permissions: ["all"]` (or other elevation) for
   allowlisted `gh` / `git` commands.

   **Hard exception to step (3) — live/rapid-fire reporting sessions.**
   When the user is testing and reporting findings one after another,
   stop at step (2) for every item. Do not implement until the user gives
   a separate signal that the burst is over.

2. **Scrutinize before filing — but only using what you already know.**
   If something is immediately obvious as by-design, say so. Do not
   investigate in order to decide whether to file.

3. **Prioritize easiest → hardest** within a batch unless told otherwise.

4. **Once told to proceed automatically**, keep implementing the queued
   issues one after another without pausing for confirmation on routine
   ones. Pause and ask if an issue has a genuine fork in end-user
   behavior.

5. **Per-issue checklist**, in order:
   - Implement.
   - Typecheck (`npx tsc -b` or `npm run build`).
   - `npm run lint`.
   - Run the **affected** test file(s) only.
   - For UI surfaces: capture + attach Playwright screenshots before
     `validation` (see `docs/VALIDATION_SCREENSHOTS.md` / #118).
   - After the user confirms: GitHub comment + close, move the row from
     `docs/issues-priority.md` into the archive. Update `ARCHITECTURE.md`
     when the product shape actually changed.
   - One calendar day → one new tier in `docs/issues-priority.md` for
     live-feedback filings. The **initial planned backlog** (Tiers 1–7)
     is a work-order sequence filed on project start, not a same-day
     live-feedback split — do not collapse it.

6. **Commit the issue-priority doc after each logging batch.** Stage only
   the issue-priority / related doc updates from that logging step.

## GitHub labels

Create (already seeded on the repo): `epic`, `feature`, `chore`,
`architecture`, `good-first-issue`, `validation`, `validated`.

# Required startup reading

At the beginning of every chat, before task actions:

1. Read applicable parent instructions and this file in full.
2. Check for and read root `CLAUDE.md` (including lowercase variants); report verified absence when missing.
3. Read `docs/AGENT_WORKFLOW.md` and applicable `.cursor/rules/*.mdc`, including every rule with `alwaysApply: true`. These rules apply to Codex as well as Cursor.
4. Confirm the current repository. This project is `ZhannaM85/my-money`; never substitute a sibling repository's instructions or issue with the same number.

## Closing an issue confirmed on a device

A GitHub close alone is not completion. Only the user's explicit device confirmation authorizes the validated workflow; tests or screenshots alone do not.

For each issue, complete all steps before starting the next:

1. Verify the issue number and title in `ZhannaM85/my-money` and its row in `docs/issues-priority.md`.
2. On GitHub, replace `validation` with `validated`, add a device-confirmation comment, and close as completed. If already closed or commented, complete the missing steps without duplicating them.
3. Remove the row from `docs/issues-priority.md`; the active file contains open and pending work only.
4. Move the row to its matching original tier in `docs/issues-priority-archive/`. For Tier 8 onward, use `docs/issues-priority-archive/tiers-008-plus.md`. Set status to `✅ Done` and add `Validated on-device YYYY-MM-DD` using the confirmation date. Preserve useful implementation notes.
5. Check the documentation diff, stage explicit filenames, create one commit for that issue with a `#N:` subject, and push it. Do not bundle several issue closures into one commit.
6. Verify GitHub is closed with `validated` and no `validation`, the active row is absent, and exactly one archived row exists in the matching tier.

Keep closing changes limited to the issue's labels, comment, closure, and archive docs. Update architecture only if its description is outdated. Make policy/instruction changes in a separate commit.

See `.cursor/rules/one-issue-one-commit.mdc` for the existing per-issue implementation and validation contract. Direct user instructions take precedence.

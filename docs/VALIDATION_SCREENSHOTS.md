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
| `dashboard-chart-and-asof.png` | Dashboard · arrows + As of (#111/#112/#116/#117) |
| `119-duplicate-soft-warning.png` | Asset details duplicate soft warning (#119) |

Fixtures are seeded in IndexedDB (`e2e/seed.ts`). Local only — no user balances leave the device.

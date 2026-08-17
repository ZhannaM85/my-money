# Branding

Source marks for My Money. Treat these as the design originals — do not redraw unless the user supplies a new file.

| File | Use |
|------|-----|
| `logo-light.png` | Light surfaces: navy **M**, wordmark, tagline, asset ring on white |
| `logo-dark.png` | Dark surfaces: white **M** on a navy circle, same asset ring |

Favicons / PWA / store icons: [#21](https://github.com/ZhannaM85/my-money/issues/21), [#22](https://github.com/ZhannaM85/my-money/issues/22).

Tab icons follow turtle-steps: a **64px** PNG of the circular mark (`favicon-*-64.png`), not a 32px crop of the full lockup. Regenerated from `public/icon-light-192.png` and `icon-dark-192.png` with `python scripts/generate-favicons.py` (does not overwrite the 192 sources).

| File | Use |
|------|-----|
| `public/favicon-light-64.png` / `32` | Browser tab, light |
| `public/favicon-dark-64.png` / `32` | Browser tab, dark (`prefers-color-scheme`) |
| `public/apple-touch-icon.png` | iOS home-screen (180, dark circular mark) |
| `public/icon-light-192.png` / `icon-dark-192.png` | Source circular marks (do not overwrite from this script) |
| `public/icon-512.png` | PWA install icon (scaled from the dark 192) |

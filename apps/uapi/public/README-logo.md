# Bitcode logo assets

## Source of truth

| File | Role |
|------|------|
| **`bitcode-logo.svg`** | **SVG source of truth** for the Bitcode mark (stylized tilted C) |
| **`bitcode-logo.pxd`** | Pixelmator master; export SVG here when redesigning |

Do **not** invent alternate marks. Edit the `.pxd`, export `bitcode-logo.svg`, then re-derive everything else from that SVG.

## Related product assets (not Bitcode brand SSOT)

| File | Role |
|------|------|
| **`bitcoin-logo.svg`** | Bitcoin protocol mark used on the landing exchange row (Bitcode ↔ Bitcoin). Not a Bitcode brand asset — do not delete when refreshing Bitcode logos. |

## Derived (must match SSOT)

| File | Purpose |
|------|---------|
| `logo.svg`, `icon.svg`, `icons/logo.svg`, `email-logo.svg` | Alias copies of `bitcode-logo.svg` |
| `favicon-16x16.png`, `favicon-32x32.png` | Browser tab icons |
| `apple-touch-icon.png` | iOS home screen / rich link previews |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Android |
| `og-image.png` | Open Graph / message previews (1200×630, mark on `#02050d`) |

### Regenerate rasters (required after any mark change)

```bash
# From repo root (macOS: Google Chrome + sips)
node scripts/generate-bitcode-logo-assets.mjs
```

**Do not** convert `bitcode-logo.svg` with a naïve SVG→PNG tool into a large square.
The SSOT SVG is a **non-square** mark (intrinsic ~36×49, viewBox `-8 -5 52 59`).
Naïve rasterizers paste that tiny frame into a white canvas → **tiny logo in the
corner of a large white square** (broken link-preview / apple-touch favicon).

The generator nests the mark in a square (or 1200×630 OG) frame on `#02050d`,
scales it to ~75% of the content box, and centers it — then resizes to each
favicon size.

## In-app React

`components/bitcode/branding/BitcodeLogoMark/bitcode-logo-mark.ts` embeds the same path/viewBox/transform as `bitcode-logo.svg` for themed `currentColor` rendering. Keep those constants byte-identical to the SVG after any mark change.

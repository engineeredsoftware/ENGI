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
| `apple-touch-icon.png` | iOS home screen |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Android |
| `og-image.png` | Open Graph / message previews (1200×630, mark on `#02050d`) |

## In-app React

`components/bitcode/branding/BitcodeLogoMark/bitcode-logo-mark.ts` embeds the same path/viewBox/transform as `bitcode-logo.svg` for themed `currentColor` rendering. Keep those constants byte-identical to the SVG after any mark change.

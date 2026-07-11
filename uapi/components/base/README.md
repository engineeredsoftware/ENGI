# Base Components (Bitcode UI) — migration home

**V48 target:** layers move to `uapi/components/{shadcn,bitcode}/` with `Shadcn*`
and `Bitcode*` prefixes (see `../README.md` and
`BITCODE_SPEC_V48.md` § Frontend component and naming architecture).

Until Phase 1 completes, active sources remain under this `base/` tree:

- First‑party: `bitcode/` — shared base primitives (perf + layout + composition)
- Vendor providers: `<provider>/` — Proper‑noun folders (e.g., `shadcn`)

New shared modules should prefer `uapi/components/bitcode/` (e.g.
`routes/product-routes.ts`) over adding to this tree.

General Rules
- Explicit imports only; no re‑exports (no index barrels)
- No app code imports from `uapi/components/ui/apps/www/registry/*` (they are fixtures)
- Tokenized classes; avoid hard‑coded RGBA/hex for brand colors
- Use `cn` from `@bitcode/styling`

## Provider Checklist (for adding a new vendor family or component)

When adding a new component to an existing provider (e.g., `shadcn`):

1) File location
- `uapi/components/base/<provider>/<component>.tsx`
- `<provider>` is a proper noun (e.g., `shadcn`) — do not create generic names like `primitives`.

2) Implementation
- Self‑contained file; do not re‑export from an `index.ts`.
- Import `cn` from `@bitcode/styling` and apply classes (Tailwind + tokens).
- Avoid hex/rgba brand colors; use Tailwind tokens.
- Keep API compatible with upstream where reasonable, but prefer Bitcode naming precision.

3) Exports
- Export explicit symbols only (no `export *`).
- Example:
```ts
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
```

4) Docs & references
- If the component has caveats (e.g., needs pairing with another component), document in file comments at top.
- If the component is heavy, consider dynamic usage notes in the consumer docs.

5) Usage in app code
- Import from `@/components/base/<provider>/<component>` directly.
- Do not import from `@/components/ui/...`.

## Bitcode Primitives (first‑party)

Use these to standardize efficient behavior without imposing looks:
- `bitcode/panels/ScrollContainer.tsx` — SSOT scrollbars for all scroll regions
- `bitcode/perf/ContentVisibility.tsx` — content‑visibility wrapper for large off‑screen content
- `bitcode/perf/GPUAcceleration.tsx` — GPU/compositor hints for animated containers
- `bitcode/page-header/PageHeaderSection.tsx` — neutral header composition shell

See `internal-docs/BITCODE_INTERFACE_STYLE.md` for full guidance.

## Bitcode Base Components (shared UI)

Reusable Bitcode-branded UI that is shared across features lives flat under `bitcode/` (no `ui/` nesting):
- `bitcode/typing-animation.tsx`, `bitcode/multi-line-typing-animation.tsx`
- `bitcode/quantum-button.tsx`, `bitcode/word-rotate.tsx`
- `bitcode/metal-plate.tsx`, `bitcode/dock.tsx`, `bitcode/particle-effect.tsx`

App code may import these directly, and page-specific components should be colocated under the page (e.g., `app/executions/components/*`) while reusing these base components.

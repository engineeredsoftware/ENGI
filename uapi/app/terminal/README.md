# Legacy `/terminal` (eradicated)

V48 eradicates the Terminal cockpit. This directory retains:

1. **`page.tsx`** — redirect to `/packs` (query-preserving).
2. **Compatibility shims** — re-export relocated modules for residual tests and
   era-pinned callers during migration.

Do not add new product behavior here. Canonical surfaces: `/packs`, `/deposits`,
`/reads`, `/auxillaries`, `/docs`, Conversations.

See `BITCODE_SPEC_V48.md` § Frontend component and naming architecture.

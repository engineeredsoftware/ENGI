# Bitcode layer (`Bitcode*`)

Shared base over Shadcn: layout, nav, pipeline table/log/telemetry, auth chrome,
explainers, route shell, product route helpers.

**Status (Phase 1):** sources live here (moved from `components/base/bitcode/`).
`routes/product-routes.ts` is the canonical Packs/Reads/Deposits route helper.

**Import only from:** `components/shadcn` (and `@bitcode/styling` / packages).

**Next:** Phase 2 renames `execution/` → `pipeline/` and product Execution UI
symbols to Pipeline.

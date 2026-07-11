# Bitcode layer (`Bitcode*`)

Shared base over Shadcn: layout, nav, pipeline table/log/telemetry, auth chrome,
explainers, route shell, product route helpers.

**Import only from:** `components/shadcn` (and `@bitcode/styling` / packages).

**Migration:** most sources still live in `../base/bitcode/`. New shared modules
land here (e.g. `routes/product-routes.ts`). Phase 1–2 complete the tree move
and Pipeline naming rename (`execution/` → `pipeline/`).

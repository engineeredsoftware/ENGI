# Shadcn layer (`Shadcn*`)

Root UI primitives. No Bitcode product knowledge.

**Status (Phase 1):** sources live here (moved from `components/base/shadcn/`).
Export symbols may still use unprefixed names (`Button`, `Dialog`); subsequent
commits rename public exports to the `Shadcn*` prefix and update call sites.

**Import rule:** only Radix/shadcn primitives and `@bitcode/styling` (or
equivalent pure utils).

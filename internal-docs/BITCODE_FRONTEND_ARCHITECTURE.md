# Bitcode Frontend Architecture

Status: active internal architecture note aligned to V48 draft canon
(`BITCODE_SPEC_V48.md` § Frontend component and naming architecture).
Non-canonical relative to the SPEC family, but must not contradict it.

## Product experiences (7)

| Experience | Route(s) | Component prefix | Directory |
| --- | --- | --- | --- |
| Marketing | `/` | `Marketing*` | `uapi/components/marketing/` |
| Packs | `/packs` | `Packs*` | `uapi/components/packs/` |
| Reads | `/reads` | `Reads*` | `uapi/components/reads/` |
| Deposits | `/deposits` | `Deposits*` | `uapi/components/deposits/` |
| Docs | `/docs` | `Docs*` | `uapi/components/docs/` |
| Conversations | `/conversations` (full commercial UX deferred post-V48) | `Conversations*` | `uapi/components/conversations/` |
| Auxillaries | `/auxillaries/*` | `Auxillaries*` | `uapi/components/auxillaries/` |

Page shells live under `uapi/app/...` and compose components only — they are not
the home of large UI trees.

## Component layers

```
Shadcn*  →  Bitcode*  →  Experience*
```

1. **Shadcn** (`uapi/components/shadcn/`) — root primitives re-exported as
   `ShadcnButton`, `ShadcnDialog`, etc. No Bitcode product knowledge.
2. **Bitcode** (`uapi/components/bitcode/`) — theme, layout, nav, pipeline
   table/log/telemetry, auth chrome, explainers, route shell. Imports Shadcn
   only (plus tokens from `@bitcode/styling`).
3. **Experience** — page-specific composition. Imports Bitcode only. Never
   imports another experience or raw Shadcn.

During migration, current files may still live under
`uapi/components/base/{shadcn,bitcode}/` until Phase 1 tree move completes.

## Naming law

| Concept | Prefer | Avoid (product UI) |
| --- | --- | --- |
| Pipeline run surface | `BitcodePipeline*`, `DepositsPipeline*`, `ReadsPipeline*` | `Terminal*`, product `Execution*` |
| Ledger / BTD journal | `Journal*`, journal transaction kinds | Coupling journal names to Terminal |
| Agent/PTRR executor packages | keep package names (`execution-generics`) | conflating with product Pipeline |

## Legacy Terminal

The `/terminal` cockpit is **not** a product surface. Live capabilities relocate
to Bitcode or the owning experience. Dead cockpit-only modules are deleted.
`/terminal` may be a compatibility redirect to `/packs` during migration.

Canonical product routes and href builders live in
`uapi/components/bitcode/routes/product-routes.ts` (and under `base/bitcode`
until the tree move).

## Interface rules

- Launch entrypoints: `/deposits`, `/reads`, `/packs`, Auxillaries, Marketing, Docs.
- Conversations structure may persist; full web conversations experience is
  deferred post-V48.
- Compatibility corridors (`/exchange` → `/packs`, `/executions` as needed) must
  not reintroduce Terminal as a primary operator surface.
- Source-safety, measurement-before-price, and proof-before-state bind UI the
  same way they bind protocol law.

## Package boundary

- Shareable pure logic → `packages/`.
- React and Next → `uapi/`.
- No new generalizable domain logic under `uapi/app/terminal/`.

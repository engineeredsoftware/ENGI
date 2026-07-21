# Bitcode Frontend Architecture

Status: active internal architecture note aligned to V48 draft canon.
Detail filesystem contract: `BITCODE_SOURCE_LAYOUT.md`.

## Product experiences (7)

| Experience | Route(s) | Component prefix | Directory |
| --- | --- | --- | --- |
| Marketing | `/` | `Marketing*` | `apps/uapi/components/marketing/` |
| Packs | `/exchange` | `Packs*` | `apps/uapi/components/exchange/` |
| Reads | `/reads` | `Reads*` | `apps/uapi/components/reads/` |
| Deposits | `/deposits` | `Deposits*` | `apps/uapi/components/deposits/` |
| Docs | `/docs` | `Docs*` | `apps/uapi/components/docs/` |
| Conversations | conversations (full UX deferred post-V48) | `Conversations*` | `apps/uapi/components/conversations/` |
| Auxillaries | `/auxillaries/*` | `Auxillaries*` | `apps/uapi/components/auxillaries/` |

Page shells: `apps/uapi/app/...` — orchestration only.

## Component layers

```
Shadcn* → Bitcode* → Experience*
```

1. **Shadcn** — root primitives (`apps/uapi/components/shadcn/`).
2. **Bitcode** — theme, layout, nav, pipeline table/log/telemetry, auth chrome,
 product route helpers (`apps/uapi/components/bitcode/`).
3. **Experience** — page-specific composition; imports Bitcode only.

## Component unit pattern

```
apps/uapi/components/<layer>/<ComponentName>/
 <ComponentName>.tsx # named entry — not index.tsx
 hooks/
 styles/
 __tests__/
```

Shared pure logic for an experience lives under that experience’s `models/`,
`hooks/`, `constants/`, `types/` — not inside page clients.

## Naming law

| Concept | Prefer | Avoid |
| --- | --- | --- |
| Pipeline run surface | `BitcodePipeline*`, `Deposits*`, `Reads*` | product*, product Execution* |
| BTD ledger | Journal* | product-coupled journal names |
| Agent packages | keep `execution-generics` | conflating with product Pipeline |

## Legacy product

**Deleted.** No `/exchange` route, page, or product module tree. Use `/exchange`,
`/deposits`, `/reads`, Auxillaries.

## Interface rules

- Launch entrypoints: `/deposits`, `/reads`, `/exchange`, Auxillaries, Marketing, Docs.
- Conversations structure may persist; full commercial UX is deferred post-V48.
- Source-safety, measurement-before-price, proof-before-state bind UI the same
 way they bind protocol law.

## Package boundary

- Shareable pure logic → `packages/`.
- React and Next → `apps/uapi/`.

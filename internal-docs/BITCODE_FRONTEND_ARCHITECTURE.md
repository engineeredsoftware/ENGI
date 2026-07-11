# Bitcode Frontend Architecture

Status: active internal architecture note aligned to V48 draft canon.
Detail filesystem contract: `BITCODE_SOURCE_LAYOUT.md`.

## Product experiences (7)

| Experience | Route(s) | Component prefix | Directory |
| --- | --- | --- | --- |
| Marketing | `/` | `Marketing*` | `uapi/components/marketing/` |
| Packs | `/packs` | `Packs*` | `uapi/components/packs/` |
| Reads | `/reads` | `Reads*` | `uapi/components/reads/` |
| Deposits | `/deposits` | `Deposits*` | `uapi/components/deposits/` |
| Docs | `/docs` | `Docs*` | `uapi/components/docs/` |
| Conversations | conversations (full UX deferred post-V48) | `Conversations*` | `uapi/components/conversations/` |
| Auxillaries | `/auxillaries/*` | `Auxillaries*` | `uapi/components/auxillaries/` |

Page shells: `uapi/app/...` — orchestration only.

## Component layers

```
Shadcn*  →  Bitcode*  →  Experience*
```

1. **Shadcn** — root primitives (`uapi/components/shadcn/`).
2. **Bitcode** — theme, layout, nav, pipeline table/log/telemetry, auth chrome,
   product route helpers (`uapi/components/bitcode/`).
3. **Experience** — page-specific composition; imports Bitcode only.

## Component unit pattern

```
uapi/components/<layer>/<ComponentName>/
  <ComponentName>.tsx      # named entry — not index.tsx
  hooks/
  styles/
  __tests__/
```

Shared pure logic for an experience lives under that experience’s `models/`,
`hooks/`, `constants/`, `types/` — not inside page clients.

## Naming law

| Concept | Prefer | Avoid |
| --- | --- | --- |
| Pipeline run surface | `BitcodePipeline*`, `Deposits*`, `Reads*` | Terminal*, product Execution* |
| BTD ledger | Journal* | Terminal-coupled journal names |
| Agent packages | keep `execution-generics` | conflating with product Pipeline |

## Legacy Terminal

**Deleted.** No `/terminal` route, page, or product module tree. Use `/packs`,
`/deposits`, `/reads`, Auxillaries.

## Interface rules

- Launch entrypoints: `/deposits`, `/reads`, `/packs`, Auxillaries, Marketing, Docs.
- Conversations structure may persist; full commercial UX is deferred post-V48.
- Source-safety, measurement-before-price, proof-before-state bind UI the same
  way they bind protocol law.

## Package boundary

- Shareable pure logic → `packages/`.
- React and Next → `uapi/`.

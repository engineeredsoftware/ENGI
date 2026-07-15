# UAPI Architecture

Status: active for the V48 website application layer.

Authoritative layout contract: [`internal-docs/BITCODE_SOURCE_LAYOUT.md`](../internal-docs/BITCODE_SOURCE_LAYOUT.md).  
Product UI law: `BITCODE_SPEC_V48.md` § Frontend component and naming architecture.

## Overview

`apps/uapi/` is the Next.js **interface owner**: thin App Router pages, HTTP adapters,
and React layers. Domain logic that is not React/Next-specific belongs in
`packages/` (`@bitcode/api`, `@bitcode/btd`, `@bitcode/auth`, pipelines, …).

## Directory structure

```
apps/uapi/
├── app/                         # Thin page shells + api/ adapters
│   ├── page.tsx / (root)/       # Marketing
│   ├── packs|deposits|reads|docs|conversations|auxillaries/
│   └── api/                     # Prefer @bitcode/api handlers
├── components/
│   ├── shadcn/                  # Shadcn* primitives
│   ├── bitcode/                 # Bitcode* base (pipeline, layout, auth, …)
│   └── {marketing,packs,reads,deposits,docs,conversations,auxillaries}/
│       ├── models|hooks|constants|types/
│       └── <ComponentName>/     # named entry + hooks/styles/__tests__
├── hooks/                       # Cross-experience hooks only
├── lib/                         # Next glue; re-export packages when possible
├── middleware/
├── networking/
├── types/
├── tests/                       # Route/page contracts (unit co-located under components)
└── stories/
```

**Terminal is deleted.** Do not reintroduce `app/terminal` or `/terminal`.

## Component import direction

```
Shadcn*  →  Bitcode*  →  Experience*
```

- Experiences never import each other.
- Page clients compose components; components do not import page clients.
- New components: `ComponentName/ComponentName.tsx` (not `index.tsx`).

## Naming

| Domain | Prefer | Avoid |
| --- | --- | --- |
| Product runs | Pipeline / `BitcodePipeline*` | Terminal, product “Executions” UI |
| BTD ledger | journal | coupling journal names to Terminal |
| Agent packages | `execution-generics` (low-level) | conflating with product Pipeline |

## Package boundary

| Location | Owns |
| --- | --- |
| `packages/*` | Shareable domain, pure models, route orchestration, BTD, pipelines |
| `apps/uapi/` | Next routes, React, Storybook, thin adapters |

Examples of package homes:

- `@bitcode/api/pipelines/cancel` · `orphan-sweep`
- `@bitcode/observability/product-analytics`
- `@bitcode/auth` wallet + auth redirect helpers

## Middleware pipeline

Order-based: telemetry → security headers → CORS → rate limit → authentication →
route rewrite.

## Quality bar

- SRP / DRY / explicit TypeScript
- Top-of-file overview on non-trivial modules
- Co-located unit tests under component `__tests__/` when practical
- Source-safety, auth, ownership checks never weakened for convenience

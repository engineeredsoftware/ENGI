# UAPI Architecture

Status: active for the V48 website application layer. Product architecture law
lives in `BITCODE_SPEC_V48.md` (frontend component section) and
`internal-docs/BITCODE_FRONTEND_ARCHITECTURE.md`.

## Overview

UAPI is the Next.js web application and HTTP route layer for Bitcode. Domain
logic that is not React- or Next-specific belongs in `packages/`.

## Directory structure (target)

```
uapi/
├── app/                         # Next.js App Router (thin page shells + api/)
│   ├── page.tsx / (root)/       # Marketing
│   ├── packs/                   # Packs experience
│   ├── deposits/                # Deposits experience
│   ├── reads/                   # Reads experience
│   ├── docs/                    # Docs experience
│   ├── conversations/           # Conversations (structure; full UX deferred)
│   ├── auxillaries/             # Auxillaries experience
│   └── api/                     # HTTP routes (thin adapters over packages)
├── components/
│   ├── shadcn/                  # Shadcn* root primitives
│   ├── bitcode/                 # Bitcode* base (pipeline, layout, auth, …)
│   ├── marketing/
│   ├── packs/
│   ├── reads/
│   ├── deposits/
│   ├── docs/
│   ├── conversations/
│   └── auxillaries/
├── hooks/                       # React hooks (experience-agnostic or thin)
├── lib/                         # Next-only glue (prefer packages for domain)
├── middleware/                  # Middleware pipeline
├── networking/                  # Client API helpers (pure builders → packages)
├── types/                       # App-local types (prefer packages when shared)
├── tests/                       # Jest / contracts
└── stories/                     # Storybook
```

Migration note: Phase 1 moved shadcn/bitcode to the target directories above.
Experience components may still be colocated under `app/*` until Phase 4.
The legacy `app/terminal/` cockpit has been **deleted**. Product surfaces are
`/packs`, `/deposits`, `/reads`, Auxillaries, Docs, Conversations (see V48 NOTES).

## Component import direction

```
Shadcn*  →  Bitcode*  →  Experience*
```

App pages import components; components do not import page clients.

## Naming

- Product run surfaces: **Pipeline** (`BitcodePipeline*`, experience prefixes).
- BTD ledger rows: **journal** / journal transaction kinds.
- Do not introduce new `Terminal*` product symbols.
- Low-level agent executor packages remain `execution-*` until a deliberate
  package rename; they are not the product Pipeline surface.

## Middleware pipeline

Composable handlers (order-based): telemetry → security headers → CORS →
rate limit → authentication → route rewrite.

## Package boundary

| Location | Owns |
| --- | --- |
| `packages/*` | Shareable domain, pure models, API handlers, BTD, pipelines |
| `uapi/` | Next routes, React, Storybook, app-local adapters |

## Production readiness

Security, rate limiting, telemetry, and source-safe product analytics remain
required. Do not weaken auth, ownership checks, or source-safety for refactor
convenience.

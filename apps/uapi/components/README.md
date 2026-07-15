# UAPI Components

Canonical UI layers for Bitcode. Full filesystem contract:
`docs/BITCODE_SOURCE_LAYOUT.md`.

## Layers

```
Shadcn*  →  Bitcode*  →  {Marketing|Packs|Reads|Deposits|Docs|Conversations|Auxillaries}*
```

| Directory | Prefix | Imports from |
| --- | --- | --- |
| `shadcn/` | `Shadcn*` (export rename ongoing) | Radix / primitives only |
| `bitcode/` | `Bitcode*` | Shadcn + theme/packages |
| `marketing/` … `auxillaries/` | Experience prefixes | **Bitcode only** |

## Component unit pattern (required for new work)

```
<ExperienceOrLayer>/<ComponentName>/
  <ComponentName>.tsx       # named entry — not index.tsx
  hooks/
  styles/
  __tests__/
```

- **SRP / DRY** per file.
- Top-of-file overview comment on non-trivial modules.
- Co-located unit tests under `__tests__/`.
- Explicit imports (no grab-bag barrels).

## Experiences

Marketing · Packs · Reads · Deposits · Docs · Conversations · Auxillaries

## Product language

- **Pipeline** — run surfaces (`BitcodePipelinesTable`, logs, selection).
- **Journal** — BTD ledger rows.
- **No product** — cockpit deleted; do not reintroduce.

## Page shells

Live under `apps/uapi/app/<route>/` and **compose** these components. Keep page
clients thin (URL, providers, section layout).

# `uapi/` — Bitcode interface surface

Next.js App Router owner for the commercial website: product routes, thin API
adapters, and React layers.

**Layout contract:** [`../internal-docs/BITCODE_SOURCE_LAYOUT.md`](../internal-docs/BITCODE_SOURCE_LAYOUT.md)  
**This package architecture:** [`ARCHITECTURE.md`](ARCHITECTURE.md)  
**Components:** [`components/README.md`](components/README.md)

## Product routes

| Route | Role |
| --- | --- |
| `/` | Marketing |
| `/deposits` | Deposit MVP (SynthesizeAssetPacks, option review, admit) |
| `/reads` | Read path (Need → Fits → settle → delivery) |
| `/packs` | PackActivity / pipeline history master-detail |
| `/docs` | Public documentation |
| `/auxillaries/*` | Wallet, Externals, Profile, Interfaces |
| `/conversations` | Structure retained; full UX deferred post-V48 |

**Terminal is deleted** — there is no `/terminal` product surface.

## Source layers

```
packages/*          domain (@bitcode/api, btd, auth, pipelines, …)
uapi/components/
  shadcn/           Shadcn* primitives
  bitcode/          Bitcode* base (pipeline, layout, auth, routes)
  <experience>/     Marketing|Packs|Reads|Deposits|Docs|Conversations|Auxillaries
uapi/app/           thin page shells + api/
```

### Component units

```
components/<experience>/<ComponentName>/
  <ComponentName>.tsx    # named file, not index.tsx
  hooks/
  styles/
  __tests__/
```

Page clients under `app/<route>/` only wire URL, providers, and sections.

## Naming

- **Pipeline** — product run UI and history.
- **Journal** — BTD ledger.
- Prefer experience prefixes (`Reads*`, `Deposits*`) and `Bitcode*` base.

## Development

```bash
# from repo root
pnpm install
cd uapi && pnpm dev
cd uapi && pnpm exec jest --config jest.config.cjs
```

Environment: `uapi/.env.example` / team secrets (never commit secrets).

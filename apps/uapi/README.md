# `apps/uapi/` — Bitcode interface surface

Next.js App Router owner for the commercial website: product routes, thin API
adapters, and React layers.

**Layout contract:** [`../../.docs/BITCODE_SOURCE_LAYOUT.md`](../../.docs/BITCODE_SOURCE_LAYOUT.md)  
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
| `/auxillaries/*` | Wallet, Profile, Externals, Interfaces |
| `/conversations` | Structure retained; full UX deferred post-V48 |

Product surfaces: Packs, Deposits, Reads, Docs.

## Source layers

```
packages/*          domain (@bitcode/api, btd, auth, pipelines, …)
apps/uapi/components/
  shadcn/           Shadcn* primitives
  bitcode/          Bitcode* base (pipeline, layout, auth, routes)
  <experience>/     Marketing|Packs|Reads|Deposits|Docs|Conversations|Auxillaries
apps/uapi/app/           thin page shells + api/
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
cd apps/uapi && pnpm dev
cd apps/uapi && pnpm exec jest --config jest.config.cjs
```

Environment: `apps/uapi/.env.example` / team secrets (never commit secrets).

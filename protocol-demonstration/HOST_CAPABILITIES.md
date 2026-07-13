# Bitcode Host Capabilities

Last inspected: 2026-05-17 (America/Sao_Paulo)
Host scope: local machine and Vercel Sandbox capabilities relevant to active V27 canon and V28 draft-target Terminal/Read-Fit pipeline preparation.

## Canon status

- Canonical pointer: `/Users/garrettmaring/Developer/ENGI/BITCODE_SPEC.txt -> V27`
- Current canonical/latest target: `V27`
- Current draft-target family: `V28`
- Current protocol owner: `protocol-demonstration` mounted through `uapi/app/terminal/*`

## Purpose

This document records what the host actually needs to run the current Bitcode Terminal expression, what remains optional, and what is still modeled rather than executed live.

The source of truth for this document is:

- live host inspection commands run on 2026-04-16,
- the current repo implementation in `protocol-demonstration/*` and `uapi/app/terminal/*`,
- the active V27 canonical family,
- and the V28 draft-target family.

## First-gate runtime truth

### Primary review path

The primary review path is the Terminal-owned route:

- `uapi/app/terminal/page.tsx`
- `uapi/app/terminal/TerminalPageClient.tsx`
- `uapi/app/api/*`

This is the route that carries the preserved Bitcode operator UX inside the app shell.
For interface review, the preferred posture is mock mode so Terminal can be reviewed without live external dependencies or real user data.

### Package-local validation path

`protocol-demonstration/server.js` remains useful for package-local validation of the preserved first-gate shell/runtime contract, but it is no longer the primary product review surface.

## Program usage truth

### Required for the current first-gate implementation

The repo needs:

- a local Node runtime,
- filesystem access to the working tree,
- the ability to bind the app server on a local port such as `3000`,
- the ability to serve the package-owned Bitcode shell assets through the app route,
- and, for live Read/Fit pipeline QA, the ability to create a Vercel Sandbox,
  export artifacts, and persist pipeline telemetry to Supabase.

The current real local program usage includes:

- serving the Terminal-owned `/terminal` route,
- serving Terminal-owned JSON contract routes under `uapi/app/api/*`,
- deterministic read derivation and state transitions inside `protocol-demonstration`,
- proof/materialization/accounting artifact assembly,
- the Node-based regression/test stack,
- and Vercel Sandbox AssetPack harness runs that prove phase, agent,
  generation, tool, artifact, and database readback visibility before a Fit can
  graduate beyond blocked-readiness.

### Present on host but not required for core first-gate review

- `python3`
- `rustc`
- `cargo`
- `git`
- `docker`
- `jq`
- `rg`
- `curl`
- `openclaw`
- `codex`

These are useful for inspection, authoring, container work, or upstream experiments, but not required to review the Terminal route.

### Proof-program usage truth

The current first-gate implementation does not require external proof engines at runtime.

Instead it:

- models proof-bearing source material and logs,
- assembles witness-complete proof artifacts locally in Node,
- and treats external proof tooling as upstream evidence producers rather than mandatory runtime dependencies.

### GitHub / remote usage truth

Current first-gate review does not require live GitHub network effects.

Terminal can be reviewed in mock mode without:

- live GitHub App installation auth,
- live workflow artifact fetch,
- branch or PR writes,
- live model execution,
- or live settlement-network effects.

## Required host capability specification

### Hard requirements

- macOS or Linux host with a modern Node runtime
- ability to read and write the repo working tree
- ability to bind a local HTTP server on port `3000` or another chosen app port

### Repo-minimal runtime requirement

- Node.js `v24.14.1`
- npm `11.11.0`

Because the current first-gate review path is Terminal-owned, the practical runtime requirement is:

- `node`
- `npm` or `pnpm`

### Optional but useful local tooling

- `pnpm` for workspace/app commands
- `rg`, `jq`, `curl` for inspection
- `docker` for container validation
- `python3`, `rustc`, `cargo` for upstream experiments outside the core first-gate path
- `openclaw` for local completion notifications

## Available configurations

### `terminal-review-mock`

- working directory: `/Users/garrettmaring/Developer/ENGI/uapi`
- command:
  `NEXT_PUBLIC_MASTER_MOCK_MODE=true NEXT_PUBLIC_ENABLE_MOCKS=true NEXT_PUBLIC_MOCK_USER_ORBITAL=true NEXT_PUBLIC_MOCK_USER_ORBITAL_SCENARIO=demo NEXT_PUBLIC_MOCK_SCENARIO=demo NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS=true NEXT_PUBLIC_MOCK_GITHUB_REPOS=true NEXT_PUBLIC_MOCK_GITHUB_ISSUES=true NEXT_PUBLIC_MOCK_GITHUB_BRANCHES=true NEXT_PUBLIC_MOCK_GITHUB_COMMITS=true NEXT_PUBLIC_MOCK_GITHUB_FILES=true PORT=3000 pnpm dev:remote`
- purpose: primary first-gate review of the Terminal-owned Bitcode route at `/terminal`

### `terminal-review-liveish`

- working directory: `/Users/garrettmaring/Developer/ENGI/uapi`
- command: `PORT=3000 pnpm dev:remote`
- purpose: Terminal-owned route review against current non-mock environment posture

### `asset-pack-sandbox-harness`

- working directory: `/Users/garrettmaring/Developer/ENGI`
- command:
  `BITCODE_RUN_VERCEL_SANDBOX_HARNESS=1 BITCODE_SANDBOX_MODE=asset_pack_pipeline pnpm -C packages/pipeline-hosts run qa:asset-pack:sandbox`
- purpose: live host execution proof for Read/Fit and AssetPack synthesis in an
  isolated Vercel Sandbox.
- required auth:
  - local development: `VERCEL_OIDC_TOKEN` from `vercel link && vercel env pull`;
  - external hosts: `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`;
  - deployed Vercel code: automatic OIDC when available.
- required model credential for real inference: `OPENAI_API_KEY`.
- required staging-testnet inference posture:
  `BITCODE_ASSET_PACK_REAL_INFERENCE=1`. This forces PTRR-capable AssetPack
  setup, discovery, synthesis, validation, and Finish agents to use model-backed
  inference instead of deterministic bring-up evidence.
- deployed route runtime budget:
  `POST /api/pipeline-host/asset-pack` declares an 800 second Node.js
  function window; keep `BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS` at or below
  `600000` on that route so timeout artifacts can be collected before the host
  terminates. The deployed route preflight-fails when real inference, model
  credentials, or this budget bound are missing.
- deployed trigger:
  authenticated `POST /api/pipeline-host/asset-pack` streams host events
  (`harness-started`, `harness-event`, `harness-completed` or
  `harness-failed`) while the same package harness runs under Vercel automatic
  Sandbox OIDC. Private repository source clone uses either explicit source
  token env or the authenticated user's GitHub installation token.
- required readback:
  `supabase/queries/v28_qa_terminal_07_pipeline_harness_after_fit.sql` must
  show run/event/phase/agent/generation/tool telemetry before Read/Fit result
  review.

### `package-runtime-validation`

- working directory: `/Users/garrettmaring/Developer/ENGI/protocol-demonstration`
- command: `npm start`
- purpose: package-local validation of the preserved first-gate shell/runtime carrier

### `package-test`

- working directory: `/Users/garrettmaring/Developer/ENGI/protocol-demonstration`
- command: `npm test`
- purpose: deterministic regression validation of the package-owned Bitcode runtime

### `docker-runtime-validation`

- build command: `docker build -t bitcode-first-gate .`
- run command: `docker run --rm -p 4318:4318 -e HOST=0.0.0.0 bitcode-first-gate`
- purpose: containerized validation of the package-local runtime carrier

## Telemetry and safety

Current repo truth relevant to host safety:

- state writes are atomic via temp-file plus rename,
- request bodies are capped,
- path traversal is blocked,
- public/API projection defaults are explicit,
- private branch/source material remains withheld from public projection,
- first-gate Terminal review can run entirely in mock mode without requiring production credentials,
- and live Vercel Sandbox runs must not claim AssetPack ranges, BTC fees,
  ledger anchors, settlement, or finality unless Supabase/ledger readback rows
  agree.

Operational implication:

- the host does not read secret production credentials to review first-gate Terminal behavior,
- and the package-local runtime path should be described as validation posture rather than primary product carriage.

## Remote assumptions and boundaries

The current system still models, rather than fully executes live:

- GitHub App installation auth,
- workflow artifact fetch by run ID,
- branch / PR / review writes,
- remote model execution,
- external vector store operations,
- signer verification against external authorities,
- and settlement-network effects.

These remain outside Terminal shell review, but V28 Read/Fit QA now requires the
pipeline harness to show explicit blocked-readiness when any of them are absent.

## 2026-05-17 Vercel Sandbox Read/Fit Observation

The V28 `asset-pack-sandbox-harness` has now run a full staging-testnet
Read/Fit and AssetPack synthesis path inside Vercel Sandbox using a QA-only
source overlay:

- sandbox id: `sbx_ktb5Z6VnP5A16m9k4a0FkBcJg1d3`
- pipeline run id: `d21240bd-ebc7-41ae-b082-06d7beb244a7`
- result: `pipelineResultState='worthy_fit'`,
  `resultState='blocked_readiness'`
- reason for final block: source overlay evidence is not admissible for BTD
  minting, BTC fee settlement, ledger anchor finality, or source-revision
  settlement
- DB readback: completed `pipeline_runs` and `deliverable_pipeline_runs`, 603
  events, 12 completed phase rows, 40 completed agent-step rows, and no running
  phase or agent rows for the run
- ledger readback: zero BTD range, BTC fee, journal, anchor, and crypto
  telemetry rows; `btd_supply_state.total_minted=0`

The observed AssetPack evidence was source-bound to
`engineeredsoftware/ENGI@main@4ced69180958143254639a8a5af94c0991545a91`,
selected candidate `manual-deposit-qa`, query root
`sha256:1d58f3d0e16af0700a702b2b307c744145a9196ac63841345a20ff597f5a3ca3`,
ranking root
`sha256:c04599ac4782dadf3b63842381dd20c76f577401cc35d82fbee4a63797496aa1`,
and embedding policy `openai text-embedding-3-small` with 1536-dimensional
cosine matching through `match_deliverable_vectors`.

Clean source-revision settlement remains unobserved until the same harness and
pipeline changes are deployed without `BITCODE_SANDBOX_APPLY_LOCAL_PATCH=1`.
Only that no-overlay source-revision run may claim BTD minting, BTC fee
settlement, ledger anchoring, or finality.

## Containerization

This package includes:

- `Dockerfile`
- `.dockerignore`

Container scope is intentionally narrow:

- run the package-local Node server,
- run the Node tests,
- and validate the preserved first-gate carrier.

Container scope does not imply:

- production deployment posture,
- live GitHub/App operations,
- external proof-engine execution,
- or promoted V26 closure.

## Inspection commands used

- `date +%Y-%m-%d`
- `uname -srmo`
- `node -v`
- `npm -v`
- `pnpm -v`
- `git remote get-url origin`
- `command -v docker`
- `command -v gh`
- `command -v openclaw`

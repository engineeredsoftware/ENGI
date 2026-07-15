# Vercel in Bitcode

**Role:** commercial web deploy host for `apps/uapi`, ephemeral **pipeline
sandbox** compute (`@vercel/sandbox` + Pipeliner image), optional **Blob**
artifact storage, product **Web Analytics**, and optional external Vercel API /
MCP tooling.

Related: [`DEPLOYMENT.md`](./DEPLOYMENT.md),
[`containers/images/pipeliner/README.md`](../containers/images/pipeliner/README.md),
[`packages/generic-hosts/README.md`](../packages/generic-hosts/README.md).

---

## 1. Surfaces overview

| Surface | Package / path | Purpose |
| --- | --- | --- |
| **Next deploy** | `apps/uapi` on Vercel | Production/preview website + API routes |
| **Sandbox host** | `@bitcode/generic-hosts-vercel-sandbox`, `@bitcode/pipeline-hosts` | Firecracker microVMs for deposit/read pipeline work |
| **Host primitive** | `@bitcode/host-generics` `VercelSandboxHost` | SandboxHost provider (distinct from pipeline host runner) |
| **Pipeliner image** | `containers/images/pipeliner` | OCI image on `vcr.vercel.com/…/pipeliner` for `Sandbox.create({ image })` |
| **Blob storage** | `@bitcode/generic-artifacts-vercel-provider` | ArtifactStorage backend (third in compose order) |
| **Analytics** | `@vercel/analytics`, `@bitcode/external-telemetry-vercel` | Product event fan-out with GA4 |
| **External API / MCP** | `@bitcode/externals-vercel`, `@bitcode/generic-tools-mcps-vercel` | Deployment API + agent MCP tools |
| **ChatGPT tools** | `apps/chatgpt` | `use_vercel_read` / `use_vercel_write` style tools |

---

## 2. Pipeline host: Vercel Sandbox

### Law (host selection)

- `BITCODE_PIPELINE_HOST=local` — default on developer machines (`LocalHost`).
- `BITCODE_PIPELINE_HOST=sandbox` (or serverless/deploy policy) — **Vercel Sandbox**.
- LocalHost must not be used as the production always-on path for untrusted customer clone/work.

### Packages

| Package | Role |
| --- | --- |
| `packages/host-generics` | `SandboxHost` abstract + **`VercelSandboxHost`** implementation |
| `packages/generic-hosts/VercelSandbox` | **`VercelSandboxPipelineHost`** — plan runner / in-box pipeline; re-exports host primitive |
| `packages/pipeline-hosts` | Product host wiring, constants, `run-asset-pack-sandbox-host`, tests |

Dependency: `@vercel/sandbox` (pinned in workspace packages).

### Image + create

When `BITCODE_PIPELINE_SANDBOX_IMAGE` is set (or host option `sandboxImage`):

1. Host authenticates to Vercel (OIDC on Vercel deploys, or token + team/project).
2. `Sandbox.create({ image: … })` — **image-only**; customer git clone is **not**
   done as Sandbox.create git source (Host law: Setup/in-box clone).
3. Pipeliner image materializes monorepo packages + runners for deposit/read synthesis.

**Registry:** `vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner`  
**Build:** `containers/images/pipeliner` (`@bitcode/pipeline-image`).

### Auth env (sandbox)

| Variable | Role |
| --- | --- |
| `VERCEL_OIDC_TOKEN` | Preferred on Vercel-hosted deploys |
| `VERCEL_TOKEN` + `VERCEL_TEAM_ID` + `VERCEL_PROJECT_ID` | Local/CI push/login and non-OIDC create |
| `BITCODE_PIPELINE_SANDBOX_IMAGE` | Full image ref for Sandbox.create |
| `BITCODE_PIPELINE_HOST` | `local` \| `sandbox` |
| `BITCODE_RUN_VERCEL_SANDBOX_HARNESS` | Opt-in harness/rehearsal flags |
| `BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS` | Runtime bounds for host plans |

Failure telemetry for sandbox create/run is surfaced through deposit pipeline UI
(host failure formatting)—do not swallow create errors as empty validation.

---

## 3. App deploy (`apps/uapi`)

- Next.js App Router commercial site: packs, reads, deposits, docs, conversations, auxillaries, APIs.
- Vercel project **Root Directory** must be `apps/uapi` after monorepo reorg.
- Serverless/edge constraints: force sandbox host on serverless; LocalHost is local-only.

Env of interest (non-exhaustive): public product flags, Supabase public keys,
pipeline host env, analytics IDs. Prefer Vercel project env + `vercel env pull`
for local secrets.

---

## 4. Artifact storage (Vercel Blob)

| Package | Role |
| --- | --- |
| `packages/generic-artifacts/vercel-provider` | Vercel Blob `ArtifactStorage` |
| `packages/generic-artifacts/compose` | Resolve storage: **AWS → Supabase → Vercel** |

Used when Blob credentials are present and higher-priority providers are not.

---

## 5. Analytics

| Package / app | Role |
| --- | --- |
| `@vercel/analytics` | Browser/server `track` |
| `packages/external-telemetry/vercel` | Adapter (`trackVercelAnalytics`) |
| `packages/observability` | Product analytics fan-out (Vercel + GA4) |
| `apps/uapi/lib/product-analytics.ts` | App-level product events (must never break UX if analytics blocked) |

Tests: `apps/uapi/tests/productAnalytics.test.ts` (both stacks).

---

## 6. Externals and agent tools

| Package | Role |
| --- | --- |
| `packages/externals/vercel` | Vercel deployment REST/API client surface |
| `packages/generic-tools/mcps-tools/vercel` | MCP DocCode tool prompts for Vercel |
| `apps/chatgpt/src/tools.ts` | ChatGPT tools: read/write external Vercel MCP actions |

These are **customer/operator tooling** against Vercel projects—not the pipeline
sandbox host, though they share the same cloud vendor.

---

## 7. Containers / CI touchpoints

| Path | Role |
| --- | --- |
| `containers/images/pipeliner/` | Dockerfile, materialize, README for VCR image |
| `containers/Dockerfile.long-runner*` | Long-runner worker images (k8 fleet; may run outside Vercel) |
| `.github/workflows/*` | May build/push images or deploy; gate checks reference Dockerfile paths under `containers/` |
| Gate/rehearsal scripts | Assert sandbox env keys present without serializing secrets |

---

## 8. What Vercel is **not**

- Not the commercial Postgres/auth system of record (that is Supabase; see `SUPABASE.md`).
- Not the Bitcoin fee rail.
- Not the ERC1155 settlement contract runtime (Ethereum dual-maintain; see `ETHEREUM.md`).
- LocalHost is not a substitute for sandbox on always-on cloud deploys.

---

## 9. Operator checklist

When changing Vercel usage:

1. **Host law** — image-only create; clone in Setup; fail-closed auth.
2. **Image pin** — prefer digest/tag pins in production (`BITCODE_PIPELINE_SANDBOX_IMAGE`).
3. **Root directory** — Vercel project root stays `apps/uapi`.
4. **Secrets** — OIDC preferred; never log `VERCEL_TOKEN` / OIDC in proofs.
5. **Compose order** — understand AWS/Supabase/Blob precedence for artifacts.
6. **Analytics** — fail open; do not block product paths.

### Common commands

```bash
# Materialize + build Pipeliner (from monorepo root)
pnpm --filter @bitcode/pipeline-image run materialize
docker build -f containers/images/pipeliner/Dockerfile \
  -t vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest .

# Local uapi (not sandbox by default)
pnpm run dev:remote
```

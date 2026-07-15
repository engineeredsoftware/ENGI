# @bitcode/pipeline-image

Vercel Sandbox **pipeline appliance** for deposit/read synthesis.

Production sandboxes should use a **VCR custom image** (`Sandbox.create({ image })`)
that already contains Bitcode monorepo packages and in-box runners, instead of a
stock `node24` runtime that cannot install the monorepo on every run.

## Layout (in image)

| Path | Role |
|------|------|
| `/opt/bitcode` | Bitcode monorepo root (`BITCODE_MONOREPO_ROOT`) |
| `/opt/bitcode/pipeline/run-pipeline.mjs` | Dispatcher entry |
| `/opt/bitcode/.bitcode/pipeline-host/*.mjs` | Host-smoke + live runners (`../../packages` resolves) |
| `/vercel/sandbox` | Customer git checkout + run manifest/artifacts |

## Host law

| Runtime | Host |
|---------|------|
| **Local machine** (laptop, full FS) | **LocalHost** by default — optional `BITCODE_PIPELINE_HOST=sandbox` to exercise boxes |
| **Serverless** (Vercel Production/Preview) | **Always sandbox** — LocalHost is never used (`VERCEL=1` forces sandbox) |

LocalHost cannot run deposit/read pipelines on serverless. Serverless always spawns a Sandbox microVM; prefer a VCR pipeline image for cold-start cost.

## Env (Production)

```bash
# Host is auto-sandbox on Vercel; still fine to set explicitly:
BITCODE_PIPELINE_HOST=sandbox
BITCODE_PIPELINE_SANDBOX_IMAGE=bitcode-pipeline:v48-<gitsha>
# or full ref:
# BITCODE_PIPELINE_SANDBOX_IMAGE=vcr.vercel.com/<team>/<project>/bitcode-pipeline:v48-<gitsha>

# Auth (one of):
# VERCEL_OIDC_TOKEN (auto on Vercel) or
VERCEL_TOKEN=…
VERCEL_TEAM_ID=…
VERCEL_PROJECT_ID=…
```

## Local materialize

```bash
pnpm --filter @bitcode/pipeline-image run materialize
# → packages/pipeline-image/dist/{run-pipeline,run-host-smoke,run-live-…}.mjs
```

## Docker build (from monorepo root)

```bash
docker build -f packages/pipeline-image/Dockerfile -t bitcode-pipeline:local .
```

## VCR push

```bash
# After vercel link + env pull (OIDC) or VERCEL_TOKEN login:
printf '%s' "$VERCEL_OIDC_TOKEN" | docker login vcr.vercel.com --username oidc --password-stdin

docker buildx build \
  --platform linux/amd64 \
  -f packages/pipeline-image/Dockerfile \
  -t "vcr.vercel.com/$TEAM_SLUG/$PROJECT_SLUG/bitcode-pipeline:v48-$GIT_SHA" \
  --push \
  .
```

## Host plan behavior

When `BITCODE_PIPELINE_SANDBOX_IMAGE` is set, `buildAssetPackSandboxHostPlan`:

- sets `createOptions.image` (no `runtime`)
- writes only the run **manifest** (+ optional overlay) into the customer workspace
- runs `node $BITCODE_PIPELINE_IMAGE_ENTRY` (default `/opt/bitcode/pipeline/run-pipeline.mjs`)
- skips monorepo `pnpm install` inside the sandbox

## Modes

| `BITCODE_PIPELINE_HOST_MODE` | Runner |
|------------------------------|--------|
| `host_smoke` | `run-host-smoke.mjs` |
| `asset_pack_pipeline` | `run-live-asset-pack-pipeline.mjs` (deposit/read via manifest `synthesizeMode`) |

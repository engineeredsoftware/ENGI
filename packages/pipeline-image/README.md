# Pipeliner (`@bitcode/pipeline-image`)

**Pipeliner** is Bitcode’s **pipeline appliance** container image for AssetPack
**deposit** and **read** synthesis.

| | |
|--|--|
| **VCR repository** | `vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner` |
| **Purpose** | Run the AssetPack SDIVF pipeline **inside a Vercel Sandbox** (or local Docker) with Bitcode packages and runners preinstalled |
| **Not for** | LocalHost-on-serverless (illegal). LocalHost remains laptop-only without Docker unless you explicitly run Pipeliner via Docker for parity |
| **Consumers** | `BITCODE_PIPELINE_HOST` → sandbox + `BITCODE_PIPELINE_SANDBOX_IMAGE` → `Sandbox.create({ image })` |

## Why Pipeliner exists

On serverless, synthesis always spawns a **Sandbox** microVM. Stock `node24`
runtimes force cold install of the monorepo (slow/fragile). Pipeliner bakes
Bitcode’s host runners + workspace packages into an OCI image so each run:

1. Creates a sandbox from **Pipeliner** (`image`, not stock `runtime`) — **no**
   `source: git` on create (create-time customer clone is outside the pipeline
   and failed production with `bad_request: git clone failed`)
2. Writes only the run **manifest** (+ host env including `BITCODE_HOST_CLONE_*`)
3. Runs `node /opt/bitcode/pipeline/run-pipeline.mjs`
4. **Setup** clone-repository agent multi-step clones the **customer** repo
   **inside the box** (branch shallow + optional pin commit) using the install
   token — never in the serverless function process
5. Streams telemetry / writes evidence, then stop + delete (ephemeral)

Host law: serverless dispatches only; Pipeliner is the program; customer source
is Setup’s job inside the sandbox.

## Image layout

| Path | Role |
|------|------|
| `/opt/bitcode` | Bitcode monorepo root (`BITCODE_MONOREPO_ROOT`) |
| `/opt/bitcode/pipeline/run-pipeline.mjs` | Dispatcher (`host_smoke` \| `asset_pack_pipeline`) |
| `/opt/bitcode/.bitcode/pipeline-host/*.mjs` | Host-smoke + live runners |
| `/vercel/sandbox` | Customer git checkout + run artifacts |

## Production env

```bash
# Serverless always uses sandbox (VERCEL=1). Image selects Pipeliner:
BITCODE_PIPELINE_SANDBOX_IMAGE=vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest
# Prefer sha tags after CI push:
# BITCODE_PIPELINE_SANDBOX_IMAGE=vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:v48-<sha>

# Optional override:
# BITCODE_PIPELINE_IMAGE_ENTRY=/opt/bitcode/pipeline/run-pipeline.mjs

# Sandbox create auth (one of):
# VERCEL_OIDC_TOKEN (auto on Vercel deploys)
# or VERCEL_TOKEN + VERCEL_TEAM_ID + VERCEL_PROJECT_ID
```

## Authenticate Docker → VCR

```bash
# From linked Bitcode project root:
vercel link
vercel env pull .env.local
source .env.local

printf '%s' "$VERCEL_OIDC_TOKEN" | docker login vcr.vercel.com \
  --username oidc \
  --password-stdin
```

Token auth alternative:

```bash
printf '%s' "$VERCEL_TOKEN" | docker login vcr.vercel.com \
  --username "$VERCEL_TEAM_ID" \
  --password-stdin
```

## Build & push (from monorepo root)

```bash
pnpm --filter @bitcode/pipeline-image run materialize

GIT_SHA=$(git rev-parse --short HEAD)
IMAGE=vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner

docker build \
  -f packages/pipeline-image/Dockerfile \
  -t "${IMAGE}:latest" \
  -t "${IMAGE}:v48-${GIT_SHA}" \
  .

docker push --all-tags "${IMAGE}"
```

Buildx + zstd (recommended by Vercel):

```bash
docker buildx build \
  --platform linux/amd64 \
  -f packages/pipeline-image/Dockerfile \
  --output "type=image,name=${IMAGE}:latest,push=true,oci-mediatypes=true,compression=zstd,compression-level=3,force-compression=true" \
  --output "type=image,name=${IMAGE}:v48-${GIT_SHA},push=true,oci-mediatypes=true,compression=zstd,compression-level=3,force-compression=true" \
  .
```

## Local validation (align with Production)

```bash
# After build:
docker run --rm \
  -e BITCODE_PIPELINE_HOST_MODE=host_smoke \
  -e BITCODE_MONOREPO_ROOT=/opt/bitcode \
  -e BITCODE_PIPELINE_HOST_MANIFEST=/tmp/manifest.json \
  -e BITCODE_PIPELINE_HOST_ARTIFACT_DIR=/tmp/artifacts \
  -v "$PWD/packages/pipeline-image/fixtures/smoke-manifest.json:/tmp/manifest.json:ro" \
  vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest
```

Or run host-smoke without a full customer clone to verify the entrypoint.

## Host plan behavior

When `BITCODE_PIPELINE_SANDBOX_IMAGE` is set (or `sandboxImage` option):

- `createOptions.image` is set; **no** stock `runtime`
- `writeFiles`: **manifest only** (+ optional source overlay)
- Commands: `node $BITCODE_PIPELINE_IMAGE_ENTRY` (default Pipeliner entry)
- Skips in-box monorepo `pnpm install`

## Modes

| `BITCODE_PIPELINE_HOST_MODE` | Runner |
|------------------------------|--------|
| `host_smoke` | `run-host-smoke.mjs` |
| `asset_pack_pipeline` | `run-live-asset-pack-pipeline.mjs` (`synthesizeMode` deposit \| read in manifest) |

## CI

`.github/workflows/pipeline-image.yml` materializes runners and `docker build`s.
Optional VCR push on `workflow_dispatch` with secrets + `BITCODE_PIPELINE_VCR_IMAGE`
set to `vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner`.

# Bitcode pipeline appliance image for Vercel Sandbox (VCR).
# Create sandboxes with: Sandbox.create({ image: 'bitcode-pipeline:<tag>', … })
# not stock runtime + monorepo install.
#
# Build from monorepo root:
#   docker build -f packages/pipeline-image/Dockerfile -t bitcode-pipeline:local .

FROM node:24-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /opt/bitcode

# Minimal system deps for git clone of customer sources inside the sandbox.
RUN apt-get update \\
  && apt-get install -y --no-install-recommends git ca-certificates \\
  && rm -rf /var/lib/apt/lists/*

# Copy workspace manifests first for better layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages/pipeline-hosts/package.json packages/pipeline-hosts/
COPY packages/pipeline-image/package.json packages/pipeline-image/
COPY packages/host-generics/package.json packages/host-generics/
COPY packages/generic-hosts/Local/package.json packages/generic-hosts/Local/
COPY packages/generic-hosts/VercelSandbox/package.json packages/generic-hosts/VercelSandbox/

# Remaining packages (filter install still needs workspace graph).
COPY packages ./packages

# Install workspace deps used by host + pipeline runners.
RUN pnpm install --frozen-lockfile \\
  --filter @bitcode/pipeline-hosts... \\
  --filter @bitcode/pipeline-image... \\
  --filter @bitcode/asset-packs-pipelines-domain... \\
  --filter @bitcode/pipelines-generics... \\
  --filter @bitcode/btd... \\
  --filter @bitcode/supabase... \\
  || pnpm install --frozen-lockfile

# Materialize runners + dispatcher into dist, then install image layout paths.
RUN pnpm --filter @bitcode/pipeline-image run materialize \\
  && mkdir -p /opt/bitcode/.bitcode/pipeline-host /opt/bitcode/pipeline \\
  && cp packages/pipeline-image/dist/run-host-smoke.mjs /opt/bitcode/.bitcode/pipeline-host/ \\
  && cp packages/pipeline-image/dist/run-live-asset-pack-pipeline.mjs /opt/bitcode/.bitcode/pipeline-host/ \\
  && cp packages/pipeline-image/dist/run-pipeline.mjs /opt/bitcode/pipeline/run-pipeline.mjs

ENV BITCODE_MONOREPO_ROOT=/opt/bitcode
ENV BITCODE_PIPELINE_IMAGE_ENTRY=/opt/bitcode/pipeline/run-pipeline.mjs
WORKDIR /vercel/sandbox

# Default command documents the entry; host plans pass runCommand explicitly.
CMD ["node", "/opt/bitcode/pipeline/run-pipeline.mjs"]

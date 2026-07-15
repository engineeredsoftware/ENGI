# Pipeliner — Bitcode pipeline appliance for Vercel Sandbox (VCR).
# Repository: vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner
#
# Purpose: deposit/read AssetPack synthesis inside Sandbox microVMs with
# Bitcode packages + runners preinstalled (not stock node24 + monorepo install).
#
# Build from monorepo root (materialize first):
#   pnpm --filter @bitcode/pipeline-image run materialize
#   docker build -f containers/containers/images/pipeliner/Dockerfile \
#     -t vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest .

FROM node:24-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /opt/bitcode

# Minimal system deps for git clone of customer sources inside the sandbox.
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Workspace manifests + packages + pipeliner image package
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages ./packages
COPY containers/containers/images/pipeliner ./containers/containers/images/pipeliner

# Install workspace (filter when possible; full install fallback).
RUN pnpm install --frozen-lockfile \
  --filter @bitcode/pipeline-hosts... \
  --filter @bitcode/pipeline-image... \
  --filter @bitcode/asset-packs-pipelines-domain... \
  --filter @bitcode/pipelines-generics... \
  --filter @bitcode/btd... \
  --filter @bitcode/supabase... \
  || pnpm install --frozen-lockfile

# Pre-materialized runners (built on host/CI before docker build).
# Layout preserves live-runner relative imports: ../../packages → monorepo packages.
RUN mkdir -p /opt/bitcode/.bitcode/pipeline-host /opt/bitcode/pipeline \
  && cp containers/containers/images/pipeliner/dist/run-host-smoke.mjs /opt/bitcode/.bitcode/pipeline-host/ \
  && cp containers/containers/images/pipeliner/dist/run-live-asset-pack-pipeline.mjs /opt/bitcode/.bitcode/pipeline-host/ \
  && cp containers/containers/images/pipeliner/dist/run-pipeline.mjs /opt/bitcode/pipeline/run-pipeline.mjs

ENV BITCODE_MONOREPO_ROOT=/opt/bitcode
ENV BITCODE_PIPELINE_IMAGE_ENTRY=/opt/bitcode/pipeline/run-pipeline.mjs
WORKDIR /vercel/sandbox

CMD ["node", "/opt/bitcode/pipeline/run-pipeline.mjs"]

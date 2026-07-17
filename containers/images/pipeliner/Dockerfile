# Pipeliner — Bitcode pipeline appliance for Vercel Sandbox (VCR).
# Repository: vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner
#
# Purpose: deposit/read AssetPack synthesis inside Sandbox microVMs with
# Bitcode packages + runners + multi-language LSP servers preinstalled.
#
# Build from monorepo root (materialize first):
#   pnpm --filter @bitcode/pipeline-image run materialize
#   docker build -f containers/images/pipeliner/Dockerfile \
#     -t vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest .

FROM node:24-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /opt/bitcode

# git for customer clone + native language servers (non-npm).
# npm language servers ship as deps of @bitcode/lsp (see package.json).
# BITCODE_PIPELINE_LSP_PROFILE=full (default) installs JVM/jdtls/kotlin/.NET/OmniSharp.
ARG BITCODE_PIPELINE_LSP_PROFILE=full
ENV BITCODE_PIPELINE_LSP_PROFILE=${BITCODE_PIPELINE_LSP_PROFILE}
COPY containers/images/pipeliner/scripts/install-language-servers.sh \
  /tmp/install-language-servers.sh
RUN chmod +x /tmp/install-language-servers.sh \
  && /tmp/install-language-servers.sh \
  && rm -f /tmp/install-language-servers.sh

ENV PATH="/usr/local/go/bin:/opt/dotnet:/usr/local/bin:${PATH}"
ENV GOPATH=/opt/go
ENV GOBIN=/usr/local/bin
ENV DOTNET_ROOT=/opt/dotnet
ENV JDTLS_HOME=/opt/jdtls

# Workspace manifests + packages + pipeliner image package
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc* ./
COPY packages ./packages
COPY containers/images/pipeliner ./containers/images/pipeliner

# Install workspace (filter when possible; full install fallback).
# Explicit @bitcode/lsp pulls bundled npm language servers into the image.
RUN pnpm install --frozen-lockfile \
  --filter @bitcode/pipeline-hosts... \
  --filter @bitcode/pipeline-image... \
  --filter @bitcode/asset-packs-pipelines-domain... \
  --filter @bitcode/asset-packs-pipelines-syntheses-domain... \
  --filter @bitcode/lsp... \
  --filter @bitcode/pipelines-generics... \
  --filter @bitcode/btd... \
  --filter @bitcode/supabase... \
  || pnpm install --frozen-lockfile

# Pre-materialized runners (built on host/CI before docker build).
# Layout preserves live-runner relative imports: ../../packages → monorepo packages.
RUN mkdir -p /opt/bitcode/.proofs/pipeline-host /opt/bitcode/pipeline \
  && cp containers/images/pipeliner/dist/run-host-smoke.mjs /opt/bitcode/.proofs/pipeline-host/ \
  && cp containers/images/pipeliner/dist/run-live-asset-pack-pipeline.mjs /opt/bitcode/.proofs/pipeline-host/ \
  && cp containers/images/pipeliner/dist/run-pipeline.mjs /opt/bitcode/pipeline/run-pipeline.mjs

ENV BITCODE_MONOREPO_ROOT=/opt/bitcode
ENV BITCODE_PIPELINE_IMAGE_ENTRY=/opt/bitcode/pipeline/run-pipeline.mjs
WORKDIR /vercel/sandbox

CMD ["node", "/opt/bitcode/pipeline/run-pipeline.mjs"]

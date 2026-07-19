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
# Include synthesis product packages + tools-generics so live-runner file://
# imports can resolve workspace deps under pnpm (not only TypeScript path maps).
RUN pnpm install --frozen-lockfile \
  --filter @bitcode/pipeline-hosts... \
  --filter @bitcode/pipeline-image... \
  --filter @bitcode/asset-packs-pipelines-domain... \
  --filter @bitcode/asset-packs-pipelines-syntheses-domain... \
  --filter @bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs... \
  --filter @bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs... \
  --filter @bitcode/lsp... \
  --filter @bitcode/pipelines-generics... \
  --filter @bitcode/tools-generics... \
  --filter @bitcode/agent-generics... \
  --filter @bitcode/execution-generics... \
  --filter @bitcode/btd... \
  --filter @bitcode/supabase... \
  || pnpm install --frozen-lockfile

# Pre-materialized runners (built on host/CI before docker build).
# Layout preserves live-runner relative imports: ../../packages → monorepo packages.
RUN mkdir -p /opt/bitcode/.proofs/pipeline-host /opt/bitcode/pipeline \
  && cp containers/images/pipeliner/dist/run-host-smoke.mjs /opt/bitcode/.proofs/pipeline-host/ \
  && cp containers/images/pipeliner/dist/run-live-asset-pack-pipeline.mjs /opt/bitcode/.proofs/pipeline-host/ \
  && cp containers/images/pipeliner/dist/run-pipeline.mjs /opt/bitcode/pipeline/run-pipeline.mjs

# tsx must be loadable for the live AssetPack runner (imports monorepo .ts).
# pnpm keeps it under packages/pipeline-hosts; host plan resolves that path.
# Assert at image build so a missing dep fails the image, not a stuck sandbox.
RUN test -f packages/pipeline-hosts/node_modules/tsx/dist/loader.mjs \
  || test -f node_modules/tsx/dist/loader.mjs \
  || (echo "pipeliner image missing tsx loader (pipeline-hosts dep)" >&2 && exit 1)

# Live runner imports these absolute .ts paths (current syntheses/ layout law).
# Fail the image build if the tree is the pre-split layout — otherwise sandboxes
# die at import with "Cannot find module .../syntheses/domain/...".
RUN test -f packages/asset-packs-pipelines/syntheses/domain/src/index.ts \
  && test -f packages/asset-packs-pipelines/syntheses/deposit/src/index.ts \
  && test -f packages/asset-packs-pipelines/syntheses/read/src/index.ts \
  && test -f packages/asset-packs-pipelines/domain/src/index.ts \
  && test -f packages/pipelines-generics/src/index.ts \
  && test -f packages/tools-generics/src/index.ts \
  && test -f packages/btd/src/settlement.ts \
  || (echo "pipeliner image missing live-runner monorepo sources (syntheses/ layout)" >&2 && exit 1)

# Workspace package resolution must work under pnpm for file:// + tsx loads.
RUN test -e packages/pipelines-generics/node_modules/@bitcode/tools-generics \
  || test -e node_modules/@bitcode/tools-generics \
  || (echo "pipeliner image missing @bitcode/tools-generics link for pipelines-generics" >&2 && exit 1)

# btd → supabase is on the live deposit import path; assert the workspace link.
RUN test -e packages/btd/node_modules/@bitcode/supabase \
  || test -e node_modules/@bitcode/supabase \
  || (echo "pipeliner image missing @bitcode/supabase link for btd" >&2 && exit 1)

# In-package sources must not self-import the package name (pnpm has no self-link;
# sandbox tsx file:// load of index.ts → streams.ts used to fail here).
RUN ! grep -R --include='*.ts' -E "from ['\"]@bitcode/supabase['\"]" packages/supabase/src \
  || (echo "packages/supabase must not self-import @bitcode/supabase (use relative ./clients)" >&2 && exit 1)

ENV BITCODE_MONOREPO_ROOT=/opt/bitcode
ENV BITCODE_PIPELINE_IMAGE_ENTRY=/opt/bitcode/pipeline/run-pipeline.mjs
WORKDIR /vercel/sandbox

CMD ["node", "/opt/bitcode/pipeline/run-pipeline.mjs"]

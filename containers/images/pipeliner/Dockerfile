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
# Install is split across RUN layers so no single registry blob exceeds VCR's
# per-blob limit (a monolithic install produced an ~885MB layer → 413).
ARG BITCODE_PIPELINE_LSP_PROFILE=full
ENV BITCODE_PIPELINE_LSP_PROFILE=${BITCODE_PIPELINE_LSP_PROFILE}
COPY containers/images/pipeliner/scripts/install-language-servers.sh \
  /tmp/install-language-servers.sh
RUN chmod +x /tmp/install-language-servers.sh \
  && BITCODE_LSP_INSTALL_PHASE=base /tmp/install-language-servers.sh
RUN BITCODE_LSP_INSTALL_PHASE=go /tmp/install-language-servers.sh
RUN BITCODE_LSP_INSTALL_PHASE=default-bins /tmp/install-language-servers.sh
RUN BITCODE_LSP_INSTALL_PHASE=full-jvm /tmp/install-language-servers.sh
RUN BITCODE_LSP_INSTALL_PHASE=full-dotnet /tmp/install-language-servers.sh
RUN BITCODE_LSP_INSTALL_PHASE=smoke /tmp/install-language-servers.sh \
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
  --filter @bitcode/generic-tools-repository-setup... \
  || pnpm install --frozen-lockfile

# Project-wide: expose every workspace package at root node_modules/@bitcode/*
# (+ per-package self-links) so absolute .ts loads under tsx resolve package
# names the same way a bundled app would. Relative-import hotfixes alone are
# not enough — any package can import any @bitcode/* peer mid-graph.
ENV BITCODE_MONOREPO_ROOT=/opt/bitcode
RUN node containers/images/pipeliner/scripts/link-workspace-packages.mjs

# Source-only packages declare exports to .js that are gitignored / not in the
# image. Rewrite missing .js targets to sibling .ts so tsx can load the graph
# (execution-generics/Execution.js is the classic failure).
RUN node containers/images/pipeliner/scripts/rewrite-package-exports-for-tsx.mjs

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

# Root hoist + self-link for the deposit import chain (btd → supabase → streams).
RUN test -e node_modules/@bitcode/supabase \
  && test -e node_modules/@bitcode/btd \
  && test -e packages/supabase/node_modules/@bitcode/supabase \
  || (echo "pipeliner image missing root/self workspace links for supabase/btd" >&2 && exit 1)

# Smoke: live runner path — domain + pipelines-generics (pulls tools/execution
# graph that previously failed on Execution.js exports).
RUN LOADER="packages/pipeline-hosts/node_modules/tsx/dist/loader.mjs" \
  && test -f "$LOADER" \
  && node --import "./$LOADER" -e "\
import { pathToFileURL } from 'url'; \
const load = async (rel) => { \
  const p = pathToFileURL(process.cwd() + '/' + rel).href; \
  const mod = await import(p); \
  if (!mod) throw new Error('empty import ' + rel); \
  return mod; \
}; \
await load('packages/asset-packs-pipelines/domain/src/index.ts'); \
await load('packages/pipelines-generics/src/index.ts'); \
await load('packages/execution-generics/src/Execution.ts'); \
console.log('pipeliner domain+pipelines-generics+Execution smoke ok'); \
"

ENV BITCODE_MONOREPO_ROOT=/opt/bitcode
ENV BITCODE_PIPELINE_IMAGE_ENTRY=/opt/bitcode/pipeline/run-pipeline.mjs
WORKDIR /vercel/sandbox

CMD ["node", "/opt/bitcode/pipeline/run-pipeline.mjs"]

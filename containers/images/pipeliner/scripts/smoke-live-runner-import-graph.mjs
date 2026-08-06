#!/usr/bin/env node
/**
 * Production-path import smoke for the live AssetPack host runner.
 *
 * Mirrors packages/pipeline-hosts importMonorepoModule Promise.all candidates
 * used at deposit/read boot. Weak smoke (domain + pipelines-generics only)
 * shipped images that died in ~2s on deposit with nested missing modules.
 *
 * Exit 0 only when every required module loads and deposit/read factories
 * are callable functions.
 */
import { access, constants as fsConstants, readFileSync } from 'node:fs';
import { access as accessAsync, constants as fsConstantsAsync } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const monorepoRoot = process.env.BITCODE_MONOREPO_ROOT || process.cwd();
process.chdir(monorepoRoot);

function unwrapModuleNamespace(mod) {
  if (!mod || typeof mod !== 'object') return mod;
  const bags = [];
  if (mod.default && typeof mod.default === 'object') bags.push(mod.default);
  if (mod['module.exports'] && typeof mod['module.exports'] === 'object') {
    bags.push(mod['module.exports']);
  }
  if (bags.length === 0) return mod;
  return Object.assign({}, ...bags, mod);
}

async function importMonorepoModule(label, candidates) {
  const tried = [];
  let preferredError = null;
  let lastError = null;
  for (const rel of candidates) {
    const abs = path.join(monorepoRoot, rel);
    tried.push(abs);
    try {
      await accessAsync(abs, fsConstantsAsync.R_OK);
    } catch (err) {
      lastError = err;
      continue;
    }
    try {
      const raw = await import(pathToFileURL(abs).href);
      return unwrapModuleNamespace(raw);
    } catch (err) {
      lastError = err;
      if (!preferredError) preferredError = err;
    }
  }
  const report = preferredError || lastError;
  const detail = report instanceof Error ? report.message : String(report || 'missing');
  throw new Error(
    `smoke import failed for ${label}. Tried: ${tried.join(' | ')}. Last error: ${detail}`,
  );
}

const [
  synthDomainExports,
  all3DomainExports,
  depositPipelineExports,
  readPipelineExports,
  pipelinesGenericsExports,
  btdSettlement,
  btdReconciliation,
  btdAuthority,
  btdReceipts,
] = await Promise.all([
  importMonorepoModule('asset-packs-pipelines syntheses-domain', [
    'packages/asset-packs-pipelines/syntheses/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
  ]),
  importMonorepoModule('asset-packs-pipelines domain (all-3)', [
    'packages/asset-packs-pipelines/domain/src/index.ts',
  ]),
  importMonorepoModule('asset-packs-pipelines deposit synthesis', [
    'packages/asset-packs-pipelines/syntheses/deposit/src/index.ts',
    'packages/asset-packs-pipelines/synthesize-deposits-asset-packs-pipeline/src/index.ts',
  ]),
  importMonorepoModule('asset-packs-pipelines read synthesis', [
    'packages/asset-packs-pipelines/syntheses/read/src/index.ts',
    'packages/asset-packs-pipelines/synthesize-reads-asset-packs-pipeline/src/index.ts',
  ]),
  importMonorepoModule('pipelines-generics', ['packages/pipelines-generics/src/index.ts']),
  importMonorepoModule('btd settlement', ['packages/btd/src/settlement.ts']),
  importMonorepoModule('btd reconciliation', ['packages/btd/src/reconciliation.ts']),
  importMonorepoModule('btd authority', ['packages/btd/src/authority.ts']),
  importMonorepoModule('btd receipts', ['packages/btd/src/receipts.ts']),
]);

if (typeof pipelinesGenericsExports.enablePipelineStreaming !== 'function') {
  throw new Error('pipelines-generics missing enablePipelineStreaming');
}
const factoryExecutionPipeline =
  pipelinesGenericsExports.factoryExecutionPipeline ||
  pipelinesGenericsExports.factoryPipelineExecution;
if (typeof factoryExecutionPipeline !== 'function') {
  throw new Error('pipelines-generics missing factoryExecutionPipeline');
}

const depositFactory =
  depositPipelineExports.factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks ||
  depositPipelineExports.factorySynthesizeDepositAssetPacksSDIVFPipeline;
const readFactory =
  readPipelineExports.factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks ||
  readPipelineExports.factorySynthesizeReadAssetPacksSDIVFPipeline;
if (typeof depositFactory !== 'function') {
  throw new Error('deposit synthesis factory missing after import');
}
if (typeof readFactory !== 'function') {
  throw new Error('read synthesis factory missing after import');
}

// pnpm isolation: source-only links without install leave these empty.
const requireFromRepoSetup = createRequire(
  path.join(monorepoRoot, 'packages/generic-tools/repository-setup/src/index.ts'),
);
requireFromRepoSetup('zod');

const requireFromMultimodal = createRequire(
  path.join(monorepoRoot, 'packages/generic-tools/multimodal-processing/src/index.ts'),
);
requireFromMultimodal('zod');

// Path-mapped module used by domain tools catalog.
try {
  await import('@bitcode/generic-tools/use-computer');
} catch (primary) {
  const abs = path.join(monorepoRoot, 'packages/generic-tools/use-computer/src/index.ts');
  try {
    await import(pathToFileURL(abs).href);
  } catch {
    throw new Error(
      `use-computer unresolved (${primary instanceof Error ? primary.message : primary}). ` +
        'Image must include root tsconfig.json path maps for @bitcode/generic-tools/*.',
    );
  }
}

// Guard against reintroducing the free-var regex bug in the hot-uploaded runner.
for (const rel of [
  '.proofs/pipeline-host/run-live-asset-pack-pipeline.mjs',
  'containers/images/pipeliner/dist/run-live-asset-pack-pipeline.mjs',
]) {
  const runnerPath = path.join(monorepoRoot, rel);
  try {
    access(runnerPath, fsConstants.R_OK);
  } catch {
    continue;
  }
  const runner = readFileSync(runnerPath, 'utf8');
  // Broken form after outer-template escape collapse:
  //   /syntheses/|asset-packs-pipelines/domain/i
  // which parses as RegExp(/syntheses/) | asset - packs ...
  if (runner.includes('/syntheses/|asset-packs-pipelines/domain/i')) {
    throw new Error(
      `${rel} embeds broken looksLikeMissingPath regex that throws ReferenceError: asset is not defined`,
    );
  }
}

void synthDomainExports;
void all3DomainExports;
void btdSettlement;
void btdReconciliation;
void btdAuthority;
void btdReceipts;

console.log(
  'pipeliner live-runner import graph smoke ok (deposit+read factories, btd, zod, use-computer)',
);

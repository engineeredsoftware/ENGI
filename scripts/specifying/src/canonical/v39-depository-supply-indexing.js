// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_DEPOSITORY_SUPPLY_INDEXING_ARTIFACT_PATH =
  '.bitcode/v39-depository-supply-indexing.json';
export const V39_DEPOSITORY_SUPPLY_INDEXING_SCHEMA_ID =
  'bitcode.v39.depositorySupplyIndexing.v1';
export const V39_DEPOSITORY_SUPPLY_INDEXING_VERSION = 'V39';
export const V39_DEPOSITORY_SUPPLY_INDEXING_CURRENT_TARGET = 'V38';
export const V39_DEPOSITORY_SUPPLY_INDEXING_SOURCE_SAFETY_VERDICT =
  'source-safe-depository-supply-indexing-metadata';

export const V39_DEPOSITORY_SUPPLY_INDEXING_ROW_IDS = Object.freeze([
  'lifecycle:source-bound-deposit-normalization',
  'documents:source-safe-search-documents',
  'vectors:active-embedding-projection',
  'storage:supabase-search-readback-projection',
  'rights:depositor-reader-settlement-boundary',
  'repair:searchability-readiness-actions',
  'handoff:finding-fits-search-assets',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-model-responses-with-protected-source',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
]);

const SOURCE_ROOTS = Object.freeze({
  depositorySupplyIndex: 'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
  depositorySupplyIndexTest: 'packages/asset-packs-pipelines/domain/src/__tests__/depository-supply-index.test.ts',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  embeddingConfig: 'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
  assetPackPackage: 'packages/asset-packs-pipelines/domain/package.json',
  assetPackIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  uapiDepositRoute: 'apps/uapi/app/api/deposits/route.ts',
  terminalDepositComposer: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  ormAssetPackEvidence: 'packages/orm/src/models/asset-pack-evidence.ts',
  ormExecutionStorage: 'packages/orm/src/models/bitcode-execution-storage.ts',
  v39Spec: 'specifications/BITCODE_SPEC_V39.md',
  v39Delta: 'specifications/BITCODE_SPEC_V39_DELTA.md',
  v39Parity: 'specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-depository-supply-indexing-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_depository_supply_indexing_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawSourceTextVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    unpaidAssetPackSourceVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V39_DEPOSITORY_SUPPLY_INDEXING_ROWS = Object.freeze([
  row({
    rowId: 'lifecycle:source-bound-deposit-normalization',
    purpose:
      'Normalize deposited repository/material records into source-bound DepositorySupplyRecord receipts with repository, branch, commit, proof, measurement, and readback roots.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.uapiDepositRoute],
    emittedTypes: ['DepositorySupplyIndex', 'DepositorySupplyRecord', 'DepositorySupplyLifecycleState'],
    requiredEvidence: ['repositoryFullName', 'sourceBranch', 'sourceCommit', 'proofRoot', 'measurementRoot'],
  }),
  row({
    rowId: 'documents:source-safe-search-documents',
    purpose:
      'Generate lexical, metadata, measurement, and vector search documents from source-safe titles, summaries, paths, symbols, stack tags, constraints, and roots without serializing protected source.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.depositorySupplyIndexTest],
    emittedTypes: ['DepositorySupplySearchDocument'],
    requiredEvidence: ['sourceSafeTextRoot', 'sourcePathRoots', 'symbolRoots', 'constraintRoots'],
  }),
  row({
    rowId: 'vectors:active-embedding-projection',
    purpose:
      'Bind every searchable supply record to the active OpenAI text-embedding-3-small, 1536-dimension, cosine match_deliverable_vectors vector policy.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.embeddingConfig],
    emittedTypes: ['DepositorySupplyVectorProjection'],
    requiredEvidence: ['text-embedding-3-small', '1536', 'cosine', 'match_deliverable_vectors'],
  }),
  row({
    rowId: 'storage:supabase-search-readback-projection',
    purpose:
      'Describe the Supabase storage projection that maps source-safe AssetPack evidence rows and vector rows into searchable Depository supply readbacks.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.ormAssetPackEvidence, SOURCE_ROOTS.ormExecutionStorage],
    emittedTypes: ['DepositorySupplyStorageProjection'],
    requiredEvidence: ['deliverables', 'deliverable_vectors', 'readbackChecks'],
  }),
  row({
    rowId: 'rights:depositor-reader-settlement-boundary',
    purpose:
      'Preserve the depositor ownership and reader visibility boundary: BTD remains depositor-owned until settlement transfer and source-bearing AssetPack content remains hidden before settlement.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.terminalDepositComposer, SOURCE_ROOTS.v39Spec],
    emittedTypes: ['DepositorySupplyRecord.rightsBoundary'],
    requiredEvidence: ['depositorWalletId', 'btdRange', 'source-safe-metadata-only'],
  }),
  row({
    rowId: 'repair:searchability-readiness-actions',
    purpose:
      'Emit deterministic blockers, warnings, and repair actions for missing repository binding, source revision binding, proof, measurement, and embedding vector rows.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.depositorySupplyIndexTest],
    emittedTypes: ['DepositorySupplyLifecycleState', 'repairActions'],
    requiredEvidence: ['blocked-readiness', 'indexed-repair-required', 'sync-active-embedding-vector-rows'],
  }),
  row({
    rowId: 'handoff:finding-fits-search-assets',
    purpose:
      'Convert source-safe Depository supply records into ReadFitsFindingSynthesis candidate DepositoryAsset inputs without importing source-bearing payloads.',
    sourceRoots: [SOURCE_ROOTS.depositorySupplyIndex, SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.assetPackIndex],
    emittedTypes: ['depositorySupplyAssetsFromIndex', 'DepositoryAsset'],
    requiredEvidence: ['depositorySupplyIndex', 'depository/supply.indexRoot', 'worthy_fit'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const supply = readSource(repoRoot, SOURCE_ROOTS.depositorySupplyIndex);
  const supplyTest = readSource(repoRoot, SOURCE_ROOTS.depositorySupplyIndexTest);
  const search = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const embedding = readSource(repoRoot, SOURCE_ROOTS.embeddingConfig);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.assetPackPackage);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.assetPackIndex);
  const readme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const depositRoute = readSource(repoRoot, SOURCE_ROOTS.uapiDepositRoute);
  const terminalComposer = readSource(repoRoot, SOURCE_ROOTS.terminalDepositComposer);
  const ormEvidence = readSource(repoRoot, SOURCE_ROOTS.ormAssetPackEvidence);
  const ormStorage = readSource(repoRoot, SOURCE_ROOTS.ormExecutionStorage);
  const v39Spec = readSource(repoRoot, SOURCE_ROOTS.v39Spec);
  const v39Delta = readSource(repoRoot, SOURCE_ROOTS.v39Delta);
  const v39Parity = readSource(repoRoot, SOURCE_ROOTS.v39Parity);

  return [
    predicateResult('supply-index-defines-core-types', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('DepositorySupplyIndex') && supply.includes('DepositorySupplyRecord')),
    predicateResult('supply-index-builds-source-safe-records', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('buildDepositorySupplyIndex') && supply.includes('sourceSafeMetadataOnly: true')),
    predicateResult('supply-index-has-rights-boundary', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('btdOwnershipBoundary') && supply.includes('depositor-retains-btd-until-settlement-transfer')),
    predicateResult('supply-index-has-storage-projection', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('DepositorySupplyStorageProjection') && supply.includes('deliverable_vectors') && supply.includes('match_deliverable_vectors')),
    predicateResult('supply-index-has-vector-projection', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('DepositorySupplyVectorProjection') && supply.includes('normalizeAssetPackEmbeddingVector')),
    predicateResult('supply-index-has-repair-actions', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('sync-active-embedding-vector-rows') && supply.includes('blocked-readiness') && supply.includes('indexed-repair-required')),
    predicateResult('supply-index-handoff-to-search-assets', SOURCE_ROOTS.depositorySupplyIndex, supply.includes('depositorySupplyAssetsFromIndex') && supply.includes('DepositoryAsset')),
    predicateResult('search-consumes-supply-index', SOURCE_ROOTS.depositorySearch, search.includes('buildDepositorySupplyIndex') && search.includes("target.store('depository/supply', 'indexRoot'")),
    predicateResult('package-exports-supply-index', SOURCE_ROOTS.assetPackPackage, packageJson.includes('./depository-supply-index') && packageIndex.includes("export * from './depository-supply-index'")),
    predicateResult('embedding-policy-preserved', SOURCE_ROOTS.embeddingConfig, embedding.includes("text-embedding-3-small") && embedding.includes('1536') && embedding.includes('match_deliverable_vectors')),
    predicateResult('tests-cover-source-safety', SOURCE_ROOTS.depositorySupplyIndexTest, supplyTest.includes('PRIVATE_SOURCE_DO_NOT_SERIALIZE') && supplyTest.includes('assertDepositorySupplyIndexSourceSafe')),
    predicateResult('tests-cover-vector-repair', SOURCE_ROOTS.depositorySupplyIndexTest, supplyTest.includes('invalid-dimensions') && supplyTest.includes('sync-active-embedding-vector-rows')),
    predicateResult('tests-cover-search-handoff', SOURCE_ROOTS.depositorySupplyIndexTest, supplyTest.includes('searchDepositoryAssetSpace') && supplyTest.includes('worthy_fit')),
    predicateResult('deposit-route-requires-readiness', SOURCE_ROOTS.uapiDepositRoute, depositRoute.includes('requireBitcodeSignedTransactionReadiness') && depositRoute.includes('createDeposit')),
    predicateResult('terminal-deposit-captures-evidence', SOURCE_ROOTS.terminalDepositComposer, terminalComposer.includes('measurementRoot') && terminalComposer.includes('depositorySearchDocumentRoot')),
    predicateResult('orm-evidence-wraps-physical-storage', SOURCE_ROOTS.ormAssetPackEvidence, ormEvidence.includes("super(supabase, 'deliverables')")),
    predicateResult('orm-vector-wraps-physical-storage', SOURCE_ROOTS.ormExecutionStorage, ormStorage.includes("assetPackVectors: 'deliverable_vectors'")),
    predicateResult('readme-documents-supply-indexing', SOURCE_ROOTS.assetPackReadme, readme.includes('Depository Supply Index')),
    predicateResult('v39-spec-gate2-expanded', SOURCE_ROOTS.v39Spec, v39Spec.includes('DepositorySupplyIndex') && v39Spec.includes('source-safe search documents')),
    predicateResult('v39-delta-gate2-expanded', SOURCE_ROOTS.v39Delta, v39Delta.includes('V39 Gate 2') && v39Delta.includes('DepositorySupplyIndex')),
    predicateResult('v39-parity-gate2-expanded', SOURCE_ROOTS.v39Parity, v39Parity.includes('Gate 2 Parity') && v39Parity.includes('implemented')),
  ];
}

export function buildV39DepositorySupplyIndexing(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V39_DEPOSITORY_SUPPLY_INDEXING_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v39-depository-supply-indexing:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v39-depository-supply-indexing',
    schemaId: V39_DEPOSITORY_SUPPLY_INDEXING_SCHEMA_ID,
    version: V39_DEPOSITORY_SUPPLY_INDEXING_VERSION,
    currentTarget: V39_DEPOSITORY_SUPPLY_INDEXING_CURRENT_TARGET,
    sourceSafetyVerdict: V39_DEPOSITORY_SUPPLY_INDEXING_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V39_DEPOSITORY_SUPPLY_INDEXING_ROWS,
    rowIds: [...V39_DEPOSITORY_SUPPLY_INDEXING_ROW_IDS],
    predicateResults,
    coverage: {
      rowCount: V39_DEPOSITORY_SUPPLY_INDEXING_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      lifecycleStates: ['indexed-searchable', 'indexed-repair-required', 'blocked-readiness'],
      searchDocumentKinds: ['lexical', 'metadata', 'measurement', 'vector'],
      embeddingProvider: 'openai',
      embeddingModel: 'text-embedding-3-small',
      embeddingDimensions: 1536,
      vectorDistanceMetric: 'cosine',
      vectorMatchRpc: 'match_deliverable_vectors',
      storageTables: ['deliverables', 'deliverable_vectors'],
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      unpaidAssetPackSourceVisible: false,
      findingFitsHandoffCovered: true,
      rightsBoundaryCovered: true,
      repairActionsCovered: true,
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}

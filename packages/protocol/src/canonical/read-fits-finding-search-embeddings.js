// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ARTIFACT_PATH =
  '.bitcode/v38-read-fits-finding-search-embeddings.json';
export const V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SCHEMA_ID =
  'bitcode.v38.readFitsFindingSearchEmbeddings.v1';
export const V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_VERSION = 'V38';
export const V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_CURRENT_TARGET = 'V37';
export const V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SOURCE_SAFETY_VERDICT =
  'source-safe-read-fits-finding-search-embeddings-metadata';

export const V38_READ_FITS_FINDING_REQUIRED_PHASE_IDS = Object.freeze([
  'ReadFitsFindingSynthesis.admit',
  'ReadFitsFindingSynthesis.prepare',
  'ReadFitsFindingSynthesis.discovery',
  'ReadFitsFindingSynthesis.implementation',
  'ReadFitsFindingSynthesis.validate',
  'ReadFitsFindingSynthesis.preview',
  'ReadFitsFindingSynthesis.settle',
]);

export const V38_READ_FITS_FINDING_REQUIRED_RETURN_TYPES = Object.freeze([
  'ReadFitsFindingAdmission',
  'PlanSchema',
  'BoundedReadComprehensionSchema',
  'DepositoryFitsResult',
  'AssetPackSynthesisOutput',
  'ReadyToFinishOutput',
  'AssetPackSourceSafePreview',
  'AssetPackCompletionOutput',
]);

export const V38_READ_FITS_FINDING_SEARCH_CHANNEL_IDS = Object.freeze([
  'lexical',
  'symbolic',
  'path',
  'metadata',
  'measurement',
  'embedding-vector',
  'provider-specific',
]);

export const V38_READ_FITS_FINDING_REQUIRED_RECEIPT_FIELDS = Object.freeze([
  'phaseIds',
  'agentIds',
  'ptrrStepIds',
  'failsafeSequenceIds',
  'thricifiedGenerationIds',
  'toolIds',
  'searchChannelIds',
  'providerIds',
  'thresholdPosture',
  'queryPlanRoot',
  'queryRoot',
  'rankingRoot',
  'searchedAssetCount',
  'candidateCounts',
  'selectedFitProvenanceRoot',
  'embeddingPolicy',
  'sourceSafety',
  'roots',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'global_ledger_authority_claim',
]);

const SOURCE_ROOTS = Object.freeze({
  readingContract: 'packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
  depositorySearch: 'packages/pipelines/asset-pack/src/depository-search.ts',
  embeddingConfig: 'packages/pipelines/asset-pack/src/embedding-config.ts',
  depositorySearchTests: 'packages/pipelines/asset-pack/src/__tests__/depository-search.test.ts',
  embeddingConfigTests: 'packages/pipelines/asset-pack/src/__tests__/embedding-config.test.ts',
  readingContractTests: 'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-contract.test.ts',
  lexicalTool: 'packages/pipelines/asset-pack/src/tools/AssetPackLexicalDepositorySearchTool.ts',
  vectorEvidenceSearch: 'packages/pipelines/asset-pack/src/tools/search.ts',
  uapiSearch: 'uapi/lib/search.ts',
  terminalWorkbench: 'uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
  gate2Inventory: 'packages/protocol/src/canonical/inference-surface-inventory.js',
  gate3Stack: 'packages/protocol/src/canonical/ptrr-failsafe-thricified-stack.js',
  gate4Benchmark: 'packages/protocol/src/canonical/prompt-benchmark-report.js',
  gate5Disclosure: 'packages/protocol/src/canonical/inference-telemetry-disclosure-report.js',
  gate6ReadNeed: 'packages/protocol/src/canonical/read-need-comprehension-inference-hardening.js',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-read-fits-finding-search-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function readJson(repoRoot, sourcePath) {
  const source = readSource(repoRoot, sourcePath);
  return source ? JSON.parse(source) : null;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_read_fits_finding_search_embeddings_metadata',
    protectedSourceVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS = Object.freeze([
  row({
    rowId: 'phase:accepted-need-admission',
    phaseId: 'ReadFitsFindingSynthesis.admit',
    agentId: 'ReadFitsFindingSynthesis.admit.accepted-need-gate',
    purpose: 'Require an accepted ReadNeedComprehensionSynthesis Need before any depository search runs.',
    returnTypes: ['ReadFitsFindingAdmission'],
    receiptFields: ['phaseIds', 'agentIds', 'ptrrStepIds', 'roots'],
    telemetryIds: [
      'ReadFitsFindingSynthesis.telemetry.need-id',
      'ReadFitsFindingSynthesis.telemetry.measurement-root',
      'ReadFitsFindingSynthesis.telemetry.blockers',
      'ReadFitsFindingSynthesis.telemetry.admitted',
    ],
  }),
  row({
    rowId: 'phase:source-safe-query-plan',
    phaseId: 'ReadFitsFindingSynthesis.discovery',
    agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits',
    purpose:
      'Derive a source-safe query plan from the accepted Need with lexical, symbolic, path, metadata, measurement, embedding, and provider-specific channels.',
    returnTypes: ['DepositorySearchQueryPlan'],
    receiptFields: ['searchChannelIds', 'providerIds', 'queryPlanRoot', 'embeddingPolicy'],
    telemetryIds: [
      'ReadFitsFindingSynthesis.telemetry.tool-input',
      'ReadFitsFindingSynthesis.telemetry.query-root',
    ],
  }),
  row({
    rowId: 'phase:many-fit-discovery',
    phaseId: 'ReadFitsFindingSynthesis.discovery',
    agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits',
    purpose:
      'Search above-threshold depository candidates across many channels instead of collapsing discovery to a single fit.',
    returnTypes: ['DepositoryFitsResult'],
    receiptFields: ['candidateCounts', 'thresholdPosture', 'searchedAssetCount'],
    telemetryIds: [
      'ReadFitsFindingSynthesis.telemetry.tool-output',
      'ReadFitsFindingSynthesis.telemetry.fit-deposit-ranking',
    ],
  }),
  row({
    rowId: 'channel:embedding-policy',
    phaseId: 'ReadFitsFindingSynthesis.discovery',
    agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits',
    purpose:
      'Preserve the active OpenAI text-embedding-3-small, 1536-dimension, cosine match_deliverable_vectors vector contract.',
    returnTypes: ['EmbeddingSearchResult'],
    receiptFields: ['embeddingPolicy', 'queryRoot', 'rankingRoot'],
    telemetryIds: ['ReadFitsFindingSynthesis.tool.vector-depository-search'],
  }),
  row({
    rowId: 'ranking:threshold-verification',
    phaseId: 'ReadFitsFindingSynthesis.discovery',
    agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits',
    purpose:
      'Rank candidates with review, worthy, semantic, proof, measurement, source-bound, blocker, and readiness thresholds.',
    returnTypes: ['DepositoryCandidateRanking'],
    receiptFields: ['thresholdPosture', 'rankingRoot', 'candidateCounts'],
    telemetryIds: ['ReadFitsFindingSynthesis.telemetry.ranking-root'],
  }),
  row({
    rowId: 'provenance:selected-fit-deposits',
    phaseId: 'ReadFitsFindingSynthesis.implementation',
    agentId: 'ReadFitsFindingSynthesis.implementation.asset-pack',
    purpose:
      'Carry selected fit-deposit asset ids, selected unit ids, proof roots, measurement roots, and readback roots into AssetPack synthesis context.',
    returnTypes: ['DepositoryFitResultEvidence'],
    receiptFields: ['selectedFitProvenanceRoot', 'roots'],
    telemetryIds: ['ReadFitsFindingSynthesis.telemetry.parsed-typed-output'],
  }),
  row({
    rowId: 'receipt:source-safe-search-receipt',
    phaseId: 'ReadFitsFindingSynthesis.receipt',
    agentId: 'ReadFitsFindingSynthesis.receipt.search-embeddings',
    purpose:
      'Bind search channels, provider ids, thresholds, query/ranking roots, selected-fit provenance, and embedding policy without exposing protected source.',
    returnTypes: ['ReadFitsFindingSynthesisSearchReceipt'],
    receiptFields: [...V38_READ_FITS_FINDING_REQUIRED_RECEIPT_FIELDS],
    telemetryIds: ['depository/search.searchReceipt', 'depository/search.queryPlanRoot'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingContract);
  const search = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const embedding = readSource(repoRoot, SOURCE_ROOTS.embeddingConfig);
  const searchTests = readSource(repoRoot, SOURCE_ROOTS.depositorySearchTests);
  const embeddingTests = readSource(repoRoot, SOURCE_ROOTS.embeddingConfigTests);
  const contractTests = readSource(repoRoot, SOURCE_ROOTS.readingContractTests);
  const lexicalTool = readSource(repoRoot, SOURCE_ROOTS.lexicalTool);
  const vectorEvidenceSearch = readSource(repoRoot, SOURCE_ROOTS.vectorEvidenceSearch);
  const uapiSearch = readSource(repoRoot, SOURCE_ROOTS.uapiSearch);
  const terminal = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbench);

  return [
    predicateResult('contract.names-read-fits-finding-pipeline', SOURCE_ROOTS.readingContract, contract.includes("READ_FITS_FINDING_SYNTHESIS = 'ReadFitsFindingSynthesis'")),
    predicateResult('contract.has-seven-phases', SOURCE_ROOTS.readingContract, V38_READ_FITS_FINDING_REQUIRED_PHASE_IDS.every((phaseId) => contract.includes(phaseId))),
    predicateResult('contract.has-discovery-tools', SOURCE_ROOTS.readingContract, contract.includes('ReadFitsFindingSynthesis.tool.lexical-depository-search') && contract.includes('ReadFitsFindingSynthesis.tool.vector-depository-search')),
    predicateResult('contract.has-assetpack-handoff-fields', SOURCE_ROOTS.readingContract, contract.includes('depositorySearchResult') && contract.includes('fitDepositAssetIds') && contract.includes('fitDeposits')),
    predicateResult('search-defines-query-plan', SOURCE_ROOTS.depositorySearch, search.includes('DepositorySearchQueryPlan') && search.includes('buildDepositorySearchQueryPlan')),
    predicateResult('search-defines-search-receipt', SOURCE_ROOTS.depositorySearch, search.includes('ReadFitsFindingSynthesisSearchReceipt') && search.includes('buildReadFitsFindingSynthesisSearchReceipt')),
    predicateResult('search-has-seven-channel-ids', SOURCE_ROOTS.depositorySearch, V38_READ_FITS_FINDING_SEARCH_CHANNEL_IDS.every((channelId) => search.includes(channelId))),
    predicateResult('search-defaults-many-fit-limit', SOURCE_ROOTS.depositorySearch, search.includes('maxSelectedCandidates: 12')),
    predicateResult('search-stores-query-plan-and-receipt', SOURCE_ROOTS.depositorySearch, search.includes("target.store('depository/search', 'queryPlan'") && search.includes("target.store('depository/search', 'searchReceipt'")),
    predicateResult('search-stores-selected-fit-provenance-root', SOURCE_ROOTS.depositorySearch, search.includes('selectedFitProvenanceRootFor') && search.includes('selectedFitProvenanceRoot')),
    predicateResult('search-blocks-source-and-credentials', SOURCE_ROOTS.depositorySearch, search.includes('protectedSourceVisible: false') && search.includes('unpaidAssetPackSourceVisible: false') && search.includes('credentialsSerialized: false')),
    predicateResult('search-channel-scores-include-vector-and-metadata', SOURCE_ROOTS.depositorySearch, search.includes('embeddingVector') && search.includes('providerSpecific') && search.includes('metadataScore') && search.includes('pathScore') && search.includes('symbolicScore')),
    predicateResult('embedding-policy-model', SOURCE_ROOTS.embeddingConfig, embedding.includes("DEFAULT_ASSET_PACK_EMBEDDING_MODEL = 'text-embedding-3-small'")),
    predicateResult('embedding-policy-dimensions', SOURCE_ROOTS.embeddingConfig, embedding.includes('ASSET_PACK_VECTOR_DIMENSIONS = 1536')),
    predicateResult('embedding-policy-rpc', SOURCE_ROOTS.embeddingConfig, embedding.includes("ASSET_PACK_VECTOR_MATCH_RPC = 'match_deliverable_vectors'") && embedding.includes("ASSET_PACK_VECTOR_DISTANCE_METRIC = 'cosine'")),
    predicateResult('lexical-tool-doc-prompt', SOURCE_ROOTS.lexicalTool, lexicalTool.includes('@doc-code-tool') && lexicalTool.includes('lexical-depository-search')),
    predicateResult('vector-evidence-uses-embedding-config', SOURCE_ROOTS.vectorEvidenceSearch, vectorEvidenceSearch.includes('buildOpenAIEmbeddingCreateParams') && vectorEvidenceSearch.includes('ASSET_PACK_VECTOR_MATCH_RPC')),
    predicateResult('uapi-search-uses-embedding-config', SOURCE_ROOTS.uapiSearch, uapiSearch.includes('resolveAssetPackEmbeddingConfig') && uapiSearch.includes('buildOpenAIEmbeddingCreateParams') && uapiSearch.includes('normalizeAssetPackEmbeddingVector')),
    predicateResult('tests-cover-query-plan-and-receipt', SOURCE_ROOTS.depositorySearchTests, searchTests.includes('searchReceipt') && searchTests.includes('queryPlan') && searchTests.includes('selectedFitProvenanceRoot')),
    predicateResult('tests-cover-many-fit-limit', SOURCE_ROOTS.depositorySearchTests, searchTests.includes('maxSelectedCandidates).toBe(12)')),
    predicateResult('tests-cover-embedding-policy', SOURCE_ROOTS.embeddingConfigTests, embeddingTests.includes("text-embedding-3-small") && embeddingTests.includes('match_deliverable_vectors')),
    predicateResult('contract-tests-cover-read-fits-counts', SOURCE_ROOTS.readingContractTests, contractTests.includes('ptrrStepCount: 32') && contractTests.includes('thinkingsGenerationCount: 96')),
    predicateResult('terminal-streams-read-fits-harness', SOURCE_ROOTS.terminalWorkbench, terminal.includes('streamTerminalReadFitsFindingSynthesisHarness') && terminal.includes('ReadFitsFindingSynthesis')),
  ];
}

function upstreamRoot(artifact, prefix) {
  if (!artifact?.artifactRoot) return `${prefix}:missing`;
  return artifact.artifactRoot;
}

export function buildV38ReadFitsFindingSearchEmbeddings(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);

  const gate2 = readJson(repoRoot, '.bitcode/v38-inference-surface-inventory.json');
  const gate3 = readJson(repoRoot, '.bitcode/v38-ptrr-failsafe-thricified-stack.json');
  const gate4 = readJson(repoRoot, '.bitcode/v38-prompt-benchmark-report.json');
  const gate5 = readJson(repoRoot, '.bitcode/v38-disclosure-boundary-report.json');
  const gate6 = readJson(repoRoot, '.bitcode/v38-read-need-comprehension-inference-hardening.json');
  const rowRoots = V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v38-read-fits-finding-search:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
    gate2: upstreamRoot(gate2, 'v38-inference-surface-inventory'),
    gate3: upstreamRoot(gate3, 'v38-ptrr-failsafe-thricified-stack'),
    gate4: upstreamRoot(gate4, 'v38-prompt-benchmark-report'),
    gate5: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
    gate6: upstreamRoot(gate6, 'v38-read-need-comprehension-hardening'),
  }))}`;

  return {
    artifactId: 'v38-read-fits-finding-search-embeddings',
    schemaId: V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SCHEMA_ID,
    version: V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_VERSION,
    currentTarget: V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_CURRENT_TARGET,
    sourceSafetyVerdict: V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS,
    requiredPhaseIds: [...V38_READ_FITS_FINDING_REQUIRED_PHASE_IDS],
    requiredReturnTypes: [...V38_READ_FITS_FINDING_REQUIRED_RETURN_TYPES],
    searchChannelIds: [...V38_READ_FITS_FINDING_SEARCH_CHANNEL_IDS],
    requiredReceiptFields: [...V38_READ_FITS_FINDING_REQUIRED_RECEIPT_FIELDS],
    predicateResults,
    coverage: {
      phaseCount: 7,
      ptrrAgentCount: 8,
      ptrrStepCount: 32,
      failsafeSequenceCount: 96,
      thricifiedGenerationCount: 96,
      providerCallSlotCount: 288,
      toolCount: 4,
      searchChannelCount: V38_READ_FITS_FINDING_SEARCH_CHANNEL_IDS.length,
      defaultMaxSelectedCandidates: 12,
      embeddingProvider: 'openai',
      embeddingModel: 'text-embedding-3-small',
      embeddingDimensions: 1536,
      vectorDistanceMetric: 'cosine',
      vectorMatchRpc: 'match_deliverable_vectors',
      rowCount: V38_READ_FITS_FINDING_SEARCH_EMBEDDINGS_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      gate2InventoryRoot: upstreamRoot(gate2, 'v38-inference-surface-inventory'),
      gate3StackRoot: upstreamRoot(gate3, 'v38-ptrr-failsafe-thricified-stack'),
      gate4PromptBenchmarkRoot: upstreamRoot(gate4, 'v38-prompt-benchmark-report'),
      gate5DisclosureRoot: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
      gate6ReadNeedRoot: upstreamRoot(gate6, 'v38-read-need-comprehension-hardening'),
      manyFitsDiscoveryCovered: true,
      acceptedNeedRequiredForFindingFits: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}

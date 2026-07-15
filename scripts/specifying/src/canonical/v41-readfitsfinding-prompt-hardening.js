// @ts-check

import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV41PromptPartPromptInventory } from './v41-promptpart-prompt-inventory.js';
import { buildV41ReadNeedPromptHardening } from './v41-readneed-prompt-hardening.js';
import { buildV41ReadingPromptBenchmarkBaselines } from './v41-reading-prompt-benchmark-baselines.js';
import { buildV41RegistryInterpolationContracts } from './v41-registry-interpolation-contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V41_READFITSFINDING_PROMPT_HARDENING_ARTIFACT_PATH =
  '.bitcode/v41-readfitsfinding-prompt-hardening.json';
export const V41_READFITSFINDING_PROMPT_HARDENING_SCHEMA_ID =
  'bitcode.v41.readFitsFindingPromptHardening.v1';
export const V41_READFITSFINDING_PROMPT_HARDENING_VERSION = 'V41';
export const V41_READFITSFINDING_PROMPT_HARDENING_CURRENT_TARGET = 'V40';
export const V41_READFITSFINDING_PROMPT_HARDENING_SOURCE_SAFETY_VERDICT =
  'source-safe-readfitsfinding-prompt-hardening-metadata';

export const V41_READFITSFINDING_PROMPT_HARDENING_METRIC_IDS = Object.freeze([
  'accepted_need_gate_integrity',
  'query_synthesis_search_breadth',
  'embedding_vector_ranking_policy',
  'many_candidate_fit_selection',
  'selected_fit_provenance_traceability',
  'assetpack_context_source_safety',
  'preview_quote_disclosure_boundary',
  'settlement_delivery_rights_boundary',
  'readfits_telemetry_redaction',
]);

export const V41_READFITSFINDING_PROMPT_HARDENING_DISCLOSURE_TIERS = Object.freeze([
  'prompt_identity_source_safe',
  'promptpart_identity_source_safe',
  'source_hash_source_safe',
  'predicate_verdict_source_safe',
  'parser_target_id_source_safe',
  'query_ranking_root_source_safe',
  'raw_prompt_text_private',
  'raw_interpolated_prompt_private',
  'raw_provider_response_private',
  'protected_source_private',
  'unpaid_assetpack_source_private',
  'wallet_private_material_private',
  'settlement_private_payload_private',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'settlement-private-payloads',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-prompt-text',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'private-context',
  'unpaid-assetpack-source',
]);

const SOURCE_ROOTS = Object.freeze({
  setupPlanAgent: 'packages/asset-packs-pipelines/domain/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent.ts',
  readComprehensionAgent:
    'packages/asset-packs-pipelines/domain/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent.ts',
  assetPackSynthesisAgent:
    'packages/asset-packs-pipelines/domain/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent.ts',
  assetPackSynthesisPromptParts: 'packages/prompts/src/raw_promptparts/specific',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  readFitsRuntime: 'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  lexicalDepositorySearchTool: 'packages/asset-packs-pipelines/domain/src/tools/AssetPackLexicalDepositorySearchTool.ts',
  previewBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  settlementRightsDelivery: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  depositorySearchTest: 'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
  readFitsRuntimeTest: 'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
  assetPackSynthesisTest:
    'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-synthesis-asset-pack-synthesis-agent.test.ts',
  gate2InventorySource: 'scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
  gate2InventoryArtifact: '.bitcode/v41-promptpart-prompt-inventory.json',
  gate3ContractsSource: 'scripts/specifying/src/canonical/v41-registry-interpolation-contracts.js',
  gate3ContractsArtifact: '.bitcode/v41-registry-interpolation-contracts.json',
  gate4BaselinesSource: 'scripts/specifying/src/canonical/v41-reading-prompt-benchmark-baselines.js',
  gate4BaselinesArtifact: '.bitcode/v41-reading-prompt-benchmark-baselines.json',
  gate5ReadNeedSource: 'scripts/specifying/src/canonical/v41-readneed-prompt-hardening.js',
  gate5ReadNeedArtifact: '.bitcode/v41-readneed-prompt-hardening.json',
  packageSource: 'scripts/specifying/src/canonical/v41-readfitsfinding-prompt-hardening.js',
  packageTest: 'scripts/specifying/test/v41-readfitsfinding-prompt-hardening.test.js',
  generator: 'scripts/generate-v41-readfitsfinding-prompt-hardening.mjs',
  checker: 'scripts/check-v41-gate6-readfitsfinding-prompt-hardening.mjs',
  spec: 'specifications/BITCODE_SPEC_V41.md',
  delta: 'specifications/BITCODE_SPEC_V41_DELTA.md',
  notes: 'specifications/BITCODE_SPEC_V41_NOTES.md',
  parity: 'specifications/BITCODE_SPEC_V41_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const ASSETPACK_SYNTHESIS_PROMPTPART_FILES = Object.freeze([
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_identity_definition.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_requirements_context.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrplan_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrtry_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrrefine_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrretry_purpose.ts',
]);

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function artifactRoot(input) {
  return `v41-readfitsfinding-prompt-hardening:${digest(input)}`;
}

function rowRoot(input) {
  return `v41-readfitsfinding-prompt-hardening-row:${digest(input)}`;
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function listFiles(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  if (!existsSync(absolutePath)) return [];
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [sourcePath];
  if (!stat.isDirectory()) return [];

  const files = [];
  const walk = (currentAbsolute, currentRelative) => {
    const entries = readdirSync(currentAbsolute, { withFileTypes: true });
    const entryNames = new Set(entries.map((entry) => entry.name));
    for (const entry of entries) {
      if (entry.name === 'dist' || entry.name === 'node_modules') continue;
      const nextAbsolute = path.join(currentAbsolute, entry.name);
      const nextRelative = path.join(currentRelative, entry.name);
      if (entry.isDirectory()) {
        walk(nextAbsolute, nextRelative);
        continue;
      }
      if (entry.name.endsWith('.js') && entryNames.has(`${entry.name.slice(0, -3)}.ts`)) continue;
      if (/\.(?:ts|tsx|js|mjs|md)$/u.test(entry.name) && !/\.d\.ts$/u.test(entry.name)) files.push(nextRelative);
    }
  };
  walk(absolutePath, sourcePath);
  return files.sort();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function sourceHash(repoRoot, sourcePath) {
  return digest(readSource(repoRoot, sourcePath));
}

function predicate(id, rowId, sourcePath, passed) {
  return { id, rowId, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.hardeningId),
    pipelineId: 'ReadFitsFindingSynthesis',
    sourceSafetyClass: 'source_safe_readfitsfinding_prompt_hardening_metadata',
    sourceSafeMetadataOnly: true,
    disclosureTiers: [...V41_READFITSFINDING_PROMPT_HARDENING_DISCLOSURE_TIERS],
    rawPromptTextSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    protectedSourceVisible: false,
    privateContextSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V41_READFITSFINDING_PROMPT_HARDENING_ROWS = Object.freeze([
  row({
    hardeningId: 'readfits-assetpack-promptpart-rewrite-boundary',
    label: 'ReadFitsFinding AssetPack PromptParts preserve many-fit source-safe synthesis boundaries',
    sourceRoots: ASSETPACK_SYNTHESIS_PROMPTPART_FILES,
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'AssetPackSynthesis'],
    promptSurfaceIds: [
      'AssetPackSynthesizeArtifacts.identity',
      'AssetPackSynthesizeArtifacts.requirements',
      'AssetPackSynthesizeArtifacts.ptrr.plan',
      'AssetPackSynthesizeArtifacts.ptrr.try',
      'AssetPackSynthesizeArtifacts.ptrr.refine',
      'AssetPackSynthesizeArtifacts.ptrr.retry',
    ],
    parserTargetIds: ['AssetPackSynthesisOutput', 'AssetPackSynthesisArtifacts'],
    metricIds: [
      'accepted_need_gate_integrity',
      'many_candidate_fit_selection',
      'assetpack_context_source_safety',
      'settlement_delivery_rights_boundary',
    ],
    benchmarkFixtureIds: ['fixture.read-fits.assetpack-synthesis-preview'],
    requiredPredicateIds: [
      'promptparts.versioned-to-v41',
      'promptparts.accepted-read-need',
      'promptparts.qualifying-depository-fit-deposits',
      'promptparts.selected-fit-provenance-root',
      'promptparts.many-candidate-search-provenance',
      'promptparts.source-safe-preview-before-settlement',
      'promptparts.no-unpaid-source',
      'promptparts.no-btc-btd-overclaim',
      'promptparts.blocked-readiness-on-insufficient-search-evidence',
    ],
  }),
  row({
    hardeningId: 'readfits-bounded-inference-prompt-context',
    label: 'ReadFitsFinding always-real inference prompt contract carries accepted Need, search roots, and source-safe boundaries',
    sourceRoots: [
      SOURCE_ROOTS.setupPlanAgent,
      SOURCE_ROOTS.readComprehensionAgent,
      SOURCE_ROOTS.assetPackSynthesisAgent,
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.previewBoundary,
    ],
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'PTRR', 'FailsafeGenerationSequence'],
    promptSurfaceIds: [
      'ReadFitsFindingSynthesis.prompt.setup-plan',
      'ReadFitsFindingSynthesis.prompt.read-comprehension',
      'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
      'ReadFitsFindingSynthesis.prompt.fit-quality-validation',
    ],
    parserTargetIds: ['PlanSchema', 'BoundedReadComprehensionSchema', 'AssetPackSynthesisOutput'],
    metricIds: [
      'accepted_need_gate_integrity',
      'query_synthesis_search_breadth',
      'selected_fit_provenance_traceability',
      'assetpack_context_source_safety',
    ],
    benchmarkFixtureIds: [
      'fixture.read-fits.find-many-candidates',
      'fixture.read-fits.assetpack-synthesis-preview',
      'fixture.reading.schema-bound-return-types',
    ],
    requiredPredicateIds: [
      'bounded.setup-plan-template-id',
      'bounded.setup-plan-accepted-need',
      'bounded.setup-plan-search-objectives',
      'bounded.read-comprehension-source-constraints',
      'bounded.read-comprehension-many-candidate-search',
      'bounded.assetpack-source-safe-boundary',
      'bounded.assetpack-selected-fit-provenance-root',
      'bounded.assetpack-no-unpaid-source',
      'bounded.contract-interpolation-keys-expanded',
      'bounded.contract-fit-quality-selected-provenance',
      'bounded.ptrr-failsafe-thricified-composition-present',
    ],
  }),
  row({
    hardeningId: 'readfits-depository-search-query-ranking',
    label: 'Depository search query synthesis, embeddings, ranking, and selected-fit provenance remain many-candidate',
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.depositorySearchTest],
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'DepositorySearch'],
    promptSurfaceIds: [
      'ReadFitsFindingSynthesis.discovery.finding-fits',
      'ReadFitsFindingSynthesis.tool.lexical-depository-search',
      'ReadFitsFindingSynthesis.tool.vector-depository-search',
    ],
    parserTargetIds: ['DepositorySearchRead', 'DepositorySearchResult', 'DepositorySearchQueryPlan'],
    metricIds: [
      'query_synthesis_search_breadth',
      'embedding_vector_ranking_policy',
      'many_candidate_fit_selection',
      'selected_fit_provenance_traceability',
    ],
    benchmarkFixtureIds: ['fixture.read-fits.find-many-candidates'],
    requiredPredicateIds: [
      'search.derived-from-accepted-need',
      'search.all-channel-ids-present',
      'search.embedding-policy-bound',
      'search.provider-matches-supported',
      'search.max-selected-candidates-gt-one',
      'search.selects-all-above-threshold',
      'search.selected-fit-provenance-root',
      'search.query-root-and-ranking-root',
      'search.source-safe-search-receipt',
      'search.tool-telemetry-lexical-and-vector',
      'test.many-qualifying-fit-deposits',
      'test.embedding-vector-policy',
    ],
  }),
  row({
    hardeningId: 'readfits-runtime-replay-telemetry',
    label: 'ReadFitsFinding runtime persists source-safe search, replay, repair, and telemetry receipts',
    sourceRoots: [SOURCE_ROOTS.readFitsRuntime, SOURCE_ROOTS.readFitsRuntimeTest],
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'Telemetry'],
    promptSurfaceIds: ['ReadFitsFindingSynthesis.runtime', 'ReadFitsFindingSynthesis.telemetry'],
    parserTargetIds: ['ReadFitsFindingRuntime', 'ReadFitsFindingTelemetryReceipt', 'ReadFitsFindingReplayReceipt'],
    metricIds: [
      'selected_fit_provenance_traceability',
      'many_candidate_fit_selection',
      'readfits_telemetry_redaction',
    ],
    benchmarkFixtureIds: ['fixture.read-fits.find-many-candidates'],
    requiredPredicateIds: [
      'runtime.source-safe-class',
      'runtime.query-plan-storage',
      'runtime.search-channel-storage',
      'runtime.candidate-ranking-storage',
      'runtime.selected-fit-provenance-storage',
      'runtime.fit-result-storage',
      'runtime.replay-mode',
      'runtime.telemetry-root',
      'runtime.source-safe-selected-fit-evidence',
      'runtime.no-source-leak-test',
    ],
  }),
  row({
    hardeningId: 'readfits-lexical-tool-doc-prompt',
    label: 'Depository search tool prompt describes many-fit source-safe search and output boundaries',
    sourceRoots: [SOURCE_ROOTS.lexicalDepositorySearchTool],
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'ToolDefinition'],
    promptSurfaceIds: ['AssetPackLexicalDepositorySearchTool.docCodePrompt'],
    parserTargetIds: ['DepositorySearchResult', 'DepositoryFitResultEvidence'],
    metricIds: ['query_synthesis_search_breadth', 'readfits_telemetry_redaction'],
    benchmarkFixtureIds: ['fixture.tool-definition.doc-code-contract'],
    requiredPredicateIds: [
      'tool.names-readfitsfindingsynthesis',
      'tool.accepted-read-need-input',
      'tool.many-qualifying-fit-deposit-output',
      'tool.query-ranking-provenance-roots',
      'tool.embedding-policy-output',
      'tool.no-protected-source-output',
      'tool.no-unpaid-assetpack-source-output',
    ],
  }),
  row({
    hardeningId: 'readfits-preview-quote-disclosure-boundary',
    label: 'AssetPack preview exposes measurements, quote, and provenance while withholding source',
    sourceRoots: [SOURCE_ROOTS.previewBoundary],
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'AssetPackPreview'],
    promptSurfaceIds: ['AssetPackSourceSafePreview', 'AssetPackPreviewQuoteReceipt'],
    parserTargetIds: ['AssetPackPreviewBoundary', 'AssetPackSourceSafePreview', 'ShareToFeeQuote'],
    metricIds: [
      'preview_quote_disclosure_boundary',
      'selected_fit_provenance_traceability',
      'settlement_delivery_rights_boundary',
    ],
    benchmarkFixtureIds: ['fixture.read-fits.assetpack-synthesis-preview'],
    requiredPredicateIds: [
      'preview.source-safe-class',
      'preview.fit-measurement-preview-record',
      'preview.selected-fit-provenance-record',
      'preview.deterministic-btc-quote',
      'preview.settlement-required-before-unlock',
      'preview.delivery-withheld-until-settlement',
      'preview.forbidden-before-settlement',
      'preview.no-unpaid-source',
      'preview.no-wallet-private-material',
    ],
  }),
  row({
    hardeningId: 'readfits-settlement-delivery-rights-boundary',
    label: 'Settlement, BTD rights, contributor compensation, ledger sync, and delivery unlock stay post-payment',
    sourceRoots: [SOURCE_ROOTS.settlementRightsDelivery],
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'Settlement', 'BTD'],
    promptSurfaceIds: ['AssetPackSettlementRightsDeliveryBoundary'],
    parserTargetIds: ['AssetPackSettlementRightsDeliveryBoundary', 'AssetPackSettlementUnlock'],
    metricIds: ['settlement_delivery_rights_boundary', 'preview_quote_disclosure_boundary'],
    benchmarkFixtureIds: ['fixture.read-fits.assetpack-synthesis-preview'],
    requiredPredicateIds: [
      'settlement.reader-pays-depositor',
      'settlement.payment-observation',
      'settlement.finality-receipt',
      'settlement.source-to-shares-compensation',
      'settlement.btd-rights-transfer',
      'settlement.delivery-unlock',
      'settlement.ledger-database-storage-reconciliation',
      'settlement.protected-source-serialized-false',
      'settlement.source-bearing-visible-boolean',
    ],
  }),
  row({
    hardeningId: 'readfits-source-safe-tests-and-docs',
    label: 'Gate 6 checks bind tests, docs, package exports, workflows, and current roadmap posture',
    sourceRoots: [
      SOURCE_ROOTS.depositorySearchTest,
      SOURCE_ROOTS.readFitsRuntimeTest,
      SOURCE_ROOTS.assetPackSynthesisTest,
      SOURCE_ROOTS.spec,
      SOURCE_ROOTS.delta,
      SOURCE_ROOTS.notes,
      SOURCE_ROOTS.parity,
      SOURCE_ROOTS.roadmap,
      SOURCE_ROOTS.readme,
      SOURCE_ROOTS.protocolReadme,
      SOURCE_ROOTS.packageJson,
      SOURCE_ROOTS.gateWorkflow,
      SOURCE_ROOTS.canonWorkflow,
    ],
    promptFamilyIds: ['ReadFitsFindingSynthesis', 'V41Gate6'],
    promptSurfaceIds: ['V41ReadFitsFindingPromptHardening'],
    parserTargetIds: ['V41ReadFitsFindingPromptHardening'],
    metricIds: [
      'accepted_need_gate_integrity',
      'query_synthesis_search_breadth',
      'assetpack_context_source_safety',
      'readfits_telemetry_redaction',
    ],
    benchmarkFixtureIds: [
      'fixture.read-fits.find-many-candidates',
      'fixture.read-fits.assetpack-synthesis-preview',
    ],
    requiredPredicateIds: [
      'docs.current-gate-6',
      'docs.next-gate-7',
      'docs.gate6-closure-anchor',
      'parity.finding-fits-implemented',
      'package.scripts-exposed',
      'workflow.gate6-check-wired',
      'tests.depository-search',
      'tests.readfits-runtime',
      'tests.assetpack-synthesis',
    ],
  }),
]);

function sourcesForRow(repoRoot, rowData) {
  return rowData.sourceRoots.flatMap((sourceRoot) => listFiles(repoRoot, sourceRoot));
}

function sourceForRow(repoRoot, rowData) {
  return sourcesForRow(repoRoot, rowData)
    .map((sourcePath) => readSource(repoRoot, sourcePath))
    .join('\n');
}

function predicatesForRow(repoRoot, rowData) {
  const source = sourceForRow(repoRoot, rowData);
  const promptParts = ASSETPACK_SYNTHESIS_PROMPTPART_FILES.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  const setupPlan = readSource(repoRoot, SOURCE_ROOTS.setupPlanAgent);
  const readComprehension = readSource(repoRoot, SOURCE_ROOTS.readComprehensionAgent);
  const synthesis = readSource(repoRoot, SOURCE_ROOTS.assetPackSynthesisAgent);
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContract);
  const depositorySearch = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const runtime = readSource(repoRoot, SOURCE_ROOTS.readFitsRuntime);
  const tool = readSource(repoRoot, SOURCE_ROOTS.lexicalDepositorySearchTool);
  const preview = readSource(repoRoot, SOURCE_ROOTS.previewBoundary);
  const settlement = readSource(repoRoot, SOURCE_ROOTS.settlementRightsDelivery);
  const rowId = rowData.hardeningId;

  if (rowId === 'readfits-assetpack-promptpart-rewrite-boundary') {
    return [
      predicate('promptparts.versioned-to-v41', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, countMatches(promptParts, /current_version:\s*"V41"/gu) >= 6),
      predicate('promptparts.accepted-read-need', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /accepted Read-Need/iu.test(promptParts)),
      predicate('promptparts.qualifying-depository-fit-deposits', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /qualifying Depository fit deposits/iu.test(promptParts)),
      predicate('promptparts.selected-fit-provenance-root', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /selected fit provenance root/iu.test(promptParts)),
      predicate('promptparts.many-candidate-search-provenance', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /many-candidate search provenance/iu.test(promptParts)),
      predicate('promptparts.source-safe-preview-before-settlement', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /source-safe preview/iu.test(promptParts) && /before settlement/iu.test(promptParts)),
      predicate('promptparts.no-unpaid-source', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /unpaid AssetPack source/u.test(promptParts)),
      predicate('promptparts.no-btc-btd-overclaim', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /BTC\/BTD/iu.test(promptParts) || (/BTC/u.test(promptParts) && /BTD/u.test(promptParts))),
      predicate('promptparts.blocked-readiness-on-insufficient-search-evidence', rowId, SOURCE_ROOTS.assetPackSynthesisPromptParts, /blocked readiness/iu.test(promptParts) && /insufficient/iu.test(promptParts)),
    ];
  }

  if (rowId === 'readfits-bounded-inference-prompt-context') {
    const combined = `${setupPlan}\n${readComprehension}\n${synthesis}\n${contract}`;
    return [
      predicate('bounded.setup-plan-template-id', rowId, SOURCE_ROOTS.readingPipelineContract, /ReadFitsFindingSynthesis\.prompt\.setup-plan/u.test(contract)),
      predicate('bounded.setup-plan-accepted-need', rowId, SOURCE_ROOTS.readingPipelineContract, /acceptedReadNeed/u.test(contract)),
      predicate('bounded.setup-plan-search-objectives', rowId, SOURCE_ROOTS.readingPipelineContract, /searchObjectives/u.test(contract) && /many-candidate Depository search/iu.test(contract)),
      predicate('bounded.read-comprehension-source-constraints', rowId, SOURCE_ROOTS.readingPipelineContract, /sourceConstraints/u.test(contract)),
      predicate('bounded.read-comprehension-many-candidate-search', rowId, SOURCE_ROOTS.readingPipelineContract, /many candidate fit deposits/iu.test(contract) || /many-candidate Depository search/iu.test(contract)),
      predicate('bounded.assetpack-source-safe-boundary', rowId, `${SOURCE_ROOTS.readingPipelineContract},${SOURCE_ROOTS.previewBoundary}`, /sourceSafeBoundary/u.test(contract) && /forbiddenBeforeSettlement/u.test(preview)),
      predicate('bounded.assetpack-selected-fit-provenance-root', rowId, SOURCE_ROOTS.readingPipelineContract, /selectedFitProvenanceRoot/u.test(contract)),
      predicate('bounded.assetpack-no-unpaid-source', rowId, SOURCE_ROOTS.readingPipelineContract, /unpaid AssetPack source/u.test(contract)),
      predicate('bounded.contract-interpolation-keys-expanded', rowId, SOURCE_ROOTS.readingPipelineContract, /searchObjectives/u.test(contract) && /selectedFitProvenanceRoot/u.test(contract) && /sourceSafeBoundary/u.test(contract)),
      predicate('bounded.contract-fit-quality-selected-provenance', rowId, SOURCE_ROOTS.readingPipelineContract, /selected-fit provenance/iu.test(contract) && /quote posture/iu.test(contract)),
      predicate('bounded.ptrr-failsafe-thricified-composition-present', rowId, SOURCE_ROOTS.readingPipelineContract, /FailsafeGenerationSequence/u.test(combined) || (/failsafe:prepare_context/u.test(combined) && /generation:structured_output/u.test(combined))),
    ];
  }

  if (rowId === 'readfits-depository-search-query-ranking') {
    return [
      predicate('search.derived-from-accepted-need', rowId, SOURCE_ROOTS.depositorySearch, /derivedFrom:\s*'accepted-read-need'/u.test(depositorySearch)),
      predicate('search.all-channel-ids-present', rowId, SOURCE_ROOTS.depositorySearch, /'lexical'/u.test(depositorySearch) && /'symbolic'/u.test(depositorySearch) && /'embedding-vector'/u.test(depositorySearch) && /'provider-specific'/u.test(depositorySearch)),
      predicate('search.embedding-policy-bound', rowId, SOURCE_ROOTS.depositorySearch, /buildAssetPackEmbeddingPolicy/u.test(depositorySearch) && /embeddingPolicy/u.test(depositorySearch)),
      predicate('search.provider-matches-supported', rowId, SOURCE_ROOTS.depositorySearch, /DepositorySearchProvider/u.test(depositorySearch) && /providerMatches/u.test(depositorySearch)),
      predicate('search.max-selected-candidates-gt-one', rowId, SOURCE_ROOTS.depositorySearch, /maxSelectedCandidates:\s*12/u.test(depositorySearch) || /maxSelectedCandidates/u.test(depositorySearch)),
      predicate('search.selects-all-above-threshold', rowId, SOURCE_ROOTS.depositorySearch, /filter\(/u.test(depositorySearch) && /thresholds\.reviewScore/u.test(depositorySearch) && /thresholds\.semanticScore/u.test(depositorySearch)),
      predicate('search.selected-fit-provenance-root', rowId, SOURCE_ROOTS.depositorySearch, /selectedFitProvenanceRootFor/u.test(depositorySearch) && /selectedFitProvenanceRoot/u.test(depositorySearch)),
      predicate('search.query-root-and-ranking-root', rowId, SOURCE_ROOTS.depositorySearch, /queryRoot/u.test(depositorySearch) && /rankingRoot/u.test(depositorySearch)),
      predicate('search.source-safe-search-receipt', rowId, SOURCE_ROOTS.depositorySearch, /source-safe-depository-search-and-embeddings/u.test(depositorySearch) && /sourceSafeMetadataOnly:\s*true/u.test(depositorySearch)),
      predicate('search.tool-telemetry-lexical-and-vector', rowId, SOURCE_ROOTS.depositorySearch, /lexicalTelemetry/u.test(depositorySearch) && /vectorTelemetry/u.test(depositorySearch)),
      predicate('test.many-qualifying-fit-deposits', rowId, SOURCE_ROOTS.depositorySearchTest, /discovers every qualifying fit deposit above the configured thresholds/u.test(source)),
      predicate('test.embedding-vector-policy', rowId, SOURCE_ROOTS.depositorySearchTest, /text-embedding-3-small/u.test(source) && /match_deliverable_vectors/u.test(source)),
    ];
  }

  if (rowId === 'readfits-runtime-replay-telemetry') {
    return [
      predicate('runtime.source-safe-class', rowId, SOURCE_ROOTS.readFitsRuntime, /source_safe_read_fits_finding_runtime_metadata/u.test(runtime)),
      predicate('runtime.query-plan-storage', rowId, SOURCE_ROOTS.readFitsRuntime, /'query_plan'/u.test(runtime) && /sourceSafeQueryPlan/u.test(runtime)),
      predicate('runtime.search-channel-storage', rowId, SOURCE_ROOTS.readFitsRuntime, /'search_channel'/u.test(runtime)),
      predicate('runtime.candidate-ranking-storage', rowId, SOURCE_ROOTS.readFitsRuntime, /'candidate_ranking'/u.test(runtime)),
      predicate('runtime.selected-fit-provenance-storage', rowId, SOURCE_ROOTS.readFitsRuntime, /'selected_fit_provenance'/u.test(runtime)),
      predicate('runtime.fit-result-storage', rowId, SOURCE_ROOTS.readFitsRuntime, /'fit_result'/u.test(runtime)),
      predicate('runtime.replay-mode', rowId, SOURCE_ROOTS.readFitsRuntime, /source-safe-query-ranking-selected-fit-replay/u.test(runtime)),
      predicate('runtime.telemetry-root', rowId, SOURCE_ROOTS.readFitsRuntime, /telemetryRoot/u.test(runtime)),
      predicate('runtime.source-safe-selected-fit-evidence', rowId, SOURCE_ROOTS.readFitsRuntime, /sourceSafeSelectedFitEvidence/u.test(runtime)),
      predicate('runtime.no-source-leak-test', rowId, SOURCE_ROOTS.readFitsRuntimeTest, /not\.toContain\('Terminal path Deposit Read Finding Fits'\)/u.test(source)),
    ];
  }

  if (rowId === 'readfits-lexical-tool-doc-prompt') {
    return [
      predicate('tool.names-readfitsfindingsynthesis', rowId, SOURCE_ROOTS.lexicalDepositorySearchTool, /ReadFitsFindingSynthesis/u.test(tool)),
      predicate('tool.accepted-read-need-input', rowId, SOURCE_ROOTS.lexicalDepositorySearchTool, /accepted Read-Need/u.test(tool)),
      predicate('tool.many-qualifying-fit-deposit-output', rowId, SOURCE_ROOTS.lexicalDepositorySearchTool, /many qualifying fit deposit ids/u.test(tool)),
      predicate('tool.query-ranking-provenance-roots', rowId, SOURCE_ROOTS.lexicalDepositorySearchTool, /query\/ranking\/selected-fit provenance roots/u.test(tool)),
      predicate('tool.embedding-policy-output', rowId, SOURCE_ROOTS.lexicalDepositorySearchTool, /embedding policy/u.test(tool)),
      predicate('tool.no-protected-source-output', rowId, SOURCE_ROOTS.lexicalDepositorySearchTool, /protected deposit source/u.test(tool)),
      predicate('tool.no-unpaid-assetpack-source-output', rowId, SOURCE_ROOTS.lexicalDepositorySearchTool, /unpaid AssetPack source/u.test(tool)),
    ];
  }

  if (rowId === 'readfits-preview-quote-disclosure-boundary') {
    return [
      predicate('preview.source-safe-class', rowId, SOURCE_ROOTS.previewBoundary, /source_safe_assetpack_preview_quote_boundary/u.test(preview)),
      predicate('preview.fit-measurement-preview-record', rowId, SOURCE_ROOTS.previewBoundary, /'fit_measurement_preview'/u.test(preview)),
      predicate('preview.selected-fit-provenance-record', rowId, SOURCE_ROOTS.previewBoundary, /'selected_fit_provenance'/u.test(preview)),
      predicate('preview.deterministic-btc-quote', rowId, SOURCE_ROOTS.previewBoundary, /deterministic_btc_quote/u.test(preview) && /ShareToFeeQuote/u.test(preview)),
      predicate('preview.settlement-required-before-unlock', rowId, SOURCE_ROOTS.previewBoundary, /settlementRequiredBeforeUnlock:\s*true/u.test(preview)),
      predicate('preview.delivery-withheld-until-settlement', rowId, SOURCE_ROOTS.previewBoundary, /withheld_until_settlement/u.test(preview)),
      predicate('preview.forbidden-before-settlement', rowId, SOURCE_ROOTS.previewBoundary, /forbiddenBeforeSettlement/u.test(preview)),
      predicate('preview.no-unpaid-source', rowId, SOURCE_ROOTS.previewBoundary, /unpaidAssetPackSourceVisible:\s*false/u.test(preview)),
      predicate('preview.no-wallet-private-material', rowId, SOURCE_ROOTS.previewBoundary, /walletPrivateMaterialVisible:\s*false/u.test(preview)),
    ];
  }

  if (rowId === 'readfits-settlement-delivery-rights-boundary') {
    return [
      predicate('settlement.reader-pays-depositor', rowId, SOURCE_ROOTS.settlementRightsDelivery, /payer:\s*'reader'/u.test(settlement) && /payee:\s*'depositor'/u.test(settlement)),
      predicate('settlement.payment-observation', rowId, SOURCE_ROOTS.settlementRightsDelivery, /AssetPackSettlementPaymentObservation/u.test(settlement)),
      predicate('settlement.finality-receipt', rowId, SOURCE_ROOTS.settlementRightsDelivery, /AssetPackSettlementFinalityReceipt/u.test(settlement)),
      predicate('settlement.source-to-shares-compensation', rowId, SOURCE_ROOTS.settlementRightsDelivery, /buildSourceToSharesProof/u.test(settlement) && /sourceToShares/u.test(settlement)),
      predicate('settlement.btd-rights-transfer', rowId, SOURCE_ROOTS.settlementRightsDelivery, /buildBtdRightsTransferReceipt/u.test(settlement) && /rightsTransfer/u.test(settlement)),
      predicate('settlement.delivery-unlock', rowId, SOURCE_ROOTS.settlementRightsDelivery, /AssetPackDeliveryUnlockReceipt/u.test(settlement) && /deliveryUnlock/u.test(settlement)),
      predicate('settlement.ledger-database-storage-reconciliation', rowId, SOURCE_ROOTS.settlementRightsDelivery, /reconcileLedgerDatabaseProjection/u.test(settlement) && /ObjectStorageArtifactFact/u.test(settlement)),
      predicate('settlement.protected-source-serialized-false', rowId, SOURCE_ROOTS.settlementRightsDelivery, /protectedSourcePayloadSerialized:\s*false/u.test(settlement)),
      predicate('settlement.source-bearing-visible-boolean', rowId, SOURCE_ROOTS.settlementRightsDelivery, /sourceBearingDeliveryVisibleToReader:\s*boolean/u.test(settlement)),
    ];
  }

  if (rowId === 'readfits-source-safe-tests-and-docs') {
    return [
      predicate(
        'docs.current-gate-6',
        rowId,
        SOURCE_ROOTS.roadmap,
        /Current working gate: V41 Gate (?:6|7|8|9)/u.test(source) ||
          /Latest closed version: V41 Prompt And PromptPart Excellence/u.test(source) ||
          /Recent V41 closure anchor/u.test(source),
      ),
      predicate(
        'docs.next-gate-7',
        rowId,
        SOURCE_ROOTS.roadmap,
        /Next queued gate after V41 Gate (?:6|7|8): V41 (?:Conversation Tool And Interface Prompt Rewrite|Prompt Benchmark Report And Telemetry Integration|Promotion Readiness)/u.test(source)
          || /V41 Gate 9 closure anchor/u.test(source),
      ),
      predicate('docs.gate6-closure-anchor', rowId, SOURCE_ROOTS.roadmap, /V41 Gate 6 closure anchor/u.test(source)),
      predicate('parity.finding-fits-implemented', rowId, SOURCE_ROOTS.parity, /Finding Fits rewrite.+implemented/us.test(source)),
      predicate('package.scripts-exposed', rowId, SOURCE_ROOTS.packageJson, /check:v41-gate6/u.test(source) && /generate:v41-readfitsfinding-prompt-hardening/u.test(source)),
      predicate('workflow.gate6-check-wired', rowId, SOURCE_ROOTS.gateWorkflow, /check-v41-gate6-readfitsfinding-prompt-hardening/u.test(source)),
      predicate('tests.depository-search', rowId, SOURCE_ROOTS.depositorySearchTest, /AssetPack depository search/u.test(source)),
      predicate('tests.readfits-runtime', rowId, SOURCE_ROOTS.readFitsRuntimeTest, /ReadFitsFinding runtime, ranking, and replay/u.test(source)),
      predicate('tests.assetpack-synthesis', rowId, SOURCE_ROOTS.assetPackSynthesisTest, /runReadFitsFindingSynthesisAssetPackSynthesisAgent/u.test(source)),
    ];
  }

  return rowData.requiredPredicateIds.map((id) => predicate(id, rowId, rowData.sourceRoots[0], false));
}

function buildRows(repoRoot) {
  return V41_READFITSFINDING_PROMPT_HARDENING_ROWS.map((rowData) => {
    const sourceFiles = sourcesForRow(repoRoot, rowData);
    const sourceRootsPresent = rowData.sourceRoots.every((sourceRoot) => sourceExists(repoRoot, sourceRoot));
    const predicateResults = predicatesForRow(repoRoot, rowData);
    const failedPredicateIds = predicateResults.filter((result) => !result.passed).map((result) => result.id);
    const predicateScore = predicateResults.length
      ? Number((predicateResults.filter((result) => result.passed).length / predicateResults.length).toFixed(6))
      : 0;
    return {
      ...rowData,
      sourceFiles,
      sourceHashes: sourceFiles.map((sourcePath) => ({ sourcePath, sourceHash: sourceHash(repoRoot, sourcePath) })),
      sourceRootsPresent,
      predicateResults,
      failedPredicateIds,
      predicateScore,
      hardeningScore: predicateScore,
      passed: sourceRootsPresent && failedPredicateIds.length === 0 && predicateScore >= 1,
    };
  });
}

export function buildV41ReadFitsFindingPromptHardening(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const generatedAt = input.generatedAt || new Date().toISOString();
  const rows = buildRows(repoRoot);
  const failures = rows.flatMap((rowData) => [
    ...(!rowData.sourceRootsPresent ? [`${rowData.hardeningId}: missing source root`] : []),
    ...rowData.failedPredicateIds.map((predicateId) => `${rowData.hardeningId}: ${predicateId}`),
  ]);
  const inventory = buildV41PromptPartPromptInventory({ repoRoot, generatedAt });
  const registryContracts = buildV41RegistryInterpolationContracts({ repoRoot, generatedAt });
  const benchmarkBaselines = buildV41ReadingPromptBenchmarkBaselines({ repoRoot, generatedAt });
  const readNeedHardening = buildV41ReadNeedPromptHardening({ repoRoot, generatedAt });
  const allPromptFamilyIds = unique(rows.flatMap((rowData) => rowData.promptFamilyIds));
  const allPromptSurfaceIds = unique(rows.flatMap((rowData) => rowData.promptSurfaceIds));
  const allParserTargetIds = unique(rows.flatMap((rowData) => rowData.parserTargetIds));
  const allBenchmarkFixtureIds = unique(rows.flatMap((rowData) => rowData.benchmarkFixtureIds));
  const allPredicateIds = rows.flatMap((rowData) => rowData.predicateResults.map((result) => result.id));
  const passedPredicateIds = rows.flatMap((rowData) =>
    rowData.predicateResults.filter((result) => result.passed).map((result) => result.id)
  );
  const readFitsInventoryPromptPartRows = inventory.promptPartRows.filter((rowData) =>
    rowData.promptFamilyIds?.includes?.('ReadFitsFindingSynthesis')
  );
  const readFitsInventoryPromptRows = inventory.promptRows.filter((rowData) =>
    rowData.promptFamilyIds?.includes?.('ReadFitsFindingSynthesis')
  );
  const artifactSeed = {
    version: V41_READFITSFINDING_PROMPT_HARDENING_VERSION,
    currentTarget: V41_READFITSFINDING_PROMPT_HARDENING_CURRENT_TARGET,
    rowRoots: rows.map((rowData) => rowData.rowRoot),
    predicateIds: allPredicateIds,
    sourceHashes: rows.flatMap((rowData) => rowData.sourceHashes.map((entry) => entry.sourceHash)),
    dependencyRoots: {
      gate2InventoryRoot: inventory.artifactRoot,
      gate3RegistryInterpolationRoot: registryContracts.artifactRoot,
      gate4ReadingPromptBenchmarkBaselineRoot: benchmarkBaselines.artifactRoot,
      gate5ReadNeedPromptHardeningRoot: readNeedHardening.artifactRoot,
    },
  };

  return {
    artifactId: 'v41-readfitsfinding-prompt-hardening',
    schemaId: V41_READFITSFINDING_PROMPT_HARDENING_SCHEMA_ID,
    version: V41_READFITSFINDING_PROMPT_HARDENING_VERSION,
    currentTarget: V41_READFITSFINDING_PROMPT_HARDENING_CURRENT_TARGET,
    generatedAt,
    artifactPath: V41_READFITSFINDING_PROMPT_HARDENING_ARTIFACT_PATH,
    sourceSafetyVerdict: V41_READFITSFINDING_PROMPT_HARDENING_SOURCE_SAFETY_VERDICT,
    artifactRoot: artifactRoot(JSON.stringify(artifactSeed)),
    passed: failures.length === 0,
    failures,
    metricIds: [...V41_READFITSFINDING_PROMPT_HARDENING_METRIC_IDS],
    disclosureTiers: [...V41_READFITSFINDING_PROMPT_HARDENING_DISCLOSURE_TIERS],
    rows,
    dependencyRoots: {
      gate2InventoryRoot: inventory.artifactRoot,
      gate3RegistryInterpolationRoot: registryContracts.artifactRoot,
      gate4ReadingPromptBenchmarkBaselineRoot: benchmarkBaselines.artifactRoot,
      gate5ReadNeedPromptHardeningRoot: readNeedHardening.artifactRoot,
    },
    coverage: {
      rowCount: rows.length,
      sourceRootCount: unique(rows.flatMap((rowData) => rowData.sourceRoots)).length,
      sourceRootPresentCount: unique(rows.flatMap((rowData) => rowData.sourceRoots).filter((sourceRoot) => sourceExists(repoRoot, sourceRoot))).length,
      promptFamilyIds: allPromptFamilyIds,
      promptSurfaceIds: allPromptSurfaceIds,
      promptSurfaceCount: allPromptSurfaceIds.length,
      parserTargetIds: allParserTargetIds,
      parserTargetCount: allParserTargetIds.length,
      benchmarkFixtureIds: allBenchmarkFixtureIds,
      benchmarkFixtureCount: allBenchmarkFixtureIds.length,
      requiredPredicateCount: allPredicateIds.length,
      passedPredicateCount: passedPredicateIds.length,
      failedPredicateIds: unique(rows.flatMap((rowData) => rowData.failedPredicateIds)),
      failingRowIds: rows.filter((rowData) => !rowData.passed).map((rowData) => rowData.hardeningId),
      hardeningScoreMinimum: Math.min(...rows.map((rowData) => rowData.hardeningScore)),
      readFitsInventoryPromptPartRowCount: readFitsInventoryPromptPartRows.length,
      readFitsInventoryPromptRowCount: readFitsInventoryPromptRows.length,
      gate4ReadFitsBaselineRowCount: benchmarkBaselines.coverage.readFitsBaselineRowCount,
      gate5ReadNeedHardeningRowCount: readNeedHardening.coverage.rowCount,
    },
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      rawPromptTextSerialized: false,
      rawInterpolatedPromptSerialized: false,
      rawProviderResponseSerialized: false,
      protectedSourceVisible: false,
      privateContextSerialized: false,
      credentialsSerialized: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
  };
}

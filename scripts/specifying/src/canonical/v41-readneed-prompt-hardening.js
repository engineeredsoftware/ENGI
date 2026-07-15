// @ts-check

import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV41PromptPartPromptInventory } from './v41-promptpart-prompt-inventory.js';
import { buildV41ReadingPromptBenchmarkBaselines } from './v41-reading-prompt-benchmark-baselines.js';
import { buildV41RegistryInterpolationContracts } from './v41-registry-interpolation-contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V41_READNEED_PROMPT_HARDENING_ARTIFACT_PATH =
  '.bitcode/v41-readneed-prompt-hardening.json';
export const V41_READNEED_PROMPT_HARDENING_SCHEMA_ID =
  'bitcode.v41.readneedPromptHardening.v1';
export const V41_READNEED_PROMPT_HARDENING_VERSION = 'V41';
export const V41_READNEED_PROMPT_HARDENING_CURRENT_TARGET = 'V40';
export const V41_READNEED_PROMPT_HARDENING_SOURCE_SAFETY_VERDICT =
  'source-safe-readneed-prompt-hardening-metadata';

export const V41_READNEED_PROMPT_HARDENING_METRIC_IDS = Object.freeze([
  'exact_read_request_boundary',
  'source_constraint_preservation',
  'typed_return_schema_strictness',
  'review_resynthesis_gate_integrity',
  'ptrr_failsafe_thricified_composition',
  'source_safe_telemetry_redaction',
  'read_comprehension_tool_alignment',
]);

export const V41_READNEED_PROMPT_HARDENING_DISCLOSURE_TIERS = Object.freeze([
  'prompt_identity_source_safe',
  'promptpart_identity_source_safe',
  'source_hash_source_safe',
  'predicate_verdict_source_safe',
  'parser_target_id_source_safe',
  'raw_prompt_text_private',
  'raw_interpolated_prompt_private',
  'raw_provider_response_private',
  'protected_source_private',
  'unpaid_assetpack_source_private',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-prompt-text',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'private-context',
  'unpaid-assetpack-source',
]);

const SOURCE_ROOTS = Object.freeze({
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  readNeedReview: 'packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts',
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  runtimeInferencePolicy: 'packages/asset-packs-pipelines/domain/src/runtime-inference-policy.ts',
  comprehendReadPrompt: 'packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-read-prompt.ts',
  comprehendReadOverlayPrompt:
    'packages/asset-packs-pipelines/domain/src/agents/prompts/asset-pack-comprehend-read-agent-prompts.ts',
  readComprehensionToolPrompts: 'packages/generic-tools/read-comprehension/src/prompts',
  comprehendReadPromptParts: 'packages/prompts/src/raw_promptparts/specific',
  gate2InventorySource: 'scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
  gate2InventoryArtifact: '.bitcode/v41-promptpart-prompt-inventory.json',
  gate3ContractsSource: 'scripts/specifying/src/canonical/v41-registry-interpolation-contracts.js',
  gate3ContractsArtifact: '.bitcode/v41-registry-interpolation-contracts.json',
  gate4BaselinesSource: 'scripts/specifying/src/canonical/v41-reading-prompt-benchmark-baselines.js',
  gate4BaselinesArtifact: '.bitcode/v41-reading-prompt-benchmark-baselines.json',
  packageSource: 'scripts/specifying/src/canonical/v41-readneed-prompt-hardening.js',
  packageTest: 'scripts/specifying/test/v41-readneed-prompt-hardening.test.js',
  generator: 'scripts/generate-v41-readneed-prompt-hardening.mjs',
  checker: 'scripts/check-v41-gate5-readneed-prompt-hardening.mjs',
  readNeedUnitTest: 'packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts',
  readNeedReviewUnitTest: 'packages/asset-packs-pipelines/domain/src/__tests__/read-need-review-resynthesis.test.ts',
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

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function artifactRoot(input) {
  return `v41-readneed-prompt-hardening:${digest(input)}`;
}

function rowRoot(input) {
  return `v41-readneed-prompt-hardening-row:${digest(input)}`;
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
      if (/\.(?:ts|tsx|js|mjs|md)$/u.test(entry.name) && !/\.d\.ts$/u.test(entry.name)) {
        files.push(nextRelative);
      }
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
    pipelineId: 'ReadNeedComprehensionSynthesis',
    sourceSafetyClass: 'source_safe_readneed_prompt_hardening_metadata',
    sourceSafeMetadataOnly: true,
    disclosureTiers: [...V41_READNEED_PROMPT_HARDENING_DISCLOSURE_TIERS],
    rawPromptTextSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    protectedSourceVisible: false,
    privateContextSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V41_READNEED_PROMPT_HARDENING_ROWS = Object.freeze([
  row({
    hardeningId: 'readneed-promptpart-rewrite-boundary',
    label: 'ReadNeed PromptParts express exact Read Request boundary and non-overreach',
    sourceRoots: [
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_instructions.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_strategy.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_refine_optimization.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_retry_strategy.ts',
    ],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'ComprehendRead'],
    promptSurfaceIds: [
      'ComprehendRead.system',
      'ComprehendRead.plan',
      'ComprehendRead.try',
      'ComprehendRead.refine',
      'ComprehendRead.retry',
    ],
    parserTargetIds: ['ReadNeed', 'ReadNeedComprehensionSynthesisSchema'],
    metricIds: [
      'exact_read_request_boundary',
      'source_constraint_preservation',
      'source_safe_telemetry_redaction',
    ],
    benchmarkFixtureIds: [
      'fixture.read-need.enterprise-request-to-need',
      'fixture.read-need.need-boundary-precision',
    ],
    requiredPredicateIds: [
      'promptparts.versioned-to-v41',
      'promptparts.exactly-and-only-read-request',
      'promptparts.no-more-no-less',
      'promptparts.repository-branch-commit',
      'promptparts.feedback-lineage',
      'promptparts.no-finding-fits-before-acceptance',
      'promptparts.no-search-ranking-or-fit-claim',
      'promptparts.no-btc-btd-overclaim',
      'promptparts.no-protected-source',
      'promptparts.schema-valid-fields',
    ],
  }),
  row({
    hardeningId: 'readneed-ptrr-prompt-composition',
    label: 'ComprehendRead prompts keep PTRR, Failsafe, and ThricifiedGeneration composition intact',
    sourceRoots: [SOURCE_ROOTS.comprehendReadPrompt, SOURCE_ROOTS.comprehendReadOverlayPrompt],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'PTRR', 'FailsafeGenerationSequence'],
    promptSurfaceIds: [
      'createComprehendReadSystemPrompt',
      'createComprehendReadPlanPrompt',
      'createComprehendReadTryPrompt',
      'createComprehendReadRefinePrompt',
      'createComprehendReadRetryPrompt',
      'DP_COMPREHEND_READ_PROMPTS',
    ],
    parserTargetIds: ['Prompt', 'PromptPart'],
    metricIds: [
      'ptrr_failsafe_thricified_composition',
      'source_safe_telemetry_redaction',
    ],
    benchmarkFixtureIds: ['fixture.reading.prompt-registry-composition'],
    requiredPredicateIds: [
      'composition.system-plan-try-refine-retry-present',
      'composition.generation-reason-present',
      'composition.generation-judge-present',
      'composition.generation-structured-output-present',
      'composition.failsafe-prepare-context-present',
      'composition.prompt-requirements-present',
      'composition.overlay-prompts-present',
      'composition.assetpack-overlay-no-source-leak',
    ],
  }),
  row({
    hardeningId: 'readneed-real-inference-return-type-hardening',
    label: 'ReadNeed real inference uses strict typed schema and always-real ThricifiedGeneration that fails closed without an LLM',
    sourceRoots: [
      SOURCE_ROOTS.readNeed,
      SOURCE_ROOTS.runtimeInferencePolicy,
      SOURCE_ROOTS.readNeedUnitTest,
    ],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'ThricifiedGeneration'],
    promptSurfaceIds: ['ReadNeedComprehensionSynthesis.prompt.need-synthesis'],
    parserTargetIds: [
      'ReadNeedComprehensionSynthesisSchema',
      'ReadNeed',
      'ReadNeedComprehensionSynthesisInferenceReceipt',
    ],
    metricIds: [
      'typed_return_schema_strictness',
      'ptrr_failsafe_thricified_composition',
      'source_constraint_preservation',
    ],
    benchmarkFixtureIds: ['fixture.reading.schema-bound-return-types'],
    requiredPredicateIds: [
      'schema.uses-zod-object',
      'schema.strict-return-type',
      'schema.requirements-array',
      'schema.closure-criteria-array',
      'schema.failure-modes-array',
      'schema.target-artifact-kinds-array',
      'schema.proof-expectations-array',
      'inference.uses-real-thricified-inference',
      'inference.prompt-template-id-bound',
      'inference.fails-closed-without-llm',
      'test.real-inference-covers-thricified-generation',
    ],
  }),
  row({
    hardeningId: 'readneed-source-constraint-preservation',
    label: 'ReadNeed preserves repository, branch, commit, and protected-source boundaries into Finding Fits',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readingPipelineContract],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis'],
    promptSurfaceIds: ['ReadNeedComprehensionSynthesis.request', 'ReadNeedComprehensionSynthesis.comprehend'],
    parserTargetIds: ['ReadNeedSourceInput', 'ReadNeed', 'DepositorySearchRead'],
    metricIds: ['source_constraint_preservation', 'exact_read_request_boundary'],
    benchmarkFixtureIds: ['fixture.read-need.enterprise-request-to-need'],
    requiredPredicateIds: [
      'source-constraints.field-present',
      'source-constraints.repository-full-name',
      'source-constraints.source-branch',
      'source-constraints.source-commit',
      'source-constraints.protected-source-disclosure-forbidden',
      'source-constraints.forwarded-to-depository-search-read',
      'source-constraints.interpolation-keys-bound',
      'source-constraints.measurement-root-bound',
    ],
  }),
  row({
    hardeningId: 'readneed-review-resynthesis-admission',
    label: 'ReadNeed review, feedback, resynthesis, and accepted-Need gate stay explicit',
    sourceRoots: [
      SOURCE_ROOTS.readNeed,
      SOURCE_ROOTS.readNeedReview,
      SOURCE_ROOTS.readNeedReviewUnitTest,
    ],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis'],
    promptSurfaceIds: ['ReadNeedComprehensionSynthesis.review.operator-review'],
    parserTargetIds: [
      'ReadNeedReviewResynthesisRuntime',
      'AcceptedReadNeed',
      'RejectedReadNeed',
      'ResynthesisRequestedReadNeed',
      'ReadFitsFindingAdmission',
    ],
    metricIds: [
      'review_resynthesis_gate_integrity',
      'source_constraint_preservation',
      'source_safe_telemetry_redaction',
    ],
    benchmarkFixtureIds: ['fixture.read-need.resynthesis-feedback'],
    requiredPredicateIds: [
      'review.supports-feedback-history',
      'review.supports-previous-need',
      'review.acceptance-root',
      'review.rejection-root',
      'review.accepted-need-required',
      'review.blocks-unaccepted-need',
      'review.blocks-rejected-need',
      'review.persists-runtime',
      'review.summarizes-source-safe-runtime',
    ],
  }),
  row({
    hardeningId: 'readneed-source-safe-telemetry',
    label: 'ReadNeed inference and review telemetry stays source-safe and replayable',
    sourceRoots: [
      SOURCE_ROOTS.readNeed,
      SOURCE_ROOTS.readNeedReview,
      SOURCE_ROOTS.runtimeInferencePolicy,
    ],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'Telemetry'],
    promptSurfaceIds: ['ReadNeedComprehensionSynthesis.telemetry'],
    parserTargetIds: [
      'ReadNeedComprehensionSynthesisInferenceReceipt',
      'ReadNeedReviewTelemetryReceipt',
    ],
    metricIds: ['source_safe_telemetry_redaction', 'typed_return_schema_strictness'],
    benchmarkFixtureIds: ['fixture.reading.schema-bound-return-types'],
    requiredPredicateIds: [
      'telemetry.prompt-template-ids',
      'telemetry.interpolation-context-keys',
      'telemetry.output-schema-ids',
      'telemetry.telemetry-event-ids',
      'telemetry.receipt-root',
      'telemetry.typed-output-root',
      'telemetry.raw-provider-response-hidden',
      'telemetry.unpaid-assetpack-source-hidden',
      'telemetry.credentials-hidden',
      'telemetry.stores-inference-receipt',
    ],
  }),
  row({
    hardeningId: 'readneed-comprehension-tool-prompt-alignment',
    label: 'Read-comprehension tool prompts remain read-first and local to the package boundary',
    sourceRoots: [SOURCE_ROOTS.readComprehensionToolPrompts],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'ToolDefinition'],
    promptSurfaceIds: [
      'AnalyzeReadSemanticsDocCodeToolPrompt',
      'ExtractReadRequirementsDocCodeToolPrompt',
      'IdentifyReadConstraintsDocCodeToolPrompt',
      'GenerateReadSatisfactionCriteriaDocCodeToolPrompt',
      'ValidateReadComprehensionDocCodeToolPrompt',
      'AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt',
    ],
    parserTargetIds: ['DocCodeToolPrompt'],
    metricIds: ['read_comprehension_tool_alignment', 'exact_read_request_boundary'],
    benchmarkFixtureIds: ['fixture.tool-definition.doc-code-contract'],
    requiredPredicateIds: [
      'tools.six-read-comprehension-prompts',
      'tools.doc-code-tool-prompt-base',
      'tools.read-first-local-owner',
      'tools.read-comprehension-category',
      'tools.exports-all-prompts',
      'tools.requirements-constraints-criteria-validation-covered',
      'tools.source-safe-public-boundary',
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
  const readNeed = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const review = readSource(repoRoot, SOURCE_ROOTS.readNeedReview);
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContract);
  const tools = sourceForRow(repoRoot, { sourceRoots: [SOURCE_ROOTS.readComprehensionToolPrompts] });
  const rowId = rowData.hardeningId;

  if (rowId === 'readneed-promptpart-rewrite-boundary') {
    return [
      predicate('promptparts.versioned-to-v41', rowId, SOURCE_ROOTS.comprehendReadPromptParts, countMatches(source, /current_version:\s*"V41"/gu) >= 5),
      predicate('promptparts.exactly-and-only-read-request', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /exactly and only/iu.test(source) && /Read Request/u.test(source)),
      predicate('promptparts.no-more-no-less', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /no more and no less/iu.test(source)),
      predicate('promptparts.repository-branch-commit', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /repository, branch, (?:and )?commit/iu.test(source)),
      predicate('promptparts.feedback-lineage', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /feedback/u.test(source) && /previous Need lineage/u.test(source)),
      predicate('promptparts.no-finding-fits-before-acceptance', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /before Finding Fits/iu.test(source) && /Need is accepted/iu.test(source)),
      predicate('promptparts.no-search-ranking-or-fit-claim', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /do not search/iu.test(source) && /rank fits/iu.test(source)),
      predicate('promptparts.no-btc-btd-overclaim', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /BTC/iu.test(source) && /BTD/iu.test(source)),
      predicate('promptparts.no-protected-source', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /protected source/iu.test(source) && /unpaid AssetPack source/u.test(source)),
      predicate('promptparts.schema-valid-fields', rowId, SOURCE_ROOTS.comprehendReadPromptParts, /requirements, closureCriteria, failureModes, targetArtifactKinds, and proofExpectations/u.test(source)),
    ];
  }

  if (rowId === 'readneed-ptrr-prompt-composition') {
    return [
      predicate('composition.system-plan-try-refine-retry-present', rowId, SOURCE_ROOTS.comprehendReadPrompt, /createComprehendReadSystemPrompt/u.test(source) && /createComprehendReadPlanPrompt/u.test(source) && /createComprehendReadTryPrompt/u.test(source) && /createComprehendReadRefinePrompt/u.test(source) && /createComprehendReadRetryPrompt/u.test(source)),
      predicate('composition.generation-reason-present', rowId, SOURCE_ROOTS.comprehendReadPrompt, countMatches(source, /generation:reason/gu) >= 5),
      predicate('composition.generation-judge-present', rowId, SOURCE_ROOTS.comprehendReadPrompt, countMatches(source, /generation:judge/gu) >= 5),
      predicate('composition.generation-structured-output-present', rowId, SOURCE_ROOTS.comprehendReadPrompt, countMatches(source, /generation:structured_output/gu) >= 5),
      predicate('composition.failsafe-prepare-context-present', rowId, SOURCE_ROOTS.comprehendReadPrompt, countMatches(source, /failsafe:prepare_context/gu) >= 5),
      predicate('composition.prompt-requirements-present', rowId, SOURCE_ROOTS.comprehendReadPrompt, /prompt\.require\('identity'\)/u.test(source) && /prompt\.require\('execution'\)/u.test(source)),
      predicate('composition.overlay-prompts-present', rowId, SOURCE_ROOTS.comprehendReadOverlayPrompt, /DP_COMPREHEND_READ_PROMPTS/u.test(source) && /DP_COMPREHEND_READ_SYSTEM_PROMPT/u.test(source)),
      predicate('composition.assetpack-overlay-no-source-leak', rowId, SOURCE_ROOTS.comprehendReadOverlayPrompt, /generation:json_only_header/u.test(source) && /failsafe:prepare_context/u.test(source)),
    ];
  }

  if (rowId === 'readneed-real-inference-return-type-hardening') {
    return [
      predicate('schema.uses-zod-object', rowId, SOURCE_ROOTS.readNeed, /ReadNeedComprehensionSynthesisSchema\s*=\s*z\.object/u.test(readNeed)),
      predicate('schema.strict-return-type', rowId, SOURCE_ROOTS.readNeed, /ReadNeedComprehensionSynthesisSchema[\s\S]+\.strict\(\)/u.test(readNeed)),
      predicate('schema.requirements-array', rowId, SOURCE_ROOTS.readNeed, /requirements:\s*inferredStringListSchema/u.test(readNeed)),
      predicate('schema.closure-criteria-array', rowId, SOURCE_ROOTS.readNeed, /closureCriteria:\s*inferredStringListSchema/u.test(readNeed)),
      predicate('schema.failure-modes-array', rowId, SOURCE_ROOTS.readNeed, /failureModes:\s*inferredStringListSchema/u.test(readNeed)),
      predicate('schema.target-artifact-kinds-array', rowId, SOURCE_ROOTS.readNeed, /targetArtifactKinds:\s*inferredStringListSchema/u.test(readNeed)),
      predicate('schema.proof-expectations-array', rowId, SOURCE_ROOTS.readNeed, /proofExpectations:\s*inferredStringListSchema/u.test(readNeed)),
      predicate('inference.uses-real-thricified-inference', rowId, SOURCE_ROOTS.readNeed, /runReadNeedComprehensionInference/u.test(readNeed)),
      predicate('inference.prompt-template-id-bound', rowId, SOURCE_ROOTS.readNeed, /ReadNeedComprehensionSynthesis\.prompt\.need-synthesis/u.test(readNeed)),
      predicate('inference.fails-closed-without-llm', rowId, SOURCE_ROOTS.readNeed, /isAssetPackRealInferenceEnabled/u.test(readNeed) && /no configured LLM could be resolved/u.test(readNeed)),
      predicate('test.real-inference-covers-thricified-generation', rowId, SOURCE_ROOTS.readNeedUnitTest, /real-inference ReadNeedComprehension through one ThinkingsGeneration/u.test(source)),
    ];
  }

  if (rowId === 'readneed-source-constraint-preservation') {
    return [
      predicate('source-constraints.field-present', rowId, SOURCE_ROOTS.readNeed, /sourceConstraints:\s*\{/u.test(readNeed)),
      predicate('source-constraints.repository-full-name', rowId, SOURCE_ROOTS.readNeed, /repositoryFullName/u.test(readNeed)),
      predicate('source-constraints.source-branch', rowId, SOURCE_ROOTS.readNeed, /sourceBranch/u.test(readNeed)),
      predicate('source-constraints.source-commit', rowId, SOURCE_ROOTS.readNeed, /sourceCommit/u.test(readNeed)),
      predicate('source-constraints.protected-source-disclosure-forbidden', rowId, SOURCE_ROOTS.readNeed, /protectedSourceDisclosure:\s*'forbidden_before_settlement'/u.test(readNeed)),
      predicate('source-constraints.forwarded-to-depository-search-read', rowId, SOURCE_ROOTS.readNeed, /readNeedToDepositorySearchRead/u.test(readNeed) && /sourceCommit:\s*need\.sourceConstraints\.sourceCommit/u.test(readNeed)),
      predicate('source-constraints.interpolation-keys-bound', rowId, SOURCE_ROOTS.readingPipelineContract, /sourceConstraints/u.test(contract) && /targetArtifactKinds/u.test(contract)),
      predicate('source-constraints.measurement-root-bound', rowId, SOURCE_ROOTS.readNeed, /measurementRoot/u.test(readNeed) && /pricingMeasurementInputs/u.test(readNeed)),
    ];
  }

  if (rowId === 'readneed-review-resynthesis-admission') {
    const combined = `${readNeed}\n${review}\n${source}`;
    return [
      predicate('review.supports-feedback-history', rowId, SOURCE_ROOTS.readNeedReview, /feedbackHistory/u.test(combined)),
      predicate('review.supports-previous-need', rowId, SOURCE_ROOTS.readNeedReview, /previousNeedId/u.test(combined)),
      predicate('review.acceptance-root', rowId, SOURCE_ROOTS.readNeed, /acceptanceRoot/u.test(combined)),
      predicate('review.rejection-root', rowId, SOURCE_ROOTS.readNeed, /rejectionRoot/u.test(combined)),
      predicate('review.accepted-need-required', rowId, SOURCE_ROOTS.readNeed, /acceptedNeedRequiredForFindingFits:\s*true/u.test(combined)),
      predicate('review.blocks-unaccepted-need', rowId, SOURCE_ROOTS.readNeed, /accepted_read_need_missing/u.test(combined)),
      predicate('review.blocks-rejected-need', rowId, SOURCE_ROOTS.readNeed, /read_need_rejected/u.test(combined)),
      predicate('review.persists-runtime', rowId, SOURCE_ROOTS.readNeedReview, /persistReadNeedReviewResynthesisRuntime/u.test(combined)),
      predicate('review.summarizes-source-safe-runtime', rowId, SOURCE_ROOTS.readNeedReview, /summarizeReadNeedReviewResynthesisRuntime/u.test(combined) && /source_safe_read_need_review_resynthesis_metadata/u.test(combined)),
    ];
  }

  if (rowId === 'readneed-source-safe-telemetry') {
    const combined = `${readNeed}\n${review}\n${source}`;
    return [
      predicate('telemetry.prompt-template-ids', rowId, SOURCE_ROOTS.readNeed, /promptTemplateIds/u.test(combined)),
      predicate('telemetry.interpolation-context-keys', rowId, SOURCE_ROOTS.readNeed, /interpolationContextKeys/u.test(combined)),
      predicate('telemetry.output-schema-ids', rowId, SOURCE_ROOTS.readNeed, /outputSchemaIds/u.test(combined)),
      predicate('telemetry.telemetry-event-ids', rowId, SOURCE_ROOTS.readNeed, /telemetryEventIds/u.test(combined)),
      predicate('telemetry.receipt-root', rowId, SOURCE_ROOTS.readNeed, /receiptRoot/u.test(combined)),
      predicate('telemetry.typed-output-root', rowId, SOURCE_ROOTS.readNeed, /typedOutputRoot/u.test(combined)),
      predicate('telemetry.raw-provider-response-hidden', rowId, SOURCE_ROOTS.readNeed, /rawProviderResponseVisible:\s*false/u.test(combined)),
      predicate('telemetry.unpaid-assetpack-source-hidden', rowId, SOURCE_ROOTS.readNeed, /unpaidAssetPackSourceVisible:\s*false/u.test(combined)),
      predicate('telemetry.credentials-hidden', rowId, SOURCE_ROOTS.readNeed, /credentialsSerialized:\s*false/u.test(combined)),
      predicate('telemetry.stores-inference-receipt', rowId, SOURCE_ROOTS.readNeed, /storeReadNeedInferenceReceipt/u.test(combined)),
    ];
  }

  if (rowId === 'readneed-comprehension-tool-prompt-alignment') {
    return [
      predicate('tools.six-read-comprehension-prompts', rowId, SOURCE_ROOTS.readComprehensionToolPrompts, countMatches(tools, /extends DocCodeToolPrompt/gu) >= 6),
      predicate('tools.doc-code-tool-prompt-base', rowId, SOURCE_ROOTS.readComprehensionToolPrompts, countMatches(tools, /DocCodeToolPrompt/gu) >= 6),
      predicate('tools.read-first-local-owner', rowId, SOURCE_ROOTS.readComprehensionToolPrompts, countMatches(tools, /read-first/gu) >= 5),
      predicate('tools.read-comprehension-category', rowId, SOURCE_ROOTS.readComprehensionToolPrompts, countMatches(tools, /metadata:category', 'read-comprehension/gu) >= 6),
      predicate('tools.exports-all-prompts', rowId, SOURCE_ROOTS.readComprehensionToolPrompts, /AnalyzeReadSemanticsDocCodeToolPrompt/u.test(tools) && /ValidateReadComprehensionDocCodeToolPrompt/u.test(tools)),
      predicate('tools.requirements-constraints-criteria-validation-covered', rowId, SOURCE_ROOTS.readComprehensionToolPrompts, /ExtractReadRequirements/u.test(tools) && /IdentifyReadConstraints/u.test(tools) && /GenerateReadSatisfactionCriteria/u.test(tools) && /ValidateReadComprehension/u.test(tools)),
      predicate('tools.source-safe-public-boundary', rowId, SOURCE_ROOTS.readComprehensionToolPrompts, /canonical read-first raw PromptParts through the public prompt boundary/u.test(tools)),
    ];
  }

  return rowData.requiredPredicateIds.map((id) => predicate(id, rowId, rowData.sourceRoots[0], false));
}

function buildRows(repoRoot) {
  return V41_READNEED_PROMPT_HARDENING_ROWS.map((rowData) => {
    const sourceFiles = sourcesForRow(repoRoot, rowData);
    const sourceRootsPresent = rowData.sourceRoots.every((sourceRoot) => sourceExists(repoRoot, sourceRoot));
    const predicateResults = predicatesForRow(repoRoot, rowData);
    const failedPredicateIds = predicateResults
      .filter((result) => !result.passed)
      .map((result) => result.id);
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

export function buildV41ReadNeedPromptHardening(input = {}) {
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
  const allPromptFamilyIds = unique(rows.flatMap((rowData) => rowData.promptFamilyIds));
  const allPromptSurfaceIds = unique(rows.flatMap((rowData) => rowData.promptSurfaceIds));
  const allParserTargetIds = unique(rows.flatMap((rowData) => rowData.parserTargetIds));
  const allBenchmarkFixtureIds = unique(rows.flatMap((rowData) => rowData.benchmarkFixtureIds));
  const allPredicateIds = rows.flatMap((rowData) => rowData.predicateResults.map((result) => result.id));
  const passedPredicateIds = rows.flatMap((rowData) =>
    rowData.predicateResults.filter((result) => result.passed).map((result) => result.id)
  );
  const readNeedInventoryPromptPartRows = inventory.promptPartRows.filter((rowData) =>
    rowData.promptFamilyIds?.includes?.('ReadNeedComprehensionSynthesis')
  );
  const readNeedInventoryPromptRows = inventory.promptRows.filter((rowData) =>
    rowData.promptFamilyIds?.includes?.('ReadNeedComprehensionSynthesis')
  );
  const artifactSeed = {
    version: V41_READNEED_PROMPT_HARDENING_VERSION,
    currentTarget: V41_READNEED_PROMPT_HARDENING_CURRENT_TARGET,
    rowRoots: rows.map((rowData) => rowData.rowRoot),
    predicateIds: allPredicateIds,
    sourceHashes: rows.flatMap((rowData) => rowData.sourceHashes.map((entry) => entry.sourceHash)),
    dependencyRoots: {
      gate2InventoryRoot: inventory.artifactRoot,
      gate3RegistryInterpolationRoot: registryContracts.artifactRoot,
      gate4ReadingPromptBenchmarkBaselineRoot: benchmarkBaselines.artifactRoot,
    },
  };

  return {
    artifactId: 'v41-readneed-prompt-hardening',
    schemaId: V41_READNEED_PROMPT_HARDENING_SCHEMA_ID,
    version: V41_READNEED_PROMPT_HARDENING_VERSION,
    currentTarget: V41_READNEED_PROMPT_HARDENING_CURRENT_TARGET,
    generatedAt,
    artifactPath: V41_READNEED_PROMPT_HARDENING_ARTIFACT_PATH,
    sourceSafetyVerdict: V41_READNEED_PROMPT_HARDENING_SOURCE_SAFETY_VERDICT,
    artifactRoot: artifactRoot(JSON.stringify(artifactSeed)),
    passed: failures.length === 0,
    failures,
    metricIds: [...V41_READNEED_PROMPT_HARDENING_METRIC_IDS],
    disclosureTiers: [...V41_READNEED_PROMPT_HARDENING_DISCLOSURE_TIERS],
    rows,
    dependencyRoots: {
      gate2InventoryRoot: inventory.artifactRoot,
      gate3RegistryInterpolationRoot: registryContracts.artifactRoot,
      gate4ReadingPromptBenchmarkBaselineRoot: benchmarkBaselines.artifactRoot,
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
      readNeedInventoryPromptPartRowCount: readNeedInventoryPromptPartRows.length,
      readNeedInventoryPromptRowCount: readNeedInventoryPromptRows.length,
      gate4ReadNeedBaselineRowCount: benchmarkBaselines.coverage.readNeedBaselineRowCount,
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
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
  };
}

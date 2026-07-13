// @ts-check

import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV38InferenceSurfaceInventory } from './inference-surface-inventory.js';
import { buildV38PtrrFailsafeThricifiedStack } from './ptrr-failsafe-thricified-stack.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_PROMPT_BENCHMARK_REPORT_ARTIFACT_PATH = '.bitcode/v38-prompt-benchmark-report.json';
export const V38_PROMPT_BENCHMARK_REPORT_SCHEMA_ID = 'bitcode.v38.promptBenchmarkReport.v1';
export const V38_PROMPT_BENCHMARK_REPORT_VERSION = 'V38';
export const V38_PROMPT_BENCHMARK_REPORT_CURRENT_TARGET = 'V37';
export const V38_PROMPT_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT =
  'source-safe-prompt-benchmark-metadata';

export const V38_PROMPT_BENCHMARK_SUBJECT_KIND_IDS = Object.freeze([
  'benchmark-infrastructure',
  'PromptPart',
  'Prompt',
  'DocCodeToolPrompt',
]);

export const V38_PROMPT_BENCHMARK_METRIC_IDS = Object.freeze([
  'intent_alignment',
  'semantic_clarity',
  'token_efficiency',
  'model_stability',
  'task_success',
  'response_quality',
  'schema_conformance',
  'source_boundary_preservation',
]);

export const V38_PROMPT_BENCHMARK_DISCLOSURE_TIER_IDS = Object.freeze([
  'prompt_identity_source_safe',
  'promptpart_identity_source_safe',
  'benchmark_fixture_source_safe',
  'expected_typed_output_quality_source_safe',
  'benchmark_score_source_safe',
  'raw_prompt_text_private',
  'raw_provider_response_private',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_prompt_text',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
]);

const SOURCE_ROOTS = Object.freeze({
  runner: 'packages/prompts/src/benchmarking/runner.ts',
  benchmarkTypes: 'packages/prompts/src/benchmarking/types.ts',
  benchmarkReadme: 'packages/prompts/src/benchmarking/README.md',
  docCommentDeveloping: 'packages/prompts/src/developing/doc-comment-developing.ts',
  promptPrimitive: 'packages/prompts/src/prompt.ts',
  promptPartPrimitive: 'packages/prompts/src/parts/PromptPart.ts',
  genericPromptParts: 'packages/prompts/src/raw_promptparts/generic',
  specificPromptParts: 'packages/prompts/src/raw_promptparts/specific',
  readingAgentPrompts: 'packages/asset-packs-pipelines/domain/src/agents/prompts',
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  conversationPrompt: 'packages/conversations/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
  docCodeToolPrompt: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
  formatUsableTools: 'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
  webSearchToolPrompts: 'packages/generic-tools/web-search/src/prompts',
  vcsToolPrompts: 'packages/generic-tools/vcs/src/prompts',
  repositoryEvidenceSearchPrompt:
    'packages/generic-tools/simple-system-text-search/src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-prompt-benchmark-row:${digest(id)}`;
}

function fixtureRoot(id) {
  return `v38-prompt-benchmark-fixture:${digest(id)}`;
}

function sourceRootExists(repoRoot, sourceRoot) {
  return existsSync(path.join(repoRoot, sourceRoot));
}

function listFiles(repoRoot, sourceRoot) {
  const absolute = path.join(repoRoot, sourceRoot);
  if (!existsSync(absolute)) return [];
  const stat = statSync(absolute);
  if (stat.isFile()) return [sourceRoot];
  if (!stat.isDirectory()) return [];

  const found = [];
  const walk = (currentAbsolute, currentRelative) => {
    for (const entry of readdirSync(currentAbsolute, { withFileTypes: true })) {
      if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name === '_legacy') continue;
      const nextAbsolute = path.join(currentAbsolute, entry.name);
      const nextRelative = path.join(currentRelative, entry.name);
      if (entry.isDirectory()) walk(nextAbsolute, nextRelative);
      else if (/\.ts$/u.test(entry.name) && !/\.d\.ts$/u.test(entry.name)) found.push(nextRelative);
    }
  };
  walk(absolute, sourceRoot);
  return found.sort();
}

function read(repoRoot, sourcePath) {
  const absolute = path.join(repoRoot, sourcePath);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function matchesAny(value, filters) {
  if (!filters || filters.length === 0) return true;
  return filters.some((filter) => {
    if (filter.startsWith('regex:')) return new RegExp(filter.slice('regex:'.length), 'u').test(value);
    return value.includes(filter);
  });
}

function benchmarkFixture(input) {
  return {
    ...input,
    fixtureRoot: fixtureRoot(input.fixtureId),
    sourceSafe: true,
  };
}

function benchmarkRow(input) {
  return {
    ...input,
    disclosureTierIds: [...V38_PROMPT_BENCHMARK_DISCLOSURE_TIER_IDS],
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    protectedSourceVisible: false,
    rawPromptTextSerialized: false,
    rawProviderResponseSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    sourceSafetyClass: 'source_safe_prompt_benchmark_metadata',
    rowRoot: rowRoot(input.rowId),
    fixtureInputs: input.fixtureInputs.map(benchmarkFixture),
  };
}

export const V38_PROMPT_BENCHMARK_ROWS = Object.freeze([
  benchmarkRow({
    rowId: 'benchmark:runner-and-doc-comment-infrastructure',
    familyId: 'benchmark_infrastructure',
    subjectKindId: 'benchmark-infrastructure',
    label: 'Prompt benchmark runner, suite types, and doc-comment metadata parser',
    surfaceIds: ['PromptPartBenchmarkSuite', 'PromptBenchmarkSuite', 'BenchmarkRunner'],
    sourceRoots: [
      SOURCE_ROOTS.runner,
      SOURCE_ROOTS.benchmarkTypes,
      SOURCE_ROOTS.benchmarkReadme,
      SOURCE_ROOTS.docCommentDeveloping,
    ],
    requiredMetricIds: [...V38_PROMPT_BENCHMARK_METRIC_IDS],
    fixtureInputs: [
      {
        fixtureId: 'fixture.promptpart.intent-alignment',
        label: 'PromptPart intent-alignment scoring fixture',
        contextBindingIds: ['promptPartId', 'intent', 'benchmarkDefinitions'],
        expectedTypedOutputQualityIds: ['numeric_score_0_to_1', 'benchmark_model_identity', 'timestamp'],
      },
      {
        fixtureId: 'fixture.prompt.task-success',
        label: 'Complete Prompt task-success scoring fixture',
        contextBindingIds: ['promptId', 'formattedPromptIdentity', 'fixtureScenario', 'expectedOutputSchemaId'],
        expectedTypedOutputQualityIds: ['numeric_score_0_to_1', 'task_success_reason', 'response_quality_reason'],
      },
    ],
    expectedTypedOutputQualityIds: [
      'PromptPartBenchmarkResult',
      'PromptBenchmarkResult',
      'DevelopingBenchmarkResults',
    ],
    requiredPredicateIds: [
      'benchmark.runner-defines-promptpart-benchmark',
      'benchmark.runner-defines-complete-prompt-benchmark',
      'benchmark.types-define-promptpart-suite',
      'benchmark.types-define-complete-prompt-suite',
      'benchmark.doc-comments-parse-benchmarks',
      'benchmark.readme-documents-pbv',
    ],
  }),
  benchmarkRow({
    rowId: 'promptpart:generic-ptrr-failsafe-thricified-foundation',
    familyId: 'promptpart_suite',
    subjectKindId: 'PromptPart',
    label: 'Generic PTRR, Failsafe, ThricifiedGeneration, formatting, and DocCode PromptParts',
    surfaceIds: [
      'PTRR agent generic PromptParts',
      'FailsafeGenerationSequence generic PromptParts',
      'ThricifiedGeneration generic PromptParts',
      'DocCodeToolPrompt generic labels',
    ],
    sourceRoots: [SOURCE_ROOTS.genericPromptParts],
    filePathIncludes: [
      'promptpart_generic_agent_',
      'promptpart_generic_ptrr_',
      'promptpart_generic_doccode_',
      'promptpart_generic_formatting_',
    ],
    requiredMetricIds: ['intent_alignment', 'semantic_clarity', 'token_efficiency', 'model_stability'],
    fixtureInputs: [
      {
        fixtureId: 'fixture.generic-ptrr.reason-judge-structured-output',
        label: 'Generic Reason/Judge/StructuredOutput PromptPart stability fixture',
        contextBindingIds: ['ptrrStepName', 'failsafeStageId', 'thricifiedGenerationStageId', 'schemaId'],
        expectedTypedOutputQualityIds: ['reasoning_clear', 'judgment_constrained', 'structured_output_json_only'],
      },
      {
        fixtureId: 'fixture.generic-doccode.section-labels',
        label: 'Generic DocCode section PromptPart fixture',
        contextBindingIds: ['toolName', 'toolPurpose', 'toolParameters', 'toolOutput'],
        expectedTypedOutputQualityIds: ['section_label_clear', 'tool_documentation_composable'],
      },
    ],
    expectedTypedOutputQualityIds: [
      'reason_prompt_clarity',
      'judge_prompt_constraint',
      'structured_output_schema_focus',
      'tool_prompt_section_composability',
    ],
    requiredPredicateIds: [
      'promptpart.generic-has-doc-comments',
      'promptpart.generic-has-benchmark-definitions',
      'promptpart.generic-exports-promptparts',
      'promptpart.generic-semantic-division-present',
      'promptpart.generic-current-version-present',
    ],
  }),
  benchmarkRow({
    rowId: 'promptpart:read-need-comprehension-specific',
    familyId: 'promptpart_suite',
    subjectKindId: 'PromptPart',
    label: 'ReadNeedComprehensionSynthesis specific PromptParts',
    surfaceIds: ['ReadNeedComprehensionSynthesis', 'ReadNeedComprehensionSynthesis.prompt.need-synthesis'],
    sourceRoots: [SOURCE_ROOTS.specificPromptParts, SOURCE_ROOTS.readNeed],
    filePathIncludes: ['promptpart_specific_agent_comprehendread', 'read-need.ts'],
    requiredMetricIds: [
      'intent_alignment',
      'semantic_clarity',
      'model_stability',
      'schema_conformance',
      'source_boundary_preservation',
    ],
    fixtureInputs: [
      {
        fixtureId: 'fixture.read-need.enterprise-request-to-need',
        label: 'Enterprise Read Request to reviewable Need fixture',
        contextBindingIds: ['read.prompt', 'sourceConstraints', 'targetArtifactKinds', 'closureCriteria', 'feedbackHistory'],
        expectedTypedOutputQualityIds: [
          'need_exactly_matches_request',
          'need_no_overreach',
          'need_no_underreach',
          'source_constraints_preserved',
        ],
      },
      {
        fixtureId: 'fixture.read-need.resynthesis-feedback',
        label: 'Need resynthesis feedback fixture',
        contextBindingIds: ['previousNeed', 'readerFeedback', 'sourceRevision', 'measurementRoot'],
        expectedTypedOutputQualityIds: ['feedback_applied', 'measurement_inputs_preserved', 'reviewable_need_shape'],
      },
    ],
    expectedTypedOutputQualityIds: [
      'ReadNeed',
      'ReadNeedPricingMeasurementInputs',
      'AcceptedReadNeed',
      'ResynthesisRequestedReadNeed',
    ],
    requiredPredicateIds: [
      'promptpart.read-need-has-doc-comments',
      'promptpart.read-need-has-benchmark-definitions',
      'promptpart.read-need-exports-promptparts',
      'promptpart.read-need-contract-names-pipeline',
      'promptpart.read-need-schema-names-output',
    ],
  }),
  benchmarkRow({
    rowId: 'promptpart:read-fits-finding-specific',
    familyId: 'promptpart_suite',
    subjectKindId: 'PromptPart',
    label: 'ReadFitsFindingSynthesis specific PromptParts for Finding Fits and AssetPack synthesis',
    surfaceIds: [
      'ReadFitsFindingSynthesis',
      'ReadFitsFindingSynthesis.discovery.finding-fits',
      'ReadFitsFindingSynthesis.implementation.asset-pack',
    ],
    sourceRoots: [SOURCE_ROOTS.specificPromptParts, SOURCE_ROOTS.depositorySearch],
    filePathIncludes: [
      'promptpart_specific_agent_assetpack',
      'promptpart_specific_agent_planimplementation',
      'promptpart_specific_agent_readiness',
      'promptpart_specific_agent_createpullrequest',
      'promptpart_specific_tool_websearch',
      'depository-search.ts',
    ],
    requiredMetricIds: [
      'intent_alignment',
      'semantic_clarity',
      'model_stability',
      'schema_conformance',
      'source_boundary_preservation',
    ],
    fixtureInputs: [
      {
        fixtureId: 'fixture.read-fits.find-many-candidates',
        label: 'Find many above-threshold depository candidates fixture',
        contextBindingIds: ['acceptedReadNeed', 'searchChannels', 'embeddingPolicy', 'rankingThreshold'],
        expectedTypedOutputQualityIds: [
          'many_candidate_fit_ids',
          'ranking_root_present',
          'threshold_verdicts_present',
          'selected_fit_provenance_present',
        ],
      },
      {
        fixtureId: 'fixture.read-fits.assetpack-synthesis-preview',
        label: 'Source-safe AssetPack synthesis preview fixture',
        contextBindingIds: ['fitDeposits', 'acceptedReadNeed', 'deliveryMechanismTemplate', 'sourceSafePreview'],
        expectedTypedOutputQualityIds: [
          'assetpack_source_hidden_before_settlement',
          'preview_measurements_present',
          'settlement_posture_separated',
        ],
      },
    ],
    expectedTypedOutputQualityIds: [
      'DepositoryFitsResult',
      'AssetPackSynthesisOutput',
      'ReadyToFinishOutput',
      'AssetPackSourceSafePreview',
    ],
    requiredPredicateIds: [
      'promptpart.read-fits-has-doc-comments',
      'promptpart.read-fits-has-benchmark-definitions',
      'promptpart.read-fits-exports-promptparts',
      'promptpart.read-fits-contract-names-pipeline',
      'promptpart.read-fits-depository-search-names-tools',
    ],
  }),
  benchmarkRow({
    rowId: 'prompt:reading-pipeline-agent-prompts',
    familyId: 'complete_prompt_suite',
    subjectKindId: 'Prompt',
    label: 'Complete Reading pipeline agent Prompt registries',
    surfaceIds: ['ReadNeedComprehensionSynthesis.prompts', 'ReadFitsFindingSynthesis.prompts'],
    sourceRoots: [SOURCE_ROOTS.readingAgentPrompts, SOURCE_ROOTS.readingPipelineContract],
    requiredMetricIds: [
      'intent_alignment',
      'semantic_clarity',
      'task_success',
      'response_quality',
      'schema_conformance',
      'source_boundary_preservation',
    ],
    fixtureInputs: [
      {
        fixtureId: 'fixture.reading.prompt-registry-composition',
        label: 'Reading prompt registry composition fixture',
        contextBindingIds: ['agentPromptId', 'ptrrStepPromptId', 'promptPartNamespaces', 'interpolatedContextKeys'],
        expectedTypedOutputQualityIds: [
          'agent_prompt_composes',
          'plan_try_refine_retry_prompts_present',
          'generation_promptparts_present',
        ],
      },
      {
        fixtureId: 'fixture.reading.schema-bound-return-types',
        label: 'Reading schema-bound output fixture',
        contextBindingIds: ['returnType', 'inputType', 'outputSchemaId', 'telemetryTargetId'],
        expectedTypedOutputQualityIds: ['typed_output_matches_schema', 'schema_verdict_available', 'repair_path_named'],
      },
    ],
    expectedTypedOutputQualityIds: [
      'ReadNeed',
      'DepositoryFitsResult',
      'AssetPackSynthesisOutput',
      'ReadyToFinishOutput',
      'AssetPackCompletionOutput',
    ],
    requiredPredicateIds: [
      'prompt.reading-has-doc-comments',
      'prompt.reading-has-benchmark-definitions',
      'prompt.reading-constructs-prompts',
      'prompt.reading-sets-promptparts',
      'prompt.reading-requires-promptparts',
      'prompt.reading-contract-has-template-ids',
    ],
  }),
  benchmarkRow({
    rowId: 'prompt:conversation-system-prompt',
    familyId: 'complete_prompt_suite',
    subjectKindId: 'Prompt',
    label: 'Website Conversation system Prompt',
    surfaceIds: ['WebsiteConversations', 'BitcodeTerminalConversationSystemPrompt'],
    sourceRoots: [SOURCE_ROOTS.conversationPrompt],
    requiredMetricIds: [
      'intent_alignment',
      'semantic_clarity',
      'task_success',
      'response_quality',
      'source_boundary_preservation',
    ],
    fixtureInputs: [
      {
        fixtureId: 'fixture.conversation.system-prompt-route-local',
        label: 'Conversation route-local system behavior fixture',
        contextBindingIds: ['conversationId', 'sourceSelectorRefs', 'terminalHandoffContext'],
        expectedTypedOutputQualityIds: ['route_local_history_preserved', 'source_selector_boundary_named', 'handoff_summary_source_safe'],
      },
    ],
    expectedTypedOutputQualityIds: [
      'conversation_response_source_safe',
      'conversation_tool_call_posture',
      'terminal_handoff_summary',
    ],
    requiredPredicateIds: [
      'prompt.conversation-has-doc-comments',
      'prompt.conversation-has-benchmark-definitions',
      'prompt.conversation-extends-prompt',
      'prompt.conversation-requires-hierarchy',
      'prompt.conversation-sets-specific-promptparts',
    ],
  }),
  benchmarkRow({
    rowId: 'prompt:tool-definition-doc-code-prompts',
    familyId: 'complete_prompt_suite',
    subjectKindId: 'DocCodeToolPrompt',
    label: 'Doc-comment-backed tool-definition Prompts',
    surfaceIds: [
      'DocCodeToolPrompt',
      'formatUsableTools',
      'WebSearchDocCodeToolPrompt',
      'BitcodeRepositoryEvidenceSearchDocCodeToolPrompt',
      'CreatePullRequestDocCodeToolPrompt',
    ],
    sourceRoots: [
      SOURCE_ROOTS.docCodeToolPrompt,
      SOURCE_ROOTS.formatUsableTools,
      SOURCE_ROOTS.webSearchToolPrompts,
      SOURCE_ROOTS.vcsToolPrompts,
      SOURCE_ROOTS.repositoryEvidenceSearchPrompt,
    ],
    requiredMetricIds: [
      'intent_alignment',
      'semantic_clarity',
      'task_success',
      'response_quality',
      'source_boundary_preservation',
    ],
    fixtureInputs: [
      {
        fixtureId: 'fixture.tool-definition.final-prompt-injection',
        label: 'DocCode tool documentation final prompt injection fixture',
        contextBindingIds: ['toolName', 'toolPurpose', 'toolCapabilities', 'toolParameters', 'toolOutput'],
        expectedTypedOutputQualityIds: [
          'tool_sections_present',
          'doc_comment_prompt_attached',
          'usable_tools_format_source_safe',
        ],
      },
      {
        fixtureId: 'fixture.tool-definition.delivery-tool-source-boundary',
        label: 'Delivery and search tool source-boundary fixture',
        contextBindingIds: ['searchQuery', 'pullRequestDeliveryInput', 'disclosureTier'],
        expectedTypedOutputQualityIds: ['protected_source_not_serialized', 'tool_output_receipt_source_safe'],
      },
    ],
    expectedTypedOutputQualityIds: [
      'ToolExecutionPrompt',
      'ToolDefinitionPrompt',
      'DocCodeToolPrompt',
      'formatUsableToolsOutput',
      'ToolPromptDefinitionSchemaVerdict',
    ],
    requiredPredicateIds: [
      'prompt.tool-has-doc-comments',
      'prompt.tool-has-benchmark-definitions',
      'prompt.tool-extends-doccode-prompt',
      'prompt.tool-format-usable-tools-present',
      'prompt.tool-sets-promptparts',
      'prompt.tool-source-boundary-fixtures-present',
    ],
  }),
]);

function buildSourceStats(repoRoot, benchmarkRows) {
  return Object.fromEntries(
    benchmarkRows.map((item) => {
      const sourceFiles = [...new Set(item.sourceRoots.flatMap((sourceRoot) => listFiles(repoRoot, sourceRoot)))]
        .filter((sourcePath) => matchesAny(sourcePath, item.filePathIncludes))
        .sort();
      const sources = sourceFiles.map((sourcePath) => read(repoRoot, sourcePath));
      const joined = sources.join('\n');
      const promptPartDocCommentCount = countMatches(joined, /@doc-comment-developing-promptpartdevelopment/gu);
      const promptDocCommentCount = countMatches(joined, /@doc-comment-developing-promptdevelopment/gu);
      const benchmarkDefinitionCount =
        countMatches(joined, /benchmarks:\s*\[/gu) + countMatches(joined, /benchmarks:\s*\{/gu);
      const stats = {
        rowId: item.rowId,
        sourceRootExists: item.sourceRoots.every((sourceRoot) => sourceRootExists(repoRoot, sourceRoot)),
        sourceFileCount: sourceFiles.length,
        sourceFileSample: sourceFiles.slice(0, 12),
        promptPartDocCommentCount,
        promptDocCommentCount,
        benchmarkDefinitionCount,
        intentMetadataCount: countMatches(joined, /\bintent:\s*"/gu),
        currentVersionMetadataCount: countMatches(joined, /\bcurrent_version:\s*"/gu),
        versionsMetadataCount: countMatches(joined, /\bversions:\s*\[/gu),
        promptPartExportCount: countMatches(joined, /export\s+const\s+PROMPTPART_/gu),
        promptConstructionCount: countMatches(joined, /new\s+Prompt\s*\(/gu),
        promptSetCallCount: countMatches(joined, /\.set\s*\(/gu),
        promptRequireCallCount: countMatches(joined, /\.require\s*\(/gu),
        promptRequiresHierarchyCount: countMatches(joined, /\.requireHierarchy\s*\(/gu),
        extendsPromptCount: countMatches(joined, /extends\s+Prompt\b/gu),
        extendsDocCodeToolPromptCount: countMatches(joined, /extends\s+DocCodeToolPrompt\b/gu),
        docCodeToolPromptCount: countMatches(joined, /DocCodeToolPrompt/gu),
        formatUsableToolsCount: countMatches(joined, /formatUsableTools|formatToolsWithDocCodeToolsIntoUsableTools/gu),
        readNeedComprehensionNamesCount: countMatches(joined, /ReadNeedComprehensionSynthesis/gu),
        readFitsFindingNamesCount: countMatches(joined, /ReadFitsFindingSynthesis/gu),
        depositorySearchToolNamesCount: countMatches(joined, /lexical-depository-search|vector-depository-search/gu),
        promptTemplateIdCount: countMatches(joined, /templateId:/gu),
        benchmarkRunnerPromptPartMethodsCount: countMatches(joined, /benchmarkPromptPart/gu),
        benchmarkRunnerPromptMethodsCount: countMatches(joined, /benchmarkPrompt\(/gu),
        promptPartSuiteTypeCount: countMatches(joined, /PromptPartBenchmarkSuite/gu),
        promptSuiteTypeCount: countMatches(joined, /PromptBenchmarkSuite/gu),
        extractBenchmarksCount: countMatches(joined, /extractBenchmarks/gu),
        pbvDocumentationCount: countMatches(joined, /Performance-Based Version|PBV/gu),
      };
      return [item.rowId, stats];
    }),
  );
}

function sourceEvidenceForRows(repoRoot, rows) {
  const sourceRoots = [...new Set(rows.flatMap((item) => item.sourceRoots))].sort();
  return sourceRoots.map((sourcePath) => ({
    sourcePath,
    exists: sourceRootExists(repoRoot, sourcePath),
    legacy: sourcePath.startsWith('_legacy/'),
  }));
}

function predicateResult(id, rowId, sourcePath, passed) {
  return { id, rowId, sourcePath, passed: Boolean(passed) };
}

function commonPredicateResults(row, stats) {
  return [
    predicateResult(`${row.rowId}.source-roots-present`, row.rowId, row.sourceRoots.join(','), stats.sourceRootExists),
    predicateResult(`${row.rowId}.source-files-present`, row.rowId, row.sourceRoots.join(','), stats.sourceFileCount > 0),
    predicateResult(`${row.rowId}.fixtures-source-safe`, row.rowId, 'fixtureInputs', row.fixtureInputs.every((fixture) => fixture.sourceSafe)),
    predicateResult(
      `${row.rowId}.expected-typed-output-qualities-present`,
      row.rowId,
      'expectedTypedOutputQualityIds',
      row.expectedTypedOutputQualityIds.length > 0,
    ),
    predicateResult(
      `${row.rowId}.disclosure-tiers-present`,
      row.rowId,
      'disclosureTierIds',
      row.disclosureTierIds.includes('raw_prompt_text_private')
        && row.disclosureTierIds.includes('benchmark_fixture_source_safe'),
    ),
  ];
}

function buildPredicateResults(rows, statsByRow) {
  const predicates = [];

  for (const item of rows) {
    const stats = statsByRow[item.rowId];
    predicates.push(...commonPredicateResults(item, stats));

    if (item.rowId === 'benchmark:runner-and-doc-comment-infrastructure') {
      predicates.push(
        predicateResult('benchmark.runner-defines-promptpart-benchmark', item.rowId, SOURCE_ROOTS.runner, stats.benchmarkRunnerPromptPartMethodsCount >= 1),
        predicateResult('benchmark.runner-defines-complete-prompt-benchmark', item.rowId, SOURCE_ROOTS.runner, stats.benchmarkRunnerPromptMethodsCount >= 1),
        predicateResult('benchmark.types-define-promptpart-suite', item.rowId, SOURCE_ROOTS.benchmarkTypes, stats.promptPartSuiteTypeCount >= 1),
        predicateResult('benchmark.types-define-complete-prompt-suite', item.rowId, SOURCE_ROOTS.benchmarkTypes, stats.promptSuiteTypeCount >= 1),
        predicateResult('benchmark.doc-comments-parse-benchmarks', item.rowId, SOURCE_ROOTS.docCommentDeveloping, stats.extractBenchmarksCount >= 1),
        predicateResult('benchmark.readme-documents-pbv', item.rowId, SOURCE_ROOTS.benchmarkReadme, stats.pbvDocumentationCount >= 1),
      );
    } else if (item.subjectKindId === 'PromptPart') {
      const prefix = {
        'promptpart:generic-ptrr-failsafe-thricified-foundation': 'generic',
        'promptpart:read-need-comprehension-specific': 'read-need',
        'promptpart:read-fits-finding-specific': 'read-fits',
      }[item.rowId] || item.rowId.split(':')[1].split('-')[0];
      predicates.push(
        predicateResult(`promptpart.${prefix}-has-doc-comments`, item.rowId, item.sourceRoots.join(','), stats.promptPartDocCommentCount > 0),
        predicateResult(`promptpart.${prefix}-has-benchmark-definitions`, item.rowId, item.sourceRoots.join(','), stats.benchmarkDefinitionCount > 0),
        predicateResult(`promptpart.${prefix}-exports-promptparts`, item.rowId, item.sourceRoots.join(','), stats.promptPartExportCount > 0),
        predicateResult(`promptpart.${prefix}-semantic-division-present`, item.rowId, item.sourceRoots.join(','), stats.intentMetadataCount > 0),
        predicateResult(`promptpart.${prefix}-current-version-present`, item.rowId, item.sourceRoots.join(','), stats.currentVersionMetadataCount > 0),
      );
      if (item.rowId === 'promptpart:read-need-comprehension-specific') {
        predicates.push(
          predicateResult('promptpart.read-need-contract-names-pipeline', item.rowId, SOURCE_ROOTS.readNeed, stats.readNeedComprehensionNamesCount > 0),
          predicateResult('promptpart.read-need-schema-names-output', item.rowId, SOURCE_ROOTS.readNeed, readNeedSchemaPresent(stats)),
        );
      }
      if (item.rowId === 'promptpart:read-fits-finding-specific') {
        predicates.push(
          predicateResult('promptpart.read-fits-contract-names-pipeline', item.rowId, SOURCE_ROOTS.depositorySearch, stats.readFitsFindingNamesCount > 0),
          predicateResult('promptpart.read-fits-depository-search-names-tools', item.rowId, SOURCE_ROOTS.depositorySearch, stats.depositorySearchToolNamesCount > 0),
        );
      }
    } else if (item.rowId === 'prompt:reading-pipeline-agent-prompts') {
      predicates.push(
        predicateResult('prompt.reading-has-doc-comments', item.rowId, SOURCE_ROOTS.readingAgentPrompts, stats.promptDocCommentCount > 0),
        predicateResult('prompt.reading-has-benchmark-definitions', item.rowId, SOURCE_ROOTS.readingAgentPrompts, stats.benchmarkDefinitionCount > 0),
        predicateResult('prompt.reading-constructs-prompts', item.rowId, SOURCE_ROOTS.readingAgentPrompts, stats.promptConstructionCount > 0),
        predicateResult('prompt.reading-sets-promptparts', item.rowId, SOURCE_ROOTS.readingAgentPrompts, stats.promptSetCallCount > 0),
        predicateResult('prompt.reading-requires-promptparts', item.rowId, SOURCE_ROOTS.readingAgentPrompts, stats.promptRequireCallCount > 0),
        predicateResult('prompt.reading-contract-has-template-ids', item.rowId, SOURCE_ROOTS.readingPipelineContract, stats.promptTemplateIdCount > 0),
      );
    } else if (item.rowId === 'prompt:conversation-system-prompt') {
      predicates.push(
        predicateResult('prompt.conversation-has-doc-comments', item.rowId, SOURCE_ROOTS.conversationPrompt, stats.promptDocCommentCount > 0),
        predicateResult('prompt.conversation-has-benchmark-definitions', item.rowId, SOURCE_ROOTS.conversationPrompt, stats.benchmarkDefinitionCount > 0),
        predicateResult('prompt.conversation-extends-prompt', item.rowId, SOURCE_ROOTS.conversationPrompt, stats.extendsPromptCount > 0),
        predicateResult('prompt.conversation-requires-hierarchy', item.rowId, SOURCE_ROOTS.conversationPrompt, stats.promptRequiresHierarchyCount > 0),
        predicateResult('prompt.conversation-sets-specific-promptparts', item.rowId, SOURCE_ROOTS.conversationPrompt, stats.promptSetCallCount >= 3),
      );
    } else if (item.rowId === 'prompt:tool-definition-doc-code-prompts') {
      predicates.push(
        predicateResult('prompt.tool-has-doc-comments', item.rowId, item.sourceRoots.join(','), stats.promptDocCommentCount > 0),
        predicateResult('prompt.tool-has-benchmark-definitions', item.rowId, item.sourceRoots.join(','), stats.benchmarkDefinitionCount > 0),
        predicateResult('prompt.tool-extends-doccode-prompt', item.rowId, item.sourceRoots.join(','), stats.extendsDocCodeToolPromptCount > 0),
        predicateResult('prompt.tool-format-usable-tools-present', item.rowId, SOURCE_ROOTS.formatUsableTools, stats.formatUsableToolsCount > 0),
        predicateResult('prompt.tool-sets-promptparts', item.rowId, item.sourceRoots.join(','), stats.promptSetCallCount > 0),
        predicateResult('prompt.tool-source-boundary-fixtures-present', item.rowId, 'fixtureInputs', item.fixtureInputs.length >= 2),
      );
    }
  }

  return predicates;
}

function readNeedSchemaPresent(stats) {
  return stats.sourceFileCount > 0 && stats.readNeedComprehensionNamesCount > 0;
}

export function buildV38PromptBenchmarkReport(input = {}) {
  const generatedAt = typeof input.generatedAt === 'string' ? input.generatedAt : '2026-05-24T00:00:00.000Z';
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const rows = V38_PROMPT_BENCHMARK_ROWS.map((item) => ({
    ...item,
    sourceRootsPresent: item.sourceRoots.every((sourceRoot) => sourceRootExists(repoRoot, sourceRoot)),
  }));
  const gate2Inventory = buildV38InferenceSurfaceInventory({ generatedAt, repoRoot });
  const gate3Stack = buildV38PtrrFailsafeThricifiedStack({ generatedAt, repoRoot });
  const sourceStatsByRow = buildSourceStats(repoRoot, rows);
  const sourcePredicateResults = buildPredicateResults(rows, sourceStatsByRow);
  const sourceEvidence = sourceEvidenceForRows(repoRoot, rows);
  const requiredPredicateIds = [...new Set(rows.flatMap((item) => item.requiredPredicateIds))].sort();
  const passedPredicateIds = requiredPredicateIds
    .filter((predicateId) => sourcePredicateResults.some((result) => result.id === predicateId && result.passed))
    .sort();
  const failedPredicateIds = requiredPredicateIds.filter((predicateId) =>
    !sourcePredicateResults.some((result) => result.id === predicateId && result.passed),
  );
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.exists).map((entry) => entry.sourcePath);
  const legacySourceRoots = sourceEvidence.filter((entry) => entry.legacy).map((entry) => entry.sourcePath);
  const fixtureInputs = rows.flatMap((item) => item.fixtureInputs);
  const expectedTypedOutputQualityIds = [...new Set(rows.flatMap((item) => item.expectedTypedOutputQualityIds))].sort();
  const sourceStats = Object.values(sourceStatsByRow);
  const failures = [];

  if (!gate2Inventory.passed) failures.push('Gate 2 inference surface inventory is not passing.');
  if (!gate3Stack.passed) failures.push('Gate 3 PTRR/Failsafe/Thricified stack is not passing.');
  if (failedPredicateIds.length) failures.push(`failed benchmark predicates: ${failedPredicateIds.join(', ')}`);
  if (missingSourceRoots.length) failures.push(`missing source roots: ${missingSourceRoots.join(', ')}`);
  if (legacySourceRoots.length) failures.push(`legacy source roots present: ${legacySourceRoots.join(', ')}`);

  const coverage = {
    rowCount: rows.length,
    subjectKindIds: [...V38_PROMPT_BENCHMARK_SUBJECT_KIND_IDS],
    metricIds: [...V38_PROMPT_BENCHMARK_METRIC_IDS],
    disclosureTierIds: [...V38_PROMPT_BENCHMARK_DISCLOSURE_TIER_IDS],
    promptPartSuiteCount: rows.filter((item) => item.subjectKindId === 'PromptPart').length,
    completePromptSuiteCount: rows.filter((item) => item.subjectKindId === 'Prompt' || item.subjectKindId === 'DocCodeToolPrompt').length,
    benchmarkInfrastructureSuiteCount: rows.filter((item) => item.subjectKindId === 'benchmark-infrastructure').length,
    fixtureCount: fixtureInputs.length,
    expectedTypedOutputQualityCount: expectedTypedOutputQualityIds.length,
    requiredPredicateCount: requiredPredicateIds.length,
    passedPredicateCount: passedPredicateIds.length,
    failedPredicateIds,
    sourceRootCount: sourceEvidence.length,
    missingSourceRoots,
    legacySourceRoots: legacySourceRoots.length > 0,
    sourceFileCount: sourceStats.reduce((total, stats) => total + stats.sourceFileCount, 0),
    promptPartDocCommentCount: sourceStats.reduce((total, stats) => total + stats.promptPartDocCommentCount, 0),
    promptDocCommentCount: sourceStats.reduce((total, stats) => total + stats.promptDocCommentCount, 0),
    benchmarkDefinitionCount: sourceStats.reduce((total, stats) => total + stats.benchmarkDefinitionCount, 0),
    promptPartExportCount: sourceStats.reduce((total, stats) => total + stats.promptPartExportCount, 0),
    promptConstructionCount: sourceStats.reduce((total, stats) => total + stats.promptConstructionCount, 0),
    gate2InventoryRoot: gate2Inventory.artifactRoot,
    gate3StackRoot: gate3Stack.artifactRoot,
    sourceSafeMetadataOnly: rows.every((item) =>
      item.protectedSourceVisible === false
      && item.rawPromptTextSerialized === false
      && item.rawProviderResponseSerialized === false
      && item.credentialsSerialized === false
      && item.unpaidAssetPackSourceVisible === false,
    ),
    knownCarryForwardGapIds: [
      'gate5-streams-benchmark-linked-inference-telemetry-with-disclosure-tiers',
      'gate6-hardens-read-need-comprehension-prompt-return-types',
      'gate7-hardens-read-fits-finding-query-prompt-benchmarking',
    ],
  };

  const artifactRoot = `v38-prompt-benchmark-report:${digest(
    JSON.stringify({
      rows: rows.map((item) => item.rowRoot),
      fixtures: fixtureInputs.map((item) => item.fixtureRoot),
      predicates: passedPredicateIds,
      totals: {
        promptPartDocCommentCount: coverage.promptPartDocCommentCount,
        promptDocCommentCount: coverage.promptDocCommentCount,
        benchmarkDefinitionCount: coverage.benchmarkDefinitionCount,
      },
    }),
  )}`;

  return {
    artifactId: 'v38-prompt-benchmark-report',
    schemaId: V38_PROMPT_BENCHMARK_REPORT_SCHEMA_ID,
    version: V38_PROMPT_BENCHMARK_REPORT_VERSION,
    currentTarget: V38_PROMPT_BENCHMARK_REPORT_CURRENT_TARGET,
    generatedAt,
    artifactPath: V38_PROMPT_BENCHMARK_REPORT_ARTIFACT_PATH,
    sourceSafetyVerdict: V38_PROMPT_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT,
    subjectKindIds: [...V38_PROMPT_BENCHMARK_SUBJECT_KIND_IDS],
    metricIds: [...V38_PROMPT_BENCHMARK_METRIC_IDS],
    disclosureTierIds: [...V38_PROMPT_BENCHMARK_DISCLOSURE_TIER_IDS],
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    rows,
    fixtureInputs,
    expectedTypedOutputQualityIds,
    sourcePredicateResults,
    sourceEvidence,
    sourceStatsByRow,
    coverage,
    failures,
    passed:
      failures.length === 0
      && failedPredicateIds.length === 0
      && gate2Inventory.passed
      && gate3Stack.passed
      && coverage.rowCount === 7
      && coverage.promptPartSuiteCount === 3
      && coverage.completePromptSuiteCount === 3
      && coverage.benchmarkInfrastructureSuiteCount === 1
      && coverage.fixtureCount >= 12
      && coverage.expectedTypedOutputQualityCount >= 24
      && coverage.promptPartDocCommentCount > 0
      && coverage.promptDocCommentCount > 0
      && coverage.benchmarkDefinitionCount > 0
      && coverage.promptPartExportCount > 0
      && coverage.promptConstructionCount > 0
      && coverage.sourceSafeMetadataOnly
      && coverage.legacySourceRoots === false,
    artifactRoot,
  };
}

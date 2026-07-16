// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildConversationStreamEventContract } from './conversation-stream-event-contract.js';
import { buildV38InferenceSurfaceInventory } from './inference-surface-inventory.js';
import { buildV38PromptBenchmarkReport } from './prompt-benchmark-report.js';
import { buildV38PtrrFailsafeThricifiedStack } from './ptrr-failsafe-thricified-stack.js';
import { buildTelemetryTaxonomyCatalog } from './telemetry-taxonomy-catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_ARTIFACT_PATH =
  '.proofs/v38/disclosure-boundary-report.json';
export const V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_SCHEMA_ID =
  'bitcode.v38.inferenceTelemetryDisclosureReport.v1';
export const V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_VERSION = 'V38';
export const V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_CURRENT_TARGET = 'V37';
export const V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_SOURCE_SAFETY_VERDICT =
  'source-safe-inference-telemetry-disclosure-metadata';

export const V38_INFERENCE_TELEMETRY_REQUIRED_LEVEL_IDS = Object.freeze([
  'pipeline_phase',
  'agent',
  'ptrr_step',
  'failsafe',
  'thricified_generation',
  'tool',
  'prompt_template',
  'interpolated_prompt',
  'raw_response',
  'parsed_output',
  'schema_verdict',
  'retry',
  'repair',
]);

export const V38_INFERENCE_TELEMETRY_DISCLOSURE_TIER_IDS = Object.freeze([
  'public_status_source_safe',
  'execution_identity_source_safe',
  'prompt_template_identity_source_safe',
  'prompt_template_metadata_source_safe',
  'interpolated_prompt_private_or_redacted_shape',
  'raw_provider_response_private',
  'raw_response_root_source_safe',
  'parsed_typed_output_shape_source_safe',
  'schema_verdict_source_safe',
  'tool_input_output_shape_source_safe',
  'proof_root_source_safe',
  'operator_debug_private',
]);

export const V38_INFERENCE_TELEMETRY_EVENT_KIND_IDS = Object.freeze([
  'pipeline-phase-lifecycle',
  'ptrr-agent-step-lifecycle',
  'failsafe-sequence-lifecycle',
  'thricified-generation-lifecycle',
  'tool-execution-lifecycle',
  'prompt-template-interpolation',
  'raw-response-parsed-output-schema',
  'stream-ui-storage-projection',
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
  executionStreamAdapter: 'packages/execution-generics/src/storage/ExecutionStreamAdapter.ts',
  pipelineExecution: 'packages/pipelines-generics/src/execution/ExecutionPipeline.ts',
  sdivfFactory: 'packages/pipelines-generics/src/phases/sdivf-factory.ts',
  agentFactory: 'packages/agent-generics/src/agents/factories.ts',
  stepFactories: 'packages/agent-generics/src/steps/factories.ts',
  failsafeSequence: 'packages/agent-generics/src/steps/failsafe-sequence.ts',
  thricifiedGeneration: 'packages/agent-generics/src/steps/thinkings-generation.ts',
  generationFactories: 'packages/agent-generics/src/generations/llm-bound-factories.ts',
  instrumentation: 'packages/agent-generics/src/diagnostics/instrumentation.ts',
  toolExecution: 'packages/tools-generics/src/execution/ToolExecution.ts',
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  readingPipelineObservability: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-observability.ts',
  readNeedRealInference: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  disclosure: 'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts',
  observabilityTest: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-observability.test.ts',
  readingIntegrationCoverageTest: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-integration-coverage.test.ts',
  terminalHarnessClient: 'apps/uapi/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client.ts',
  terminalHarnessClientTest: 'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
  pipelineExecutionLog: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  pipelineExecutionLogHeader: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
  pipelineLogHeaderTest: 'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
  conversationPipelineLogTest: 'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
  telemetryTaxonomy: 'scripts/specifying/src/canonical/telemetry-taxonomy-catalog.js',
  conversationStreamContract: 'scripts/specifying/src/canonical/conversation-stream-event-contract.js',
  gate2Inventory: 'scripts/specifying/src/canonical/inference-surface-inventory.js',
  gate3Stack: 'scripts/specifying/src/canonical/ptrr-failsafe-thricified-stack.js',
  gate4PromptBenchmark: 'scripts/specifying/src/canonical/prompt-benchmark-report.js',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-inference-telemetry-disclosure-row:${digest(id)}`;
}

function read(repoRoot, sourcePath) {
  const absolute = path.join(repoRoot, sourcePath);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

function sourceRootExists(repoRoot, sourceRoot) {
  return existsSync(path.join(repoRoot, sourceRoot));
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function predicateResult(id, rowId, sourcePath, passed) {
  return { id, rowId, sourcePath, passed: Boolean(passed) };
}

function disclosureRow(input) {
  return {
    ...input,
    requiredTelemetryLevelIds: [...new Set(input.requiredTelemetryLevelIds)].sort(),
    disclosureTierIds: [...new Set(input.disclosureTierIds)].sort(),
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    sourceSafetyClass: 'source_safe_inference_telemetry_disclosure_metadata',
    promptPayloadVisible: false,
    rawProviderResponseVisible: false,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    sourceRootVisibleOnly: true,
    rowRoot: rowRoot(input.rowId),
  };
}

export const V38_INFERENCE_TELEMETRY_DISCLOSURE_ROWS = Object.freeze([
  disclosureRow({
    rowId: 'telemetry:pipeline-phase-lifecycle',
    eventKindId: 'pipeline-phase-lifecycle',
    label: 'Pipeline phase lifecycle stream rows',
    sourceRoots: [SOURCE_ROOTS.sdivfFactory, SOURCE_ROOTS.executionStreamAdapter],
    requiredTelemetryLevelIds: ['pipeline_phase', 'retry', 'repair'],
    disclosureTierIds: [
      'public_status_source_safe',
      'execution_identity_source_safe',
      'proof_root_source_safe',
    ],
    streamEventKindIds: ['phase-start', 'phase-complete', 'completion', 'error'],
    allowedPayloadFields: [
      'executionId',
      'executionNodeId',
      'executionRootId',
      'executionPath',
      'namespace',
      'key',
      'timestamp',
      'executionState.phase',
      'message',
      'phase.status',
      'phase.iteration',
    ],
    storageTargetIds: ['execution_event_store', 'phase.start', 'phase.complete'],
    proofRootFields: ['executionRootId', 'phaseRoot', 'telemetryRoot'],
    failClosedStates: ['missing_phase_identity', 'phase_error_without_source_safe_summary'],
    requiredPredicateIds: [
      'pipeline.stream-emits-phase-events',
      'pipeline.stream-summarizes-phase-input-output',
      'pipeline.adapter-infers-phase-event-types',
    ],
  }),
  disclosureRow({
    rowId: 'telemetry:ptrr-agent-step-lifecycle',
    eventKindId: 'ptrr-agent-step-lifecycle',
    label: 'PTRR agent and Plan/Try/Refine/Retry lifecycle rows',
    sourceRoots: [SOURCE_ROOTS.agentFactory, SOURCE_ROOTS.stepFactories, SOURCE_ROOTS.executionStreamAdapter],
    requiredTelemetryLevelIds: ['agent', 'ptrr_step', 'retry'],
    disclosureTierIds: [
      'execution_identity_source_safe',
      'public_status_source_safe',
      'parsed_typed_output_shape_source_safe',
      'proof_root_source_safe',
    ],
    streamEventKindIds: ['agent-start', 'agent-complete', 'work-update', 'status'],
    allowedPayloadFields: [
      'agentId',
      'agent.name',
      'ptrrStepId',
      'ptrrStepName',
      'executionState.agent',
      'executionState.step',
      'typedOutputRoot',
      'status.progress',
    ],
    storageTargetIds: ['agent.start', 'agent.complete', 'step.name', 'work-update'],
    proofRootFields: ['agentRoot', 'stepRoot', 'typedOutputRoot'],
    failClosedStates: ['missing_agent_identity', 'unknown_ptrr_step', 'typed_output_parse_failed'],
    requiredPredicateIds: [
      'ptrr.adapter-infers-agent-events',
      'ptrr.factory-builds-four-steps',
      'ptrr.step-trace-logs-source-safe-summary',
    ],
  }),
  disclosureRow({
    rowId: 'telemetry:failsafe-sequence-lifecycle',
    eventKindId: 'failsafe-sequence-lifecycle',
    label: 'FailsafeGenerationSequence context, chunking, stitch, retry, and repair rows',
    sourceRoots: [SOURCE_ROOTS.failsafeSequence, SOURCE_ROOTS.generationFactories, SOURCE_ROOTS.instrumentation],
    requiredTelemetryLevelIds: ['failsafe', 'retry', 'repair'],
    disclosureTierIds: [
      'execution_identity_source_safe',
      'interpolated_prompt_private_or_redacted_shape',
      'proof_root_source_safe',
      'operator_debug_private',
    ],
    streamEventKindIds: ['status', 'work-update', 'thinking'],
    allowedPayloadFields: [
      'failsafe',
      'contextSelectorIds',
      'contextShape',
      'chunkCount',
      'stitchState',
      'retryAttempt',
      'repairStrategy',
    ],
    storageTargetIds: ['ptrr.failsafe', 'context.full', 'context.selectors', 'chunking.required'],
    proofRootFields: ['failsafeRoot', 'contextRoot', 'repairRoot'],
    failClosedStates: ['missing_context_root', 'oversized_context_without_failsafe', 'repair_without_schema'],
    requiredPredicateIds: [
      'failsafe.source-names-prepare-chunk-stitch',
      'failsafe.instrumentation-logs-failsafe-events',
      'failsafe.trace-prunes-prompts-by-default',
    ],
  }),
  disclosureRow({
    rowId: 'telemetry:thricified-generation-lifecycle',
    eventKindId: 'thricified-generation-lifecycle',
    label: 'ThricifiedGeneration Reason/Judge/StructuredOutput rows',
    sourceRoots: [
      SOURCE_ROOTS.thricifiedGeneration,
      SOURCE_ROOTS.readNeedRealInference,
      SOURCE_ROOTS.instrumentation,
      SOURCE_ROOTS.executionStreamAdapter,
    ],
    requiredTelemetryLevelIds: [
      'thricified_generation',
      'prompt_template',
      'interpolated_prompt',
      'raw_response',
      'parsed_output',
      'schema_verdict',
    ],
    disclosureTierIds: [
      'prompt_template_identity_source_safe',
      'prompt_template_metadata_source_safe',
      'interpolated_prompt_private_or_redacted_shape',
      'raw_provider_response_private',
      'raw_response_root_source_safe',
      'parsed_typed_output_shape_source_safe',
      'schema_verdict_source_safe',
      'operator_debug_private',
    ],
    streamEventKindIds: ['generation', 'thinking', 'status', 'error'],
    allowedPayloadFields: [
      'generation',
      'reasoningPresent',
      'judgmentPresent',
      'promptTemplateId',
      'promptTemplatePresent',
      'interpolatedPromptPresent',
      'rawModelResponsePresent',
      'rawResponseRoot',
      'parsedTypedOutputPresent',
      'parsedTypeRoot',
      'schemaVerdict',
      'provider',
      'model',
      'usage',
    ],
    storageTargetIds: ['llm.input', 'llm.output', 'llm.parsedOutput', 'llm.usage'],
    proofRootFields: ['promptTemplateRoot', 'interpolatedPromptRoot', 'rawResponseRoot', 'parsedTypeRoot'],
    failClosedStates: ['raw_response_visible_in_public_stream', 'schema_parse_failed', 'prompt_without_template_id'],
    requiredPredicateIds: [
      'generation.source-stores-prompt-template-and-interpolated-prompt',
      'generation.source-stores-raw-and-parsed-output',
      'generation.adapter-maps-llm-output-to-generation',
      'generation.instrumentation-logs-start-success-error',
    ],
  }),
  disclosureRow({
    rowId: 'telemetry:tool-execution-lifecycle',
    eventKindId: 'tool-execution-lifecycle',
    label: 'Tool execution input, output, result, and policy rows',
    sourceRoots: [SOURCE_ROOTS.toolExecution, SOURCE_ROOTS.executionStreamAdapter, SOURCE_ROOTS.terminalHarnessClient],
    requiredTelemetryLevelIds: ['tool', 'schema_verdict'],
    disclosureTierIds: [
      'tool_input_output_shape_source_safe',
      'execution_identity_source_safe',
      'proof_root_source_safe',
      'operator_debug_private',
    ],
    streamEventKindIds: ['tool-use', 'status', 'error'],
    allowedPayloadFields: [
      'toolId',
      'toolName',
      'toolInputPresent',
      'toolOutputPresent',
      'toolErrorPresent',
      'toolOk',
      'inputShape',
      'outputShape',
      'policyRoot',
    ],
    storageTargetIds: ['tools.invocation', 'tools.result', 'toolEvents.invocation', 'toolEvents.result'],
    proofRootFields: ['toolInputRoot', 'toolOutputRoot', 'policyRoot'],
    failClosedStates: ['tool_payload_contains_secret', 'tool_policy_denied', 'tool_output_contains_protected_source'],
    requiredPredicateIds: [
      'tool.adapter-maps-tool-results',
      'tool.adapter-sanitizes-tool-events',
      'tool.ui-summarizes-tool-telemetry',
    ],
  }),
  disclosureRow({
    rowId: 'telemetry:prompt-template-interpolation',
    eventKindId: 'prompt-template-interpolation',
    label: 'Prompt template identity and interpolated prompt boundary rows',
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineObservability,
      SOURCE_ROOTS.readNeedRealInference,
      SOURCE_ROOTS.terminalHarnessClient,
      SOURCE_ROOTS.terminalHarnessClientTest,
      SOURCE_ROOTS.gate4PromptBenchmark,
    ],
    requiredTelemetryLevelIds: ['prompt_template', 'interpolated_prompt', 'schema_verdict'],
    disclosureTierIds: [
      'prompt_template_identity_source_safe',
      'prompt_template_metadata_source_safe',
      'interpolated_prompt_private_or_redacted_shape',
      'proof_root_source_safe',
    ],
    streamEventKindIds: ['generation', 'status'],
    allowedPayloadFields: [
      'promptTemplateId',
      'promptTemplatePresent',
      'interpolatedPromptPresent',
      'inputMessageCount',
      'promptTemplateRoot',
      'interpolatedPromptRoot',
      'contextBindingIds',
    ],
    storageTargetIds: ['llm.input.promptTemplate', 'llm.input.interpolatedPrompt', 'readingPipelineTelemetry'],
    proofRootFields: ['promptTemplateRoot', 'interpolatedPromptRoot', 'promptBenchmarkRoot'],
    failClosedStates: ['missing_prompt_template_id', 'interpolated_prompt_publicly_visible', 'context_binding_missing'],
    requiredPredicateIds: [
      'prompt.observability-records-template-and-interpolation-flags',
      'prompt.harness-stream-summarizes-template-and-interpolation',
      'prompt.benchmark-report-bound-to-telemetry',
    ],
  }),
  disclosureRow({
    rowId: 'telemetry:raw-response-parsed-output-schema',
    eventKindId: 'raw-response-parsed-output-schema',
    label: 'Raw response root, parsed typed output shape, and schema verdict rows',
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineObservability,
      SOURCE_ROOTS.readNeedRealInference,
      SOURCE_ROOTS.readingIntegrationCoverageTest,
      SOURCE_ROOTS.observabilityTest,
      SOURCE_ROOTS.terminalHarnessClientTest,
    ],
    requiredTelemetryLevelIds: ['raw_response', 'parsed_output', 'schema_verdict', 'repair'],
    disclosureTierIds: [
      'raw_provider_response_private',
      'raw_response_root_source_safe',
      'parsed_typed_output_shape_source_safe',
      'schema_verdict_source_safe',
      'operator_debug_private',
    ],
    streamEventKindIds: ['generation', 'error', 'status'],
    allowedPayloadFields: [
      'rawModelResponsePresent',
      'rawResponseRoot',
      'parsedTypedOutputPresent',
      'parsedOutputPresent',
      'parsedShape',
      'outputSchema',
      'returnType',
      'schemaVerdict',
      'repairAttempt',
    ],
    storageTargetIds: ['llm.output.rawResponse', 'llm.parsedOutput.parsedTypedOutput', 'readingPipelineTelemetry.outputSchema'],
    proofRootFields: ['rawResponseRoot', 'parsedTypeRoot', 'schemaVerdictRoot', 'repairRoot'],
    failClosedStates: ['raw_response_visible_to_reader', 'parsed_output_missing_schema', 'repair_untracked'],
    requiredPredicateIds: [
      'schema.tests-cover-raw-and-parsed-output-evidence',
      'schema.observability-records-raw-and-parsed-evidence',
      'schema.harness-metadata-carries-inference-audit-shape',
    ],
  }),
  disclosureRow({
    rowId: 'telemetry:stream-ui-storage-projection',
    eventKindId: 'stream-ui-storage-projection',
    label: 'Execution stream storage projection and rich log UI rows',
    sourceRoots: [
      SOURCE_ROOTS.executionStreamAdapter,
      SOURCE_ROOTS.readingPipelineObservability,
      SOURCE_ROOTS.terminalHarnessClient,
      SOURCE_ROOTS.pipelineExecutionLog,
      SOURCE_ROOTS.pipelineExecutionLogHeader,
      SOURCE_ROOTS.pipelineLogHeaderTest,
      SOURCE_ROOTS.conversationPipelineLogTest,
      SOURCE_ROOTS.conversationStreamContract,
      SOURCE_ROOTS.telemetryTaxonomy,
    ],
    requiredTelemetryLevelIds: [
      'pipeline_phase',
      'agent',
      'ptrr_step',
      'failsafe',
      'thricified_generation',
      'tool',
      'prompt_template',
      'interpolated_prompt',
      'raw_response',
      'parsed_output',
      'schema_verdict',
      'retry',
      'repair',
    ],
    disclosureTierIds: [...V38_INFERENCE_TELEMETRY_DISCLOSURE_TIER_IDS],
    streamEventKindIds: [
      'phase-start',
      'phase-complete',
      'agent-start',
      'agent-complete',
      'tool-use',
      'generation',
      'thinking',
      'error',
      'completion',
      'status',
      'work-update',
    ],
    allowedPayloadFields: [
      'collapsed_status',
      'expanded_metadata',
      'readingPipelineTelemetry',
      'inferenceAudit.shape',
      'proof_roots',
      'redaction_posture',
      'prompt_disclosure_posture',
      'result_disclosure_posture',
      'fail_closed_states',
    ],
    storageTargetIds: ['execution_event_store', 'execution_stream', 'PipelineExecutionLog.status.metadata'],
    proofRootFields: ['eventRoot', 'executionRoot', 'telemetryRoot', 'redactionRoot'],
    failClosedStates: ['unsafe_stream_payload', 'missing_redaction_posture', 'protected_source_visible', 'unpaid_assetpack_source_visible'],
    requiredPredicateIds: [
      'stream.adapter-sanitizes-large-and-sensitive-fields',
      'stream.ui-renders-expanded-metadata',
      'stream.terminal-harness-carries-reading-telemetry',
      'stream.v35-and-v37-catalogs-bound',
    ],
  }),
]);

function buildSourceStats(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, read(repoRoot, sourcePath)]),
  );
  const joined = Object.values(sources).join('\n');
  return {
    sources,
    sourceRootEvidence: Object.values(SOURCE_ROOTS).map((sourcePath) => ({
      sourcePath,
      exists: sourceRootExists(repoRoot, sourcePath),
      legacy: sourcePath.startsWith('_legacy/'),
    })),
    executionStreamEventTypeCount: countMatches(sources.executionStreamAdapter, /ExecutionStreamEventType/gu),
    phaseStartCount: countMatches(sources.executionStreamAdapter + sources.sdivfFactory, /phase-start|PHASE_START|storePhaseStart/gu),
    phaseCompleteCount: countMatches(sources.executionStreamAdapter + sources.sdivfFactory, /phase-complete|PHASE_COMPLETE|storePhaseComplete/gu),
    agentStartCount: countMatches(sources.executionStreamAdapter + sources.stepFactories, /agent-start|AGENT_START|agent[.:]start|'start'/gu),
    agentCompleteCount: countMatches(sources.executionStreamAdapter + sources.stepFactories, /agent-complete|AGENT_COMPLETE|agent[.:]complete|'complete'/gu),
    workUpdateCount: countMatches(sources.executionStreamAdapter + sources.stepFactories, /work-update|WORK_UPDATE/gu),
    failsafeEventCount: countMatches(sources.instrumentation + sources.failsafeSequence, /logFailsafeEvent|prepare-context|chunk-then-sum|stitch-until-complete/gu),
    thricifiedStageCount: countMatches(sources.readNeedRealInference + sources.thricifiedGeneration, /reason|judge|structured_output|structured-output/gu),
    llmSubstepStartCount: countMatches(sources.instrumentation, /logLLMGenerationStart/gu),
    llmSubstepSuccessCount: countMatches(sources.instrumentation, /logLLMGenerationSuccess/gu),
    llmSubstepErrorCount: countMatches(sources.instrumentation, /logLLMGenerationError/gu),
    fullPromptFlagCount: countMatches(sources.instrumentation, /DIAG_FULL_PROMPTS/gu),
    promptIoSidecarFlagCount: countMatches(sources.instrumentation, /DIAG_WRITE_PROMPT_IO/gu),
    promptPruneCount: countMatches(sources.instrumentation, /formatted_len|avoid leaking content|slice\(0, 200\)/gu),
    sanitizeDeleteCount: countMatches(sources.executionStreamAdapter, /delete sanitized\.(fullContent|rawData|tokens|embeddings)/gu),
    truncateLongStringCount: countMatches(sources.executionStreamAdapter, /length > 1000|substring\(0, 1000\)/gu),
    toolResultCount: countMatches(sources.executionStreamAdapter + sources.terminalHarnessClient, /tool-use|TOOL_USE|toolInputPresent|toolOutputPresent|toolErrorPresent/gu),
    promptTemplateFlagCount: countMatches(joined, /promptTemplatePresent|promptTemplateId|promptTemplateRoot|promptTemplate:/gu),
    interpolatedPromptFlagCount: countMatches(joined, /interpolatedPromptPresent|interpolatedPrompt|interpolatedPromptRoot/gu),
    rawResponseFlagCount: countMatches(joined, /rawModelResponsePresent|rawResponse|rawResponseRoot|rawProviderResponse/gu),
    parsedTypedOutputFlagCount: countMatches(joined, /parsedTypedOutputPresent|parsedTypedOutput|parsedTypeRoot/gu),
    schemaVerdictCount: countMatches(joined, /outputSchema|returnType|schemaVerdict|schema:/gu),
    readingTelemetryCount: countMatches(joined, /readingPipelineTelemetry|READING_PIPELINE_TELEMETRY_LEVELS/gu),
    inferenceAuditCount: countMatches(joined, /inferenceAudit/gu),
    richLogComponentCount: countMatches(joined, /PipelineExecutionLog|expandedMetadata|metadata|accordion|inferenceAudit/gu),
    v35TelemetryBindingCount: countMatches(sources.telemetryTaxonomy, /ptrr_agent|thricified_generation|source-safe-telemetry-taxonomy-metadata/gu),
    v37StreamBindingCount: countMatches(sources.conversationStreamContract, /source-safe-conversation-stream-event-metadata|rawModelResponseVisible|prompt_template_id_only/gu),
  };
}

function buildPredicateResults(rows, stats, repoRoot) {
  const predicates = [];
  for (const item of rows) {
    predicates.push(
      predicateResult(`${item.rowId}.source-roots-present`, item.rowId, item.sourceRoots.join(','), item.sourceRoots.every((sourceRoot) => sourceRootExists(repoRoot, sourceRoot) || stats.sourceRootEvidence.some((entry) => entry.sourcePath === sourceRoot && entry.exists))),
      predicateResult(`${item.rowId}.disclosure-tiers-present`, item.rowId, 'disclosureTierIds', item.disclosureTierIds.length > 0),
      predicateResult(`${item.rowId}.forbidden-payloads-listed`, item.rowId, 'forbiddenPayloadClasses', includesAll(item.forbiddenPayloadClasses, FORBIDDEN_PAYLOAD_CLASSES)),
      predicateResult(`${item.rowId}.source-safe-booleans-false`, item.rowId, 'sourceSafetyClass', !item.promptPayloadVisible && !item.rawProviderResponseVisible && !item.protectedSourceVisible && !item.unpaidAssetPackSourceVisible && !item.credentialsSerialized),
      predicateResult(`${item.rowId}.proof-roots-present`, item.rowId, 'proofRootFields', item.proofRootFields.length > 0),
    );

    if (item.rowId === 'telemetry:pipeline-phase-lifecycle') {
      predicates.push(
        predicateResult('pipeline.stream-emits-phase-events', item.rowId, SOURCE_ROOTS.sdivfFactory, stats.phaseStartCount > 0 && stats.phaseCompleteCount > 0),
        predicateResult('pipeline.stream-summarizes-phase-input-output', item.rowId, SOURCE_ROOTS.sdivfFactory, stats.sources.sdivfFactory.includes('summarizePhaseValue')),
        predicateResult('pipeline.adapter-infers-phase-event-types', item.rowId, SOURCE_ROOTS.executionStreamAdapter, stats.sources.executionStreamAdapter.includes('PHASE_START') && stats.sources.executionStreamAdapter.includes('PHASE_COMPLETE')),
      );
    }

    if (item.rowId === 'telemetry:ptrr-agent-step-lifecycle') {
      predicates.push(
        predicateResult('ptrr.adapter-infers-agent-events', item.rowId, SOURCE_ROOTS.executionStreamAdapter, stats.agentStartCount > 0 && stats.agentCompleteCount > 0),
        predicateResult('ptrr.factory-builds-four-steps', item.rowId, SOURCE_ROOTS.agentFactory, stats.sources.agentFactory.includes('Plan') && stats.sources.agentFactory.includes('Try') && stats.sources.agentFactory.includes('Refine') && stats.sources.agentFactory.includes('Retry')),
        predicateResult('ptrr.step-trace-logs-source-safe-summary', item.rowId, SOURCE_ROOTS.instrumentation, stats.sources.instrumentation.includes('logStepTrace')),
      );
    }

    if (item.rowId === 'telemetry:failsafe-sequence-lifecycle') {
      predicates.push(
        predicateResult('failsafe.source-names-prepare-chunk-stitch', item.rowId, SOURCE_ROOTS.failsafeSequence, stats.failsafeEventCount >= 3),
        predicateResult('failsafe.instrumentation-logs-failsafe-events', item.rowId, SOURCE_ROOTS.instrumentation, stats.sources.instrumentation.includes('logFailsafeEvent')),
        predicateResult('failsafe.trace-prunes-prompts-by-default', item.rowId, SOURCE_ROOTS.instrumentation, stats.promptPruneCount > 0),
      );
    }

    if (item.rowId === 'telemetry:thricified-generation-lifecycle') {
      predicates.push(
        predicateResult('generation.source-stores-prompt-template-and-interpolated-prompt', item.rowId, SOURCE_ROOTS.readNeedRealInference, stats.promptTemplateFlagCount > 0 && stats.interpolatedPromptFlagCount > 0),
        predicateResult('generation.source-stores-raw-and-parsed-output', item.rowId, SOURCE_ROOTS.readNeedRealInference, stats.rawResponseFlagCount > 0 && stats.parsedTypedOutputFlagCount > 0),
        predicateResult('generation.adapter-maps-llm-output-to-generation', item.rowId, SOURCE_ROOTS.executionStreamAdapter, stats.sources.executionStreamAdapter.includes("namespace === 'llm'") && stats.sources.executionStreamAdapter.includes('GENERATION')),
        predicateResult('generation.instrumentation-logs-start-success-error', item.rowId, SOURCE_ROOTS.instrumentation, stats.llmSubstepStartCount > 0 && stats.llmSubstepSuccessCount > 0 && stats.llmSubstepErrorCount > 0),
      );
    }

    if (item.rowId === 'telemetry:tool-execution-lifecycle') {
      predicates.push(
        predicateResult('tool.adapter-maps-tool-results', item.rowId, SOURCE_ROOTS.executionStreamAdapter, stats.sources.executionStreamAdapter.includes("namespace === 'tools'") && stats.sources.executionStreamAdapter.includes('TOOL_USE')),
        predicateResult('tool.adapter-sanitizes-tool-events', item.rowId, SOURCE_ROOTS.executionStreamAdapter, stats.sanitizeDeleteCount >= 4),
        predicateResult('tool.ui-summarizes-tool-telemetry', item.rowId, SOURCE_ROOTS.terminalHarnessClient, stats.toolResultCount > 0),
      );
    }

    if (item.rowId === 'telemetry:prompt-template-interpolation') {
      predicates.push(
        predicateResult('prompt.observability-records-template-and-interpolation-flags', item.rowId, SOURCE_ROOTS.readingPipelineObservability, stats.sources.readingPipelineObservability.includes('promptTemplatePresent') && stats.sources.readingPipelineObservability.includes('interpolatedPromptPresent')),
        predicateResult('prompt.harness-stream-summarizes-template-and-interpolation', item.rowId, SOURCE_ROOTS.terminalHarnessClient, stats.sources.terminalHarnessClient.includes('prompt template present') && stats.sources.terminalHarnessClient.includes('interpolated prompt present')),
        predicateResult('prompt.benchmark-report-bound-to-telemetry', item.rowId, SOURCE_ROOTS.gate4PromptBenchmark, stats.sources.gate4PromptBenchmark.includes('V38_PROMPT_BENCHMARK')),
      );
    }

    if (item.rowId === 'telemetry:raw-response-parsed-output-schema') {
      predicates.push(
        predicateResult('schema.tests-cover-raw-and-parsed-output-evidence', item.rowId, `${SOURCE_ROOTS.readingIntegrationCoverageTest},${SOURCE_ROOTS.observabilityTest}`, stats.sources.readingIntegrationCoverageTest.includes('parsedTypedOutput') && stats.sources.observabilityTest.includes('rawModelResponsePresent')),
        predicateResult('schema.observability-records-raw-and-parsed-evidence', item.rowId, SOURCE_ROOTS.readingPipelineObservability, stats.sources.readingPipelineObservability.includes('rawModelResponsePresent') && stats.sources.readingPipelineObservability.includes('parsedTypedOutputPresent')),
        predicateResult('schema.harness-metadata-carries-inference-audit-shape', item.rowId, SOURCE_ROOTS.terminalHarnessClientTest, stats.sources.terminalHarnessClientTest.includes('inferenceAudit') && stats.sources.terminalHarnessClientTest.includes('rawModelResponse')),
      );
    }

    if (item.rowId === 'telemetry:stream-ui-storage-projection') {
      predicates.push(
        predicateResult('stream.adapter-sanitizes-large-and-sensitive-fields', item.rowId, SOURCE_ROOTS.executionStreamAdapter, stats.sanitizeDeleteCount >= 4 && stats.truncateLongStringCount > 0),
        predicateResult('stream.ui-renders-expanded-metadata', item.rowId, SOURCE_ROOTS.pipelineExecutionLog, stats.sources.pipelineExecutionLog.includes('metadata') && stats.sources.pipelineExecutionLog.includes('Execution')),
        predicateResult('stream.terminal-harness-carries-reading-telemetry', item.rowId, SOURCE_ROOTS.terminalHarnessClient, stats.readingTelemetryCount > 0 && stats.inferenceAuditCount > 0),
        predicateResult('stream.v35-and-v37-catalogs-bound', item.rowId, `${SOURCE_ROOTS.telemetryTaxonomy},${SOURCE_ROOTS.conversationStreamContract}`, stats.v35TelemetryBindingCount > 0 && stats.v37StreamBindingCount > 0),
      );
    }
  }
  return predicates;
}

export function buildV38InferenceTelemetryDisclosureReport(input = {}) {
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = [...V38_INFERENCE_TELEMETRY_DISCLOSURE_ROWS];
  const stats = buildSourceStats(repoRoot);
  const sourcePredicateResults = buildPredicateResults(rows, stats, repoRoot);
  const failedPredicateIds = sourcePredicateResults.filter((result) => !result.passed).map((result) => result.id);
  const sourceEvidence = stats.sourceRootEvidence;
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.exists).map((entry) => entry.sourcePath);
  const legacySourceRoots = sourceEvidence.some((entry) => entry.legacy);
  const requiredTelemetryLevelIds = [...new Set(rows.flatMap((row) => row.requiredTelemetryLevelIds))].sort();
  const disclosureTierIds = [...new Set(rows.flatMap((row) => row.disclosureTierIds))].sort();
  const streamEventKindIds = [...new Set(rows.flatMap((row) => row.streamEventKindIds))].sort();
  const gate2Inventory = buildV38InferenceSurfaceInventory({ generatedAt, repoRoot });
  const gate3Stack = buildV38PtrrFailsafeThricifiedStack({ generatedAt, repoRoot });
  const gate4PromptBenchmark = buildV38PromptBenchmarkReport({ generatedAt, repoRoot });
  const telemetryTaxonomy = buildTelemetryTaxonomyCatalog({ generatedAt, repoRoot });
  const conversationStream = buildConversationStreamEventContract({ generatedAt, repoRoot });

  const missingTelemetryLevelIds = V38_INFERENCE_TELEMETRY_REQUIRED_LEVEL_IDS.filter(
    (levelId) => !requiredTelemetryLevelIds.includes(levelId),
  );
  const missingDisclosureTierIds = V38_INFERENCE_TELEMETRY_DISCLOSURE_TIER_IDS.filter(
    (tierId) => !disclosureTierIds.includes(tierId),
  );
  const missingEventKindIds = V38_INFERENCE_TELEMETRY_EVENT_KIND_IDS.filter(
    (kindId) => !rows.some((row) => row.eventKindId === kindId),
  );
  const rowSafetyFailures = rows
    .filter(
      (row) =>
        row.promptPayloadVisible ||
        row.rawProviderResponseVisible ||
        row.protectedSourceVisible ||
        row.unpaidAssetPackSourceVisible ||
        row.credentialsSerialized ||
        row.walletPrivateMaterialVisible,
    )
    .map((row) => row.rowId);

  const failures = [
    ...missingTelemetryLevelIds.map((levelId) => `missing telemetry level ${levelId}`),
    ...missingDisclosureTierIds.map((tierId) => `missing disclosure tier ${tierId}`),
    ...missingEventKindIds.map((kindId) => `missing telemetry event kind ${kindId}`),
    ...missingSourceRoots.map((sourceRoot) => `missing source root ${sourceRoot}`),
    ...failedPredicateIds.map((predicateId) => `failed source predicate ${predicateId}`),
    ...rowSafetyFailures.map((rowId) => `row exposes protected payload posture ${rowId}`),
    ...(legacySourceRoots ? ['V38 inference telemetry disclosure report references _legacy source roots'] : []),
  ];

  const coverage = {
    rowCount: rows.length,
    requiredTelemetryLevelCount: requiredTelemetryLevelIds.length,
    requiredTelemetryLevelIds,
    missingTelemetryLevelIds,
    disclosureTierCount: disclosureTierIds.length,
    disclosureTierIds,
    missingDisclosureTierIds,
    eventKindCount: rows.length,
    missingEventKindIds,
    streamEventKindIds,
    requiredPredicateCount: sourcePredicateResults.length,
    passedPredicateCount: sourcePredicateResults.filter((result) => result.passed).length,
    failedPredicateIds,
    missingSourceRoots,
    legacySourceRoots,
    sourceSafeMetadataOnly: true,
    promptPayloadVisible: false,
    rawProviderResponseVisible: false,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    v35TelemetryTaxonomyRoot: telemetryTaxonomy.artifactRoot,
    v37ConversationStreamRoot: conversationStream.artifactRoot,
    gate2InventoryRoot: gate2Inventory.artifactRoot,
    gate3StackRoot: gate3Stack.artifactRoot,
    gate4PromptBenchmarkRoot: gate4PromptBenchmark.artifactRoot,
    executionStreamEventTypeCount: stats.executionStreamEventTypeCount,
    sanitizeDeleteCount: stats.sanitizeDeleteCount,
    readingTelemetryCount: stats.readingTelemetryCount,
    inferenceAuditCount: stats.inferenceAuditCount,
    promptTemplateFlagCount: stats.promptTemplateFlagCount,
    interpolatedPromptFlagCount: stats.interpolatedPromptFlagCount,
    rawResponseFlagCount: stats.rawResponseFlagCount,
    parsedTypedOutputFlagCount: stats.parsedTypedOutputFlagCount,
    schemaVerdictCount: stats.schemaVerdictCount,
  };

  const artifactSeed = {
    version: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_VERSION,
    currentTarget: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_CURRENT_TARGET,
    rows: rows.map((row) => row.rowRoot),
    coverage,
    sourceSafetyVerdict: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v38-inference-telemetry-disclosure-report',
    schemaId: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_SCHEMA_ID,
    version: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_VERSION,
    currentTarget: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_CURRENT_TARGET,
    generatedAt,
    artifactPath: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_ARTIFACT_PATH,
    artifactRoot: `v38-inference-telemetry-disclosure-report:${digest(JSON.stringify(artifactSeed))}`,
    sourceSafetyVerdict: V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_SOURCE_SAFETY_VERDICT,
    passed: failures.length === 0,
    failures,
    telemetryLevelIds: [...V38_INFERENCE_TELEMETRY_REQUIRED_LEVEL_IDS],
    disclosureTierIds: [...V38_INFERENCE_TELEMETRY_DISCLOSURE_TIER_IDS],
    eventKindIds: [...V38_INFERENCE_TELEMETRY_EVENT_KIND_IDS],
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    rows,
    sourceEvidence,
    sourcePredicateResults,
    coverage,
    upstreamProofRoots: {
      v35TelemetryTaxonomyRoot: telemetryTaxonomy.artifactRoot,
      v37ConversationStreamRoot: conversationStream.artifactRoot,
      gate2InventoryRoot: gate2Inventory.artifactRoot,
      gate3StackRoot: gate3Stack.artifactRoot,
      gate4PromptBenchmarkRoot: gate4PromptBenchmark.artifactRoot,
    },
    redactionBoundary: {
      allowedPublicPayloadClasses: [
        'event_ids',
        'execution_ids',
        'phase_ids',
        'agent_ids',
        'ptrr_step_ids',
        'failsafe_ids',
        'thricified_generation_ids',
        'tool_ids',
        'prompt_template_ids',
        'schema_ids',
        'proof_roots',
        'source_safe_shapes',
        'counts',
        'state_enums',
      ],
      privateOrOperatorOnlyPayloadClasses: [
        'interpolated_prompt_content',
        'raw_provider_response_content',
        'full_prompt_sidecars',
        'operator_debug_sidecars',
      ],
      forbiddenPublicPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
  };
}

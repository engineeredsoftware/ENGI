// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_INFERENCE_SURFACE_INVENTORY_ARTIFACT_PATH = '.bitcode/v38-inference-surface-inventory.json';
export const V38_INFERENCE_SURFACE_INVENTORY_SCHEMA_ID = 'bitcode.v38.inferenceSurfaceInventory.v1';
export const V38_INFERENCE_SURFACE_INVENTORY_VERSION = 'V38';
export const V38_INFERENCE_SURFACE_INVENTORY_CURRENT_TARGET = 'V37';
export const V38_INFERENCE_SURFACE_INVENTORY_SOURCE_SAFETY_VERDICT =
  'source-safe-inference-surface-metadata';

export const V38_INFERENCE_SURFACE_REQUIRED_FAMILY_IDS = Object.freeze([
  'reading_pipeline',
  'conversation_agent',
  'tool_definition_prompt',
  'interface_entrypoint',
  'prompt_registry',
  'execution_primitive',
]);

export const V38_INFERENCE_SURFACE_REQUIRED_PRIMITIVE_IDS = Object.freeze([
  'PipelineExecution',
  'PipelinePromptRegistry',
  'PipelineAgentRegistry',
  'factoryPTRRAgent',
  'AgentPrompt',
  'AgentStepPrompt',
  'FailsafeGenerationSequence',
  'ThricifiedGeneration',
  'ToolExecution',
  'DocCodeToolPrompt',
  'PromptPart',
  'PromptExecution',
]);

export const V38_INFERENCE_SURFACE_REQUIRED_READING_PIPELINE_NAMES = Object.freeze([
  'ReadNeedComprehensionSynthesis',
  'ReadFitsFindingSynthesis',
]);

export const V38_INFERENCE_SURFACE_DISCLOSURE_TIER_IDS = Object.freeze([
  'prompt_template_id',
  'prompt_template_source_safe',
  'interpolated_prompt_source_safe',
  'raw_provider_response_private',
  'parsed_typed_output_source_safe',
  'tool_input_output_source_safe',
  'proof_root_source_safe',
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
  readingContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  embeddingConfig: 'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
  runtimeInferencePolicy: 'packages/asset-packs-pipelines/domain/src/runtime-inference-policy.ts',
  conversationAgent: 'packages/conversations/src/agent/ConversationAgent.ts',
  conversationSystemPrompt: 'packages/conversations/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
  conversationRoute: 'packages/api/src/routes/conversations.ts',
  conversationStreamEvents: 'packages/api/src/conversations/stream-events.ts',
  conversationStreamUi: 'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  pipelineExecution: 'packages/pipelines-generics/src/execution/PipelineExecution.ts',
  pipelinePromptRegistry: 'packages/pipelines-generics/src/execution/PipelinePromptRegistry.ts',
  pipelineAgentRegistry: 'packages/pipelines-generics/src/execution/PipelineAgentRegistry.ts',
  ptrrFactory: 'packages/agent-generics/src/agents/factories.ts',
  stepFactories: 'packages/agent-generics/src/steps/factories.ts',
  failsafeSequence: 'packages/agent-generics/src/steps/failsafe-sequence.ts',
  thricifiedGeneration: 'packages/agent-generics/src/steps/thinkings-generation.ts',
  agentPromptsRegistry: 'packages/agent-generics/src/execution/AgentPromptsRegistry.ts',
  agentToolsRegistry: 'packages/agent-generics/src/execution/AgentToolsRegistry.ts',
  promptPart: 'packages/prompts/src/parts/PromptPart.ts',
  templatedPromptPart: 'packages/prompts/src/parts/TemplatedPromptPart.ts',
  promptExecution: 'packages/prompts/src/execution/PromptExecution.ts',
  promptBenchmarkingRunner: 'packages/prompts/src/benchmarking/runner.ts',
  toolExecution: 'packages/tools-generics/src/execution/ToolExecution.ts',
  toolPromptRegistry: 'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
  docCodeToolPrompt: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
  formatUsableTools: 'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
  chatGptToolDocPrompts: 'packages/external-apps/chatgpt/src/prompts/chatgpt-tool-doc-prompts.ts',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-inference-surface-row:${digest(id)}`;
}

function surfaceRow(input) {
  const providerCallCount = input.thricifiedGenerationCount * 3;
  return {
    ...input,
    providerCallCount,
    primitiveStack: input.primitiveStack || [
      'PipelineExecution',
      'PTRR agent',
      'PTRR step',
      'FailsafeGenerationSequence',
      'ThricifiedGeneration',
      'provider call',
    ],
    disclosureTierIds: [...V38_INFERENCE_SURFACE_DISCLOSURE_TIER_IDS],
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    protectedSourceVisible: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    sourceSafetyClass: 'source_safe_inference_surface_metadata',
    rowRoot: rowRoot(input.surfaceId),
  };
}

export const V38_INFERENCE_SURFACE_ROWS = Object.freeze([
  surfaceRow({
    surfaceId: 'reading:ReadNeedComprehensionSynthesis',
    familyId: 'reading_pipeline',
    label: 'ReadNeedComprehensionSynthesis pipeline',
    purpose:
      'Synthesize a source-constrained enterprise Read Request into a reviewable Need before any Finding Fits work may run.',
    pipelineName: 'ReadNeedComprehensionSynthesis',
    sourceRoots: [SOURCE_ROOTS.readingContract, SOURCE_ROOTS.readNeed, SOURCE_ROOTS.runtimeInferencePolicy],
    phaseCount: 4,
    ptrrAgentCount: 4,
    ptrrStepCount: 16,
    failsafeSequenceCount: 48,
    thricifiedGenerationCount: 48,
    toolCount: 0,
    promptRegistryIds: [
      'ReadNeedComprehensionSynthesis.prompt.request.normalize.agent',
      'ReadNeedComprehensionSynthesis.prompt.comprehend.need-synthesizer.agent',
      'ReadNeedComprehensionSynthesis.prompt.measure.need-measurement.agent',
      'ReadNeedComprehensionSynthesis.prompt.review.operator-review.agent',
    ],
    promptPartNamespaces: ['agent/*', 'ptrr/*/purpose', 'generation:*', 'failsafe:*'],
    interpolationBindingIds: [
      'read.prompt',
      'sourceConstraints',
      'targetArtifactKinds',
      'closureCriteria',
      'feedbackHistory',
    ],
    contextFieldIds: [
      'TerminalReadRequest',
      'ReadNeedSourceInput',
      'sourceRevision',
      'feedbackHistory',
      'reviewState',
      'measurementRoot',
    ],
    outputSchemaIds: [
      'ReadNeedSourceInput',
      'ReadNeed',
      'ReadNeedPricingMeasurementInputs',
      'AcceptedReadNeed',
      'ResynthesisRequestedReadNeed',
    ],
    failureSurfaceIds: [
      'missing_read_request',
      'invalid_source_revision',
      'need_overreach',
      'need_underreach',
      'review_not_accepted',
    ],
    storageTargetIds: [
      'read/request.normalized',
      'read/need.current',
      'read/need.measurementRoot',
      'read/need.acceptanceRoot',
    ],
    streamTargetIds: [
      'read-need.prompt-template',
      'read-need.interpolated-prompt',
      'read-need.parsed-typed-output',
      'read-need.review-state',
    ],
    knownGapIds: [],
  }),
  surfaceRow({
    surfaceId: 'reading:ReadFitsFindingSynthesis',
    familyId: 'reading_pipeline',
    label: 'ReadFitsFindingSynthesis pipeline',
    purpose:
      'Admit an accepted Need, find many qualifying depository fits, synthesize the AssetPack, preview source-safe measurements, and settle before delivery.',
    pipelineName: 'ReadFitsFindingSynthesis',
    sourceRoots: [
      SOURCE_ROOTS.readingContract,
      SOURCE_ROOTS.readNeed,
      SOURCE_ROOTS.depositorySearch,
      SOURCE_ROOTS.embeddingConfig,
      SOURCE_ROOTS.runtimeInferencePolicy,
    ],
    phaseCount: 7,
    ptrrAgentCount: 8,
    ptrrStepCount: 32,
    failsafeSequenceCount: 96,
    thricifiedGenerationCount: 96,
    toolCount: 4,
    promptRegistryIds: [
      'ReadFitsFindingSynthesis.prompt.prepare.setup-plan.agent',
      'ReadFitsFindingSynthesis.prompt.prepare.read-comprehension.agent',
      'ReadFitsFindingSynthesis.prompt.discovery.finding-fits.agent',
      'ReadFitsFindingSynthesis.prompt.implementation.asset-pack.agent',
      'ReadFitsFindingSynthesis.prompt.validate.fit-quality.agent',
    ],
    promptPartNamespaces: ['agent/*', 'ptrr/*/purpose', 'generation:*', 'failsafe:*', 'tool:doc-code:*'],
    interpolationBindingIds: [
      'acceptedReadNeed',
      'definitionOfRead',
      'depositorySearchResult',
      'fitDepositAssetIds',
      'fitDeposits',
      'sourceRevision',
      'sourceSafePreview',
      'deliveryMechanismTemplate',
    ],
    contextFieldIds: [
      'AcceptedReadNeed',
      'DepositorySearchRead',
      'DepositoryFitsResult',
      'AssetPackSynthesisOutput',
      'AssetPackSourceSafePreview',
      'ShareToFeeQuote',
    ],
    outputSchemaIds: [
      'ReadFitsFindingAdmission',
      'PlanSchema',
      'BoundedReadComprehensionSchema',
      'DepositoryFitsResult',
      'AssetPackSynthesisOutput',
      'ReadyToFinishOutput',
      'AssetPackSourceSafePreview',
      'AssetPackCompletionOutput',
    ],
    toolIds: [
      'ReadFitsFindingSynthesis.tool.lexical-depository-search',
      'ReadFitsFindingSynthesis.tool.vector-depository-search',
      'ReadFitsFindingSynthesis.tool.verification-evidence',
      'ReadFitsFindingSynthesis.tool.vcs-create-pull-request',
    ],
    failureSurfaceIds: [
      'need_not_accepted',
      'no_worthy_fit',
      'blocked_readiness',
      'search_threshold_not_met',
      'source_visibility_before_settlement',
      'settlement_readback_missing',
    ],
    storageTargetIds: [
      'fit/admission.result',
      'depository/search.result',
      'fit/deposits',
      'implementation.assetPack',
      'asset-pack/preview.sourceSafe',
      'ledger.settlement',
      'finish.pullRequestUrl',
    ],
    streamTargetIds: [
      'finding-fits.tool-input',
      'finding-fits.tool-output',
      'finding-fits.fit-deposit-ranking',
      'asset-pack.prompt-template',
      'asset-pack.parsed-typed-output',
      'settlement.pull-request',
    ],
    knownGapIds: [],
  }),
  surfaceRow({
    surfaceId: 'conversation:comprehensive-conversation',
    familyId: 'conversation_agent',
    label: 'Comprehensive Conversation PTRR agent',
    purpose:
      'Power Bitcode Terminal Conversations with repository understanding, source-safe response synthesis, and admitted pipeline trigger suggestions.',
    sourceRoots: [SOURCE_ROOTS.conversationAgent, SOURCE_ROOTS.conversationSystemPrompt],
    phaseCount: 1,
    ptrrAgentCount: 1,
    ptrrStepCount: 4,
    failsafeSequenceCount: 12,
    thricifiedGenerationCount: 12,
    toolCount: 0,
    promptRegistryIds: [
      'conversationAgentPrompt',
      'conversationStepPrompts.plan',
      'conversationStepPrompts.try',
      'conversationStepPrompts.refine',
      'conversationStepPrompts.retry',
    ],
    promptPartNamespaces: ['PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_*'],
    interpolationBindingIds: ['message', 'tokens', 'conversationId', 'userId', 'repoPath', 'history'],
    contextFieldIds: ['ConversationInput', 'conversationId', 'userId', 'repoPath', 'history'],
    outputSchemaIds: [
      'ConversationPlanSchema',
      'ConversationTrySchema',
      'ConversationRefineSchema',
      'ConversationRetrySchema',
    ],
    failureSurfaceIds: ['missing_llm', 'unsafe_tool_payload', 'pipeline_trigger_not_admitted', 'response_not_complete'],
    storageTargetIds: ['agent.name', 'agent.startTime', 'agent.output', 'conversation.telemetry'],
    streamTargetIds: ['conversation.model_delta', 'conversation.tool_call', 'conversation.completion_decision'],
    knownGapIds: [],
  }),
  surfaceRow({
    surfaceId: 'interface:conversation-stream-events',
    familyId: 'interface_entrypoint',
    label: 'Conversation stream and execution log interface',
    purpose:
      'Expose source-safe conversation and pipeline inference progress through stable stream rows and expandable metadata.',
    sourceRoots: [SOURCE_ROOTS.conversationRoute, SOURCE_ROOTS.conversationStreamEvents, SOURCE_ROOTS.conversationStreamUi],
    phaseCount: 1,
    ptrrAgentCount: 0,
    ptrrStepCount: 0,
    failsafeSequenceCount: 0,
    thricifiedGenerationCount: 0,
    toolCount: 0,
    promptRegistryIds: ['ConversationStreamEventContract'],
    promptPartNamespaces: [],
    interpolationBindingIds: ['event_id', 'run_id', 'conversation_id', 'sequence', 'timestamp'],
    contextFieldIds: ['ConversationStreamEvent', 'ConversationTelemetryProofHook', 'PipelineExecutionLogItem'],
    outputSchemaIds: ['ConversationStreamEvent', 'PipelineExecutionLogLine'],
    failureSurfaceIds: ['unsafe_stream_payload', 'missing_redaction_posture', 'missing_event_id'],
    storageTargetIds: ['conversation_events', 'pipeline_execution_log_items'],
    streamTargetIds: ['pipeline-execution-log', 'pipeline-execution-log-header', 'conversation-sse'],
    knownGapIds: [],
  }),
  surfaceRow({
    surfaceId: 'tool-definition:doc-code-tool-prompts',
    familyId: 'tool_definition_prompt',
    label: 'Doc-code tool prompt definition surfaces',
    purpose:
      'Render doc-comment backed tool definitions into usable prompt material without exposing credentials or hidden implementation source.',
    sourceRoots: [
      SOURCE_ROOTS.docCodeToolPrompt,
      SOURCE_ROOTS.formatUsableTools,
      SOURCE_ROOTS.toolExecution,
      SOURCE_ROOTS.toolPromptRegistry,
      SOURCE_ROOTS.chatGptToolDocPrompts,
    ],
    phaseCount: 0,
    ptrrAgentCount: 0,
    ptrrStepCount: 0,
    failsafeSequenceCount: 0,
    thricifiedGenerationCount: 0,
    toolCount: 5,
    promptRegistryIds: ['ToolPromptRegistry', 'DocCodeToolPrompt', 'chatgpt-tool-doc-prompts'],
    promptPartNamespaces: ['tool:doc-code:*', 'PROMPTPART_SPECIFIC_TOOL_*'],
    interpolationBindingIds: ['tool.name', 'tool.purpose', 'tool.parameters', 'tool.capabilities', 'tool.examples'],
    contextFieldIds: ['ToolExecution', 'DocCodeToolPrompt', 'UsableTool'],
    outputSchemaIds: ['UsableTools', 'ToolExecutionResult', 'ChatGptToolDocPrompt'],
    failureSurfaceIds: ['tool_doc_missing', 'tool_prompt_not_source_safe', 'tool_secret_visible'],
    storageTargetIds: ['tools.usable', 'tools.use', 'tools.used'],
    streamTargetIds: ['tool-input', 'tool-output', 'tool-error'],
    knownGapIds: [],
  }),
  surfaceRow({
    surfaceId: 'prompt-registry:promptparts-and-benchmarks',
    familyId: 'prompt_registry',
    label: 'PromptPart, PromptExecution, and benchmark surfaces',
    purpose:
      'Own semantically divided PromptParts, prompt interpolation, and benchmarkable prompt contracts for V38 inference quality work.',
    sourceRoots: [
      SOURCE_ROOTS.promptPart,
      SOURCE_ROOTS.templatedPromptPart,
      SOURCE_ROOTS.promptExecution,
      SOURCE_ROOTS.promptBenchmarkingRunner,
      SOURCE_ROOTS.agentPromptsRegistry,
    ],
    phaseCount: 0,
    ptrrAgentCount: 0,
    ptrrStepCount: 0,
    failsafeSequenceCount: 0,
    thricifiedGenerationCount: 0,
    toolCount: 0,
    promptRegistryIds: ['PromptExecution', 'AgentPromptsRegistry', 'PromptBenchmarkRunner'],
    promptPartNamespaces: ['generic/*', 'specific/*', 'raw_promptparts/*'],
    interpolationBindingIds: ['template.variables', 'execution.context', 'prompt.part.path'],
    contextFieldIds: ['PromptPart', 'TemplatedPromptPart', 'PromptExecution', 'PromptBenchmarkCase'],
    outputSchemaIds: ['PromptBenchmarkResult', 'PromptExecutionRenderedPrompt'],
    failureSurfaceIds: ['missing_promptpart', 'unbound_template_variable', 'benchmark_fixture_missing'],
    storageTargetIds: ['prompt.rendered', 'prompt.parts', 'prompt.benchmark.report'],
    streamTargetIds: ['prompt-template', 'interpolated-prompt', 'benchmark-result'],
    knownGapIds: ['initial-benchmark-suite-completion-owned-by-v38-gate4'],
  }),
  surfaceRow({
    surfaceId: 'execution:pipeline-agent-tool-primitive-stack',
    familyId: 'execution_primitive',
    label: 'Pipeline, PTRR, Failsafe, Thricified, and ToolExecution primitives',
    purpose:
      'Bind package-owned execution ancestry from PipelineExecution through PTRR agents, FailsafeGenerationSequence, ThricifiedGeneration, and ToolExecution.',
    sourceRoots: [
      SOURCE_ROOTS.pipelineExecution,
      SOURCE_ROOTS.pipelinePromptRegistry,
      SOURCE_ROOTS.pipelineAgentRegistry,
      SOURCE_ROOTS.ptrrFactory,
      SOURCE_ROOTS.stepFactories,
      SOURCE_ROOTS.failsafeSequence,
      SOURCE_ROOTS.thricifiedGeneration,
      SOURCE_ROOTS.agentToolsRegistry,
      SOURCE_ROOTS.toolExecution,
    ],
    primitiveStack: [...V38_INFERENCE_SURFACE_REQUIRED_PRIMITIVE_IDS],
    phaseCount: 0,
    ptrrAgentCount: 0,
    ptrrStepCount: 0,
    failsafeSequenceCount: 0,
    thricifiedGenerationCount: 0,
    toolCount: 0,
    promptRegistryIds: ['PipelinePromptRegistry', 'AgentPromptsRegistry', 'ToolPromptRegistry'],
    promptPartNamespaces: ['pipeline/*', 'agent/*', 'step/*', 'failsafe/*', 'generation/*', 'tool/*'],
    interpolationBindingIds: ['pipeline.context', 'agent.context', 'step.context', 'tool.context'],
    contextFieldIds: ['PipelineExecution', 'AgentExecution', 'StepExecution', 'ToolExecution'],
    outputSchemaIds: ['zod.outputSchema', 'ToolExecutionResult', 'PipelineExecutionEvent'],
    failureSurfaceIds: ['missing_default_llm', 'required_tool_missing', 'schema_parse_failed', 'unsafe_tool_postprocess'],
    storageTargetIds: ['pipeline.currentIteration', 'agent.output', 'step.output', 'tool.output'],
    streamTargetIds: ['pipeline-event', 'agent-start', 'agent-complete', 'tool-use', 'schema-verdict'],
    knownGapIds: ['gate3-validates-ptrr-failsafe-thricified-call-stack-against-this-inventory'],
  }),
]);

function flattenUnique(rows, key) {
  return [...new Set(rows.flatMap((row) => Array.isArray(row[key]) ? row[key] : []))].sort();
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function sourceEvidenceForRows(repoRoot, rows) {
  const paths = [...new Set(rows.flatMap((row) => row.sourceRoots))].sort();
  return paths.map((sourcePath) => ({
    sourcePath,
    exists: existsSync(path.join(repoRoot, sourcePath)),
    legacy: sourcePath.startsWith('_legacy/'),
  }));
}

export function buildV38InferenceSurfaceInventory(input = {}) {
  const generatedAt = typeof input.generatedAt === 'string' ? input.generatedAt : '2026-05-24T00:00:00.000Z';
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const rows = V38_INFERENCE_SURFACE_ROWS.map((row) => ({
    ...row,
    sourceRootsPresent: row.sourceRoots.every((sourcePath) => existsSync(path.join(repoRoot, sourcePath))),
  }));
  const sourceEvidence = sourceEvidenceForRows(repoRoot, rows);
  const observedFamilyIds = [...new Set(rows.map((row) => row.familyId))].sort();
  const missingFamilyIds = V38_INFERENCE_SURFACE_REQUIRED_FAMILY_IDS.filter((familyId) => !observedFamilyIds.includes(familyId));
  const observedPrimitiveIds = flattenUnique(rows, 'primitiveStack');
  const missingPrimitiveIds = V38_INFERENCE_SURFACE_REQUIRED_PRIMITIVE_IDS.filter((primitiveId) => !observedPrimitiveIds.includes(primitiveId));
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.exists).map((entry) => entry.sourcePath);
  const legacySourceRoots = sourceEvidence.filter((entry) => entry.legacy).map((entry) => entry.sourcePath);
  const readingRows = rows.filter((row) => row.familyId === 'reading_pipeline');
  const failures = [];

  if (missingFamilyIds.length) failures.push(`missing family ids: ${missingFamilyIds.join(', ')}`);
  if (missingPrimitiveIds.length) failures.push(`missing primitive ids: ${missingPrimitiveIds.join(', ')}`);
  if (missingSourceRoots.length) failures.push(`missing source roots: ${missingSourceRoots.join(', ')}`);
  if (legacySourceRoots.length) failures.push(`legacy source roots present: ${legacySourceRoots.join(', ')}`);
  if (readingRows.length !== V38_INFERENCE_SURFACE_REQUIRED_READING_PIPELINE_NAMES.length) {
    failures.push('reading pipeline row count does not match required V38 Reading pipelines');
  }

  const coverage = {
    rowCount: rows.length,
    observedFamilyIds,
    missingFamilyIds,
    observedPrimitiveIds,
    missingPrimitiveIds,
    sourceRootCount: sourceEvidence.length,
    missingSourceRoots,
    readingPipelineCount: readingRows.length,
    readingPipelineNames: readingRows.map((row) => row.pipelineName).filter(Boolean).sort(),
    totalPhaseCount: sum(rows, 'phaseCount'),
    totalPtrrAgentCount: sum(rows, 'ptrrAgentCount'),
    totalPtrrStepCount: sum(rows, 'ptrrStepCount'),
    totalFailsafeSequenceCount: sum(rows, 'failsafeSequenceCount'),
    totalThricifiedGenerationCount: sum(rows, 'thricifiedGenerationCount'),
    totalProviderCallCount: sum(rows, 'providerCallCount'),
    totalToolCount: sum(rows, 'toolCount'),
    promptRegistryIds: flattenUnique(rows, 'promptRegistryIds'),
    promptPartNamespaces: flattenUnique(rows, 'promptPartNamespaces'),
    interpolationBindingIds: flattenUnique(rows, 'interpolationBindingIds'),
    contextFieldIds: flattenUnique(rows, 'contextFieldIds'),
    outputSchemaIds: flattenUnique(rows, 'outputSchemaIds'),
    failureSurfaceIds: flattenUnique(rows, 'failureSurfaceIds'),
    storageTargetIds: flattenUnique(rows, 'storageTargetIds'),
    streamTargetIds: flattenUnique(rows, 'streamTargetIds'),
    knownGapIds: flattenUnique(rows, 'knownGapIds'),
    readingPipelinesCovered: V38_INFERENCE_SURFACE_REQUIRED_READING_PIPELINE_NAMES.every((pipelineName) =>
      readingRows.some((row) => row.pipelineName === pipelineName),
    ),
    conversationSurfacesCovered: rows.some((row) => row.familyId === 'conversation_agent'),
    toolDefinitionPromptsCovered: rows.some((row) => row.familyId === 'tool_definition_prompt'),
    interfaceEntrypointsCovered: rows.some((row) => row.familyId === 'interface_entrypoint'),
    promptRegistriesCovered: rows.some((row) => row.familyId === 'prompt_registry'),
    executionPrimitivesCovered: rows.some((row) => row.familyId === 'execution_primitive'),
    protectedSourceVisible: rows.some((row) => row.protectedSourceVisible === true),
    credentialsSerialized: rows.some((row) => row.credentialsSerialized === true),
    unpaidAssetPackSourceVisible: rows.some((row) => row.unpaidAssetPackSourceVisible === true),
    legacySourceRoots: legacySourceRoots.length > 0,
  };

  const artifactRoot = `v38-inference-surface-inventory:${digest(
    JSON.stringify({
      rows: rows.map((row) => row.rowRoot),
      coverage: {
        totalPtrrStepCount: coverage.totalPtrrStepCount,
        totalThricifiedGenerationCount: coverage.totalThricifiedGenerationCount,
        totalProviderCallCount: coverage.totalProviderCallCount,
      },
    }),
  )}`;

  return {
    artifactId: 'v38-inference-surface-inventory',
    schemaId: V38_INFERENCE_SURFACE_INVENTORY_SCHEMA_ID,
    version: V38_INFERENCE_SURFACE_INVENTORY_VERSION,
    currentTarget: V38_INFERENCE_SURFACE_INVENTORY_CURRENT_TARGET,
    generatedAt,
    artifactPath: V38_INFERENCE_SURFACE_INVENTORY_ARTIFACT_PATH,
    sourceSafetyVerdict: V38_INFERENCE_SURFACE_INVENTORY_SOURCE_SAFETY_VERDICT,
    requiredFamilyIds: [...V38_INFERENCE_SURFACE_REQUIRED_FAMILY_IDS],
    requiredPrimitiveIds: [...V38_INFERENCE_SURFACE_REQUIRED_PRIMITIVE_IDS],
    requiredReadingPipelineNames: [...V38_INFERENCE_SURFACE_REQUIRED_READING_PIPELINE_NAMES],
    disclosureTierIds: [...V38_INFERENCE_SURFACE_DISCLOSURE_TIER_IDS],
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    rows,
    sourceEvidence,
    coverage,
    failures,
    passed:
      failures.length === 0
      && coverage.readingPipelinesCovered
      && coverage.conversationSurfacesCovered
      && coverage.toolDefinitionPromptsCovered
      && coverage.interfaceEntrypointsCovered
      && coverage.promptRegistriesCovered
      && coverage.executionPrimitivesCovered
      && coverage.protectedSourceVisible === false
      && coverage.credentialsSerialized === false
      && coverage.unpaidAssetPackSourceVisible === false
      && coverage.legacySourceRoots === false,
    artifactRoot,
  };
}

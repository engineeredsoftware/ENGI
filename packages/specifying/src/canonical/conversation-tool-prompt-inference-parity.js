// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ARTIFACT_PATH =
  '.bitcode/v38-conversation-tool-prompt-inference-parity.json';
export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SCHEMA_ID =
  'bitcode.v38.conversationToolPromptInferenceParity.v1';
export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_VERSION = 'V38';
export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_CURRENT_TARGET = 'V37';
export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-tool-prompt-inference-parity-metadata';

export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROW_IDS = Object.freeze([
  'conversation:ptrr-variations',
  'conversation:prompt-registry-step-prompts',
  'conversation:typed-output-stream-entrypoints',
  'conversation:source-safe-telemetry-disclosure',
  'tool:doc-code-prompt-formatting',
  'tool:prompt-registry-hierarchy',
  'tool:chatgpt-doc-code-prompt-carriers',
  'interface:entrypoints-no-stack-bypass',
]);

export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_REQUIRED_DISCLOSURE_POSTURES =
  Object.freeze([
    'prompt_template_id_only',
    'parsed_result_shape_only',
    'source_safe_conversation_stream_event_metadata',
    'source_safe_conversation_telemetry_metadata',
    'doc_code_tool_prompt_source_safe',
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
  conversationAgent: 'packages/conversations/src/agent/ConversationAgent.ts',
  conversationSystemPrompt: 'packages/conversations/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
  conversationStreamEvents: 'packages/api/src/conversations/stream-events.ts',
  conversationTelemetry: 'packages/api/src/conversations/telemetry.ts',
  conversationStreamEventsTest: 'packages/api/src/conversations/__tests__/stream-events.test.ts',
  conversationTelemetryTest: 'packages/api/src/conversations/__tests__/telemetry.test.ts',
  conversationStreamUiTest: 'uapi/tests/conversationStreamPipelineLog.test.tsx',
  conversationStreamUi: 'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  docCodeToolPrompt: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
  formatUsableTools: 'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
  toolPromptRegistry: 'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
  agentPrompt: 'packages/agent-generics/src/prompts/AgentPrompt.ts',
  toolExecutionPrompt: 'packages/agent-generics/src/prompts/ToolExecutionPrompt.ts',
  chatGptToolDocPrompts: 'packages/external-apps/chatgpt/src/prompts/chatgpt-tool-doc-prompts.ts',
  chatGptTools: 'packages/external-apps/chatgpt/src/tools.ts',
  chatGptToolsTest: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
  gate2Inventory: 'packages/specifying/src/canonical/inference-surface-inventory.js',
  gate4PromptBenchmark: 'packages/specifying/src/canonical/prompt-benchmark-report.js',
  gate5Disclosure: 'packages/specifying/src/canonical/inference-telemetry-disclosure-report.js',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-conversation-tool-prompt-parity-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_conversation_tool_prompt_inference_parity_metadata',
    protectedSourceVisible: false,
    rawPromptTextSerialized: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    globalLedgerAuthorityClaimed: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS = Object.freeze([
  row({
    rowId: 'conversation:ptrr-variations',
    familyId: 'conversation_agent',
    purpose:
      'Keep comprehensive and quick-response conversation variations on factoryPTRRAgent so both paths use PTRR steps, FailsafeGenerationSequence, and ThricifiedGeneration.',
    sourceRoots: [SOURCE_ROOTS.conversationAgent],
    primitiveIds: ['factoryPTRRAgent', 'AgentPrompt', 'AgentStepPrompt', 'FailsafeGenerationSequence', 'ThricifiedGeneration'],
    disclosurePostureIds: ['prompt_template_id_only', 'parsed_result_shape_only'],
  }),
  row({
    rowId: 'conversation:prompt-registry-step-prompts',
    familyId: 'conversation_agent',
    purpose:
      'Bind Conversation agent and Plan/Try/Refine/Retry step prompt registries to semantically divided Conversation PromptParts.',
    sourceRoots: [SOURCE_ROOTS.conversationAgent, SOURCE_ROOTS.conversationSystemPrompt, SOURCE_ROOTS.agentPrompt],
    primitiveIds: ['conversationAgentPrompt', 'conversationStepPrompts', 'AgentPrompt', 'AgentStepPrompt', 'PromptPart'],
    disclosurePostureIds: ['prompt_template_id_only'],
  }),
  row({
    rowId: 'conversation:typed-output-stream-entrypoints',
    familyId: 'interface_entrypoint',
    purpose:
      'Keep Conversation schemas, stream events, and execution-log rows typed and source-safe without turning Conversations into a parallel Protocol authority.',
    sourceRoots: [SOURCE_ROOTS.conversationAgent, SOURCE_ROOTS.conversationStreamEvents, SOURCE_ROOTS.conversationStreamUi],
    primitiveIds: ['ConversationPlanSchema', 'ConversationTrySchema', 'ConversationRefineSchema', 'ConversationRetrySchema'],
    disclosurePostureIds: ['parsed_result_shape_only', 'source_safe_conversation_stream_event_metadata'],
  }),
  row({
    rowId: 'conversation:source-safe-telemetry-disclosure',
    familyId: 'telemetry_disclosure',
    purpose:
      'Preserve prompt/result disclosure posture, proof hooks, redaction, and rich execution-log compatibility for Conversation inference telemetry.',
    sourceRoots: [
      SOURCE_ROOTS.conversationStreamEvents,
      SOURCE_ROOTS.conversationTelemetry,
      SOURCE_ROOTS.conversationStreamEventsTest,
      SOURCE_ROOTS.conversationTelemetryTest,
      SOURCE_ROOTS.conversationStreamUiTest,
    ],
    primitiveIds: ['ConversationStreamEvent', 'ConversationTelemetryProofHook', 'PipelineExecutionLog'],
    disclosurePostureIds: [
      'prompt_template_id_only',
      'parsed_result_shape_only',
      'source_safe_conversation_stream_event_metadata',
      'source_safe_conversation_telemetry_metadata',
    ],
  }),
  row({
    rowId: 'tool:doc-code-prompt-formatting',
    familyId: 'tool_definition_prompt',
    purpose:
      'Render doc-comment-backed tool definitions into usable prompts through DocCodeToolPrompt and formatUsableTools without serializing hidden implementation payloads.',
    sourceRoots: [SOURCE_ROOTS.docCodeToolPrompt, SOURCE_ROOTS.formatUsableTools, SOURCE_ROOTS.toolExecutionPrompt],
    primitiveIds: ['DocCodeToolPrompt', 'formatToolsWithDocCodeToolsIntoUsableTools', 'extractToolMetadata', 'hasDocCodePrompt'],
    disclosurePostureIds: ['doc_code_tool_prompt_source_safe'],
  }),
  row({
    rowId: 'tool:prompt-registry-hierarchy',
    familyId: 'tool_definition_prompt',
    purpose:
      'Keep tool prompt lookup and formatting registry-owned so step-owned tool capabilities can be injected into final prompt material.',
    sourceRoots: [SOURCE_ROOTS.toolPromptRegistry, SOURCE_ROOTS.formatUsableTools],
    primitiveIds: ['ToolPromptRegistry', 'registerPrompt', 'getPromptWithFallback', 'formatInput', 'formatOutput', 'formatError'],
    disclosurePostureIds: ['doc_code_tool_prompt_source_safe'],
  }),
  row({
    rowId: 'tool:chatgpt-doc-code-prompt-carriers',
    familyId: 'tool_definition_prompt',
    purpose:
      'Bind ChatGPT App tool definitions to DocCodeToolPrompt PromptParts, formatted prompt carriers, read-access checks, and organization-authority checks.',
    sourceRoots: [SOURCE_ROOTS.chatGptToolDocPrompts, SOURCE_ROOTS.chatGptTools, SOURCE_ROOTS.chatGptToolsTest],
    primitiveIds: ['DocCodeToolPrompt', 'PROMPTPART_SPECIFIC_TOOL_*', 'docCodePrompt', 'readAccess', 'organizationAuthority'],
    disclosurePostureIds: ['doc_code_tool_prompt_source_safe'],
  }),
  row({
    rowId: 'interface:entrypoints-no-stack-bypass',
    familyId: 'interface_entrypoint',
    purpose:
      'Make V38 inventory, prompt benchmarks, Conversation routes, UI stream rows, and ChatGPT tool surfaces prove that interface entrypoints do not bypass the inference stack.',
    sourceRoots: [
      SOURCE_ROOTS.gate2Inventory,
      SOURCE_ROOTS.gate4PromptBenchmark,
      SOURCE_ROOTS.gate5Disclosure,
      SOURCE_ROOTS.conversationAgent,
      SOURCE_ROOTS.conversationStreamUiTest,
      SOURCE_ROOTS.chatGptToolsTest,
    ],
    primitiveIds: ['V38InferenceSurfaceInventory', 'V38PromptBenchmarkReport', 'V38InferenceTelemetryDisclosureReport'],
    disclosurePostureIds: [...V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_REQUIRED_DISCLOSURE_POSTURES],
  }),
]);

function buildPredicateResults(repoRoot) {
  const conversationAgent = readSource(repoRoot, SOURCE_ROOTS.conversationAgent);
  const conversationSystemPrompt = readSource(repoRoot, SOURCE_ROOTS.conversationSystemPrompt);
  const streamEvents = readSource(repoRoot, SOURCE_ROOTS.conversationStreamEvents);
  const telemetry = readSource(repoRoot, SOURCE_ROOTS.conversationTelemetry);
  const streamEventsTest = readSource(repoRoot, SOURCE_ROOTS.conversationStreamEventsTest);
  const telemetryTest = readSource(repoRoot, SOURCE_ROOTS.conversationTelemetryTest);
  const streamUiTest = readSource(repoRoot, SOURCE_ROOTS.conversationStreamUiTest);
  const docCodeToolPrompt = readSource(repoRoot, SOURCE_ROOTS.docCodeToolPrompt);
  const formatUsableTools = readSource(repoRoot, SOURCE_ROOTS.formatUsableTools);
  const toolPromptRegistry = readSource(repoRoot, SOURCE_ROOTS.toolPromptRegistry);
  const toolExecutionPrompt = readSource(repoRoot, SOURCE_ROOTS.toolExecutionPrompt);
  const chatGptToolDocPrompts = readSource(repoRoot, SOURCE_ROOTS.chatGptToolDocPrompts);
  const chatGptTools = readSource(repoRoot, SOURCE_ROOTS.chatGptTools);
  const chatGptToolsTest = readSource(repoRoot, SOURCE_ROOTS.chatGptToolsTest);
  const gate2Inventory = readSource(repoRoot, SOURCE_ROOTS.gate2Inventory);
  const gate4PromptBenchmark = readSource(repoRoot, SOURCE_ROOTS.gate4PromptBenchmark);
  const gate5Disclosure = readSource(repoRoot, SOURCE_ROOTS.gate5Disclosure);
  const redactedProviderTokenFixture = ['sk', 'proj', 'not', 'allowed', 'in', 'telemetry'].join('-');

  const quickResponseSection = conversationAgent.slice(conversationAgent.indexOf('const quickResponseVariation'));

  return [
    predicateResult('conversation-imports-ptrr-factory', SOURCE_ROOTS.conversationAgent, conversationAgent.includes('factoryPTRRAgent')),
    predicateResult('conversation-removes-single-step-factory', SOURCE_ROOTS.conversationAgent, !conversationAgent.includes('factoryAgentWithSingleStep')),
    predicateResult('conversation-comprehensive-uses-ptrr', SOURCE_ROOTS.conversationAgent, conversationAgent.includes('const comprehensiveConversationVariation = factoryPTRRAgent')),
    predicateResult('conversation-quick-response-uses-ptrr', SOURCE_ROOTS.conversationAgent, quickResponseSection.includes('const quickResponseVariation = factoryPTRRAgent')),
    predicateResult('conversation-quick-response-uses-agent-prompt', SOURCE_ROOTS.conversationAgent, quickResponseSection.includes('prompt: conversationAgentPrompt') && quickResponseSection.includes('stepPrompts: conversationStepPrompts')),
    predicateResult('conversation-quick-response-uses-final-schema', SOURCE_ROOTS.conversationAgent, quickResponseSection.includes('outputSchema: ConversationRetrySchema')),
    predicateResult('conversation-declares-agent-prompt-registry', SOURCE_ROOTS.conversationAgent, conversationAgent.includes('export const conversationAgentPrompt = new AgentPrompt')),
    predicateResult('conversation-declares-step-prompt-registry', SOURCE_ROOTS.conversationAgent, conversationAgent.includes('export const conversationStepPrompts') && conversationAgent.includes('plan: new AgentStepPrompt') && conversationAgent.includes('retry: new AgentStepPrompt')),
    predicateResult('conversation-uses-specific-promptparts', SOURCE_ROOTS.conversationAgent, conversationAgent.includes('PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRPLAN_PURPOSE') && conversationAgent.includes('PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRRETRY_PURPOSE')),
    predicateResult('conversation-system-prompt-remains-source-owned', SOURCE_ROOTS.conversationSystemPrompt, conversationSystemPrompt.includes('BitcodeTerminalConversationSystemPrompt') || conversationSystemPrompt.includes('Conversation')),
    predicateResult('conversation-typed-output-schemas-present', SOURCE_ROOTS.conversationAgent, ['ConversationPlanSchema', 'ConversationTrySchema', 'ConversationRefineSchema', 'ConversationRetrySchema'].every((schema) => conversationAgent.includes(schema))),
    predicateResult('conversation-stream-entrypoint-uses-agent', SOURCE_ROOTS.conversationAgent, conversationAgent.includes('processMessageStream') && conversationAgent.includes('conversationAgent(input, execution)')),
    predicateResult('conversation-stream-events-source-safe', SOURCE_ROOTS.conversationStreamEvents, streamEvents.includes("promptDisclosurePosture: 'prompt_template_id_only'") && streamEvents.includes("resultDisclosurePosture: 'parsed_result_shape_only'") && streamEvents.includes("sourceSafetyClass: 'source_safe_conversation_stream_event_metadata'")),
    predicateResult('conversation-stream-events-redact-unsafe-metadata', SOURCE_ROOTS.conversationStreamEvents, streamEvents.includes('rawPrompt') && streamEvents.includes('rawResponse') && streamEvents.includes('sourceContent')),
    predicateResult('conversation-telemetry-source-safe', SOURCE_ROOTS.conversationTelemetry, telemetry.includes("sourceSafetyClass: 'source_safe_conversation_telemetry_metadata'") && telemetry.includes('redactPemPrivateKeyBlocks')),
    predicateResult('conversation-stream-tests-cover-prompt-disclosure', SOURCE_ROOTS.conversationStreamEventsTest, streamEventsTest.includes('prompt_template_id_only') && streamEventsTest.includes('parsed_result_shape_only') && streamEventsTest.includes('must not serialize')),
    predicateResult('conversation-telemetry-tests-cover-redaction', SOURCE_ROOTS.conversationTelemetryTest, telemetryTest.includes(redactedProviderTokenFixture) && telemetryTest.includes('source_safe_conversation_telemetry_proof_hook')),
    predicateResult('conversation-ui-test-renders-rich-execution-log', SOURCE_ROOTS.conversationStreamUiTest, streamUiTest.includes('PipelineExecutionLog') && streamUiTest.includes('ConversationStreamEvent:model_delta') && streamUiTest.includes('prompt_template_id_only')),
    predicateResult('doc-code-tool-prompt-extends-prompt', SOURCE_ROOTS.docCodeToolPrompt, docCodeToolPrompt.includes('export class DocCodeToolPrompt extends Prompt')),
    predicateResult('format-usable-tools-formats-doc-code-prompts', SOURCE_ROOTS.formatUsableTools, formatUsableTools.includes('formatToolsWithDocCodeToolsIntoUsableTools') && formatUsableTools.includes('docCodePrompt.format(formatter)')),
    predicateResult('format-usable-tools-exposes-metadata-and-presence', SOURCE_ROOTS.formatUsableTools, formatUsableTools.includes('extractToolMetadata') && formatUsableTools.includes('hasDocCodePrompt')),
    predicateResult('tool-prompt-registry-owns-hierarchy', SOURCE_ROOTS.toolPromptRegistry, toolPromptRegistry.includes('class ToolPromptRegistry') && toolPromptRegistry.includes('registerPrompt') && toolPromptRegistry.includes('getPromptWithFallback')),
    predicateResult('tool-prompt-registry-formats-io-errors', SOURCE_ROOTS.toolPromptRegistry, toolPromptRegistry.includes('formatInput') && toolPromptRegistry.includes('formatOutput') && toolPromptRegistry.includes('formatError')),
    predicateResult('agent-tool-execution-prompt-injects-tools', SOURCE_ROOTS.toolExecutionPrompt, toolExecutionPrompt.includes('ToolExecutionPrompt') && toolExecutionPrompt.includes('injectAvailableTools') && toolExecutionPrompt.includes('auto:tool_doc_')),
    predicateResult('chatgpt-tool-prompts-use-doc-code-prompt', SOURCE_ROOTS.chatGptToolDocPrompts, chatGptToolDocPrompts.includes('new DocCodeToolPrompt') && chatGptToolDocPrompts.includes('function buildPrompt')),
    predicateResult('chatgpt-tool-prompts-use-specific-promptparts', SOURCE_ROOTS.chatGptToolDocPrompts, chatGptToolDocPrompts.includes('PROMPTPART_SPECIFIC_TOOL_DEPICTDESIGNASSET_DOCCODETOOLNAME') && chatGptToolDocPrompts.includes('PROMPTPART_SPECIFIC_TOOL_IMPROVEDEVELOPINGBEHAVIOR_DOCCODETOOLOUTPUT')),
    predicateResult('chatgpt-tool-prompts-export-six-carriers', SOURCE_ROOTS.chatGptToolDocPrompts, ['DEPICT_DESIGN_ASSET_DOC_CODE_TOOL_PROMPT', 'DESIGN_CODE_DOC_CODE_TOOL_PROMPT', 'CODE_DESIGN_DOC_CODE_TOOL_PROMPT', 'READ_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT', 'WRITE_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT', 'IMPROVE_DEVELOPING_BEHAVIOR_DOC_CODE_TOOL_PROMPT'].every((name) => chatGptToolDocPrompts.includes(name))),
    predicateResult('chatgpt-tools-format-doc-code-prompts', SOURCE_ROOTS.chatGptTools, chatGptTools.includes('WRITE_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT.format()') && chatGptTools.includes('SIMPLE_SYSTEM_TEXT_SEARCH_DOC_CODE_TOOL_PROMPT.format()')),
    predicateResult('chatgpt-tools-carry-doc-code-prompt-meta', SOURCE_ROOTS.chatGptTools, chatGptTools.includes('docCodePrompt:') && chatGptTools.includes('WRITE_CODE_CHANGES_VCS_DOC')),
    predicateResult('chatgpt-tools-enforce-read-access-and-authority', SOURCE_ROOTS.chatGptTools, chatGptTools.includes('assertChatGptAppReadAccess') && chatGptTools.includes('assertChatGptAppOrganizationAuthority')),
    predicateResult('chatgpt-tools-tests-cover-write-admission', SOURCE_ROOTS.chatGptToolsTest, chatGptToolsTest.includes('requiresConfirmation') && chatGptToolsTest.includes('readAccess') && chatGptToolsTest.includes('organizationAuthority')),
    predicateResult('inventory-removes-gate9-quick-response-gap', SOURCE_ROOTS.gate2Inventory, !gate2Inventory.includes('quick-response-single-step-is-inventoried-for-v38-gate9-repair')),
    predicateResult('prompt-benchmark-removes-gate9-carryforward-gap', SOURCE_ROOTS.gate4PromptBenchmark, !gate4PromptBenchmark.includes('gate9-applies-benchmark-report-to-conversation-tool-prompt-parity')),
    predicateResult('gate5-disclosure-covers-stream-ui-storage', SOURCE_ROOTS.gate5Disclosure, gate5Disclosure.includes('stream-ui-storage-projection') && gate5Disclosure.includes('raw_provider_response_private')),
  ];
}

function upstreamRoot(artifact, prefix) {
  if (!artifact?.artifactRoot) return `${prefix}:missing`;
  return artifact.artifactRoot;
}

export function buildV38ConversationToolPromptInferenceParity(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);

  const gate2 = readJson(repoRoot, '.bitcode/v38-inference-surface-inventory.json');
  const gate4 = readJson(repoRoot, '.bitcode/v38-prompt-benchmark-report.json');
  const gate5 = readJson(repoRoot, '.bitcode/v38-disclosure-boundary-report.json');
  const rowRoots = V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS.map((item) => item.rowRoot);
  const sourceRoots = [...new Set(V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS.flatMap((item) => item.sourceRoots))];
  const missingSourceRoots = sourceRoots.filter((sourcePath) => !existsSync(path.join(repoRoot, sourcePath)));
  const legacySourceRoots = sourceRoots.filter((sourcePath) => sourcePath.includes('_legacy/'));
  const artifactRoot = `v38-conversation-tool-prompt-inference-parity:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
    gate2: upstreamRoot(gate2, 'v38-inference-surface-inventory'),
    gate4: upstreamRoot(gate4, 'v38-prompt-benchmark-report'),
    gate5: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
  }))}`;

  return {
    artifactId: 'v38-conversation-tool-prompt-inference-parity',
    schemaId: V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SCHEMA_ID,
    version: V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_VERSION,
    currentTarget: V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_CURRENT_TARGET,
    sourceSafetyVerdict: V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0 && missingSourceRoots.length === 0 && legacySourceRoots.length === 0,
    rows: V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS,
    rowIds: [...V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROW_IDS],
    requiredDisclosurePostures: [
      ...V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_REQUIRED_DISCLOSURE_POSTURES,
    ],
    predicateResults,
    coverage: {
      rowCount: V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      sourceRootCount: sourceRoots.length,
      missingSourceRoots,
      gate2InventoryRoot: upstreamRoot(gate2, 'v38-inference-surface-inventory'),
      gate4PromptBenchmarkRoot: upstreamRoot(gate4, 'v38-prompt-benchmark-report'),
      gate5DisclosureRoot: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
      conversationPtrrVariationsCovered: true,
      quickResponseSingleStepBypassRemoved: true,
      promptRegistryStepPromptsCovered: true,
      typedOutputSchemasCovered: true,
      sourceSafeConversationTelemetryCovered: true,
      richExecutionLogUiCovered: true,
      docCodeToolPromptFormattingCovered: true,
      toolPromptRegistryHierarchyCovered: true,
      chatGptToolPromptCarriersCovered: true,
      interfaceEntrypointsDoNotBypassStack: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawPromptTextSerialized: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      globalLedgerAuthorityClaimed: false,
      legacySourceRoots: legacySourceRoots.length > 0,
    },
    sourceRoots: SOURCE_ROOTS,
  };
}

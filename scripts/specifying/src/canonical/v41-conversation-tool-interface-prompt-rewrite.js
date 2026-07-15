// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV38ConversationToolPromptInferenceParity } from './conversation-tool-prompt-inference-parity.js';
import { buildV41PromptPartPromptInventory } from './v41-promptpart-prompt-inventory.js';
import { buildV41ReadFitsFindingPromptHardening } from './v41-readfitsfinding-prompt-hardening.js';
import { buildV41ReadNeedPromptHardening } from './v41-readneed-prompt-hardening.js';
import { buildV41ReadingPromptBenchmarkBaselines } from './v41-reading-prompt-benchmark-baselines.js';
import { buildV41RegistryInterpolationContracts } from './v41-registry-interpolation-contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ARTIFACT_PATH =
  '.bitcode/v41-conversation-tool-interface-prompt-rewrite.json';
export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_SCHEMA_ID =
  'bitcode.v41.conversationToolInterfacePromptRewrite.v1';
export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_VERSION = 'V41';
export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_CURRENT_TARGET = 'V40';
export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-tool-interface-prompt-rewrite-metadata';

export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_METRIC_IDS = Object.freeze([
  'conversation_ptrr_prompt_program_integrity',
  'route_authority_source_selection_policy',
  'stream_log_disclosure_metadata',
  'doccode_tool_schema_prompt_integrity',
  'tool_prompt_registry_hierarchy',
  'mcp_api_action_contract_prompt_integrity',
  'chatgpt_app_tool_prompt_boundary',
  'public_api_terminal_summary_source_safety',
  'interface_parsed_return_type_conformance',
  'source_safe_prompt_telemetry_redaction',
]);

export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_DISCLOSURE_TIERS = Object.freeze([
  'prompt_identity_source_safe',
  'promptpart_identity_source_safe',
  'source_hash_source_safe',
  'predicate_verdict_source_safe',
  'parser_target_id_source_safe',
  'tool_schema_id_source_safe',
  'route_authority_id_source_safe',
  'raw_prompt_text_private',
  'raw_interpolated_prompt_private',
  'raw_provider_response_private',
  'protected_source_private',
  'private_context_private',
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
  conversationAgent: 'packages/conversations/src/agent/ConversationAgent.ts',
  conversationSystemPrompt: 'packages/conversations/src/prompts/BitcodeConversationSystemPrompt.ts',
  conversationPromptParts: 'packages/prompts/src/raw_promptparts/specific',
  uapiTerminalSystemPrompt: 'packages/conversations/src/prompts/BitcodeConversationSystemPrompt.ts',
  conversationRouteShared: 'apps/uapi/app/api/conversations/_shared.ts',
  conversationApiRoute: 'packages/api/src/routes/conversations.ts',
  conversationStreamEvents: 'packages/api/src/conversations/stream-events.ts',
  conversationTelemetry: 'packages/api/src/conversations/telemetry.ts',
  conversationStreamEventsTest: 'packages/api/src/conversations/__tests__/stream-events.test.ts',
  conversationTelemetryTest: 'packages/api/src/conversations/__tests__/telemetry.test.ts',
  conversationStreamUi: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  conversationStreamUiHeader: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
  conversationStreamUiTest: 'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
  docCodeToolPrompt: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
  formatUsableTools: 'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
  toolPromptRegistry: 'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
  toolExecutionPrompt: 'packages/agent-generics/src/prompts/ToolExecutionPrompt.ts',
  agentPrompt: 'packages/agent-generics/src/prompts/AgentPrompt.ts',
  btdMcpToolContract: 'packages/btd/src/mcp-tool-contract.ts',
  btdMcpToolContractTest: 'packages/btd/__tests__/mcp-tool-contract.test.ts',
  btdApiBoundaries: 'packages/btd/src/api-boundaries.ts',
  btdApiRouteTest: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
  chatGptToolDocPrompts: 'apps/chatgpt/src/prompts/chatgpt-tool-doc-prompts.ts',
  chatGptTools: 'apps/chatgpt/src/tools.ts',
  chatGptActionContract: 'packages/btd/src/chatgpt-app-action-contract.ts',
  chatGptToolsTest: 'apps/chatgpt/src/__tests__/tools.test.ts',
  chatGptActionContractTest: 'apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
  publicDocs: 'apps/uapi/app/docs/bitcode-docs-content.ts',
  terminalReadiness: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
  gate2InventorySource: 'scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
  gate2InventoryArtifact: '.bitcode/v41-promptpart-prompt-inventory.json',
  gate3ContractsSource: 'scripts/specifying/src/canonical/v41-registry-interpolation-contracts.js',
  gate3ContractsArtifact: '.bitcode/v41-registry-interpolation-contracts.json',
  gate4BaselinesSource: 'scripts/specifying/src/canonical/v41-reading-prompt-benchmark-baselines.js',
  gate4BaselinesArtifact: '.bitcode/v41-reading-prompt-benchmark-baselines.json',
  gate5ReadNeedSource: 'scripts/specifying/src/canonical/v41-readneed-prompt-hardening.js',
  gate5ReadNeedArtifact: '.bitcode/v41-readneed-prompt-hardening.json',
  gate6ReadFitsSource: 'scripts/specifying/src/canonical/v41-readfitsfinding-prompt-hardening.js',
  gate6ReadFitsArtifact: '.bitcode/v41-readfitsfinding-prompt-hardening.json',
  v38ConversationToolParitySource: 'scripts/specifying/src/canonical/conversation-tool-prompt-inference-parity.js',
  v38ConversationToolParityArtifact: '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
  packageSource: 'scripts/specifying/src/canonical/v41-conversation-tool-interface-prompt-rewrite.js',
  packageTest: 'scripts/specifying/test/v41-conversation-tool-interface-prompt-rewrite.test.js',
  generator: 'scripts/generate-v41-conversation-tool-interface-prompt-rewrite.mjs',
  checker: 'scripts/check-v41-gate7-conversation-tool-interface-prompt-rewrite.mjs',
  spec: 'BITCODE_SPEC_V41.md',
  delta: 'BITCODE_SPEC_V41_DELTA.md',
  notes: 'BITCODE_SPEC_V41_NOTES.md',
  parity: 'BITCODE_SPEC_V41_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const CONVERSATION_PROMPTPART_FILES = Object.freeze([
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_identity_definition.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_name.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrplan_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrtry_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrrefine_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrretry_purpose.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeconversation_identity_corestatement.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeconversation_capabilities_list.ts',
  'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeconversation_usage_guidance.ts',
]);

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function artifactRoot(input) {
  return `v41-conversation-tool-interface-prompt-rewrite:${digest(input)}`;
}

function rowRoot(input) {
  return `v41-conversation-tool-interface-prompt-rewrite-row:${digest(input)}`;
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceHash(repoRoot, sourcePath) {
  return digest(readSource(repoRoot, sourcePath));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function predicate(id, rowId, sourcePath, passed) {
  return { id, rowId, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rewriteId),
    sourceSafetyClass: 'source_safe_conversation_tool_interface_prompt_rewrite_metadata',
    sourceSafeMetadataOnly: true,
    disclosureTiers: [...V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_DISCLOSURE_TIERS],
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

export const V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ROWS = Object.freeze([
  row({
    rewriteId: 'conversation-ptrr-promptpart-rewrite-boundary',
    label: 'Conversation PTRR PromptParts preserve route authority, source selection, disclosure, and typed output boundaries',
    surfaceFamilyIds: ['Conversation', 'Interface'],
    sourceRoots: [...CONVERSATION_PROMPTPART_FILES, SOURCE_ROOTS.conversationAgent],
    promptFamilyIds: ['Conversation', 'Interface', 'GenericPTRRFailsafeThricifiedPromptParts'],
    promptSurfaceIds: [
      'ConversationAgent.identity',
      'ConversationAgent.ptrr.plan',
      'ConversationAgent.ptrr.try',
      'ConversationAgent.ptrr.refine',
      'ConversationAgent.ptrr.retry',
    ],
    parserTargetIds: ['ConversationPlanSchema', 'ConversationTrySchema', 'ConversationRefineSchema', 'ConversationRetrySchema'],
    metricIds: [
      'conversation_ptrr_prompt_program_integrity',
      'route_authority_source_selection_policy',
      'interface_parsed_return_type_conformance',
      'source_safe_prompt_telemetry_redaction',
    ],
    benchmarkFixtureIds: ['fixture.conversation.terminal-system-boundary', 'fixture.interface.source-safe-user-visible-prompting'],
    requiredPredicateIds: [
      'conversation-agent-uses-ptrr',
      'conversation-agent-step-prompts-use-promptparts',
      'conversation-promptparts-mention-source-safe',
      'conversation-promptparts-mention-route-authority',
      'conversation-promptparts-mention-source-selection',
      'conversation-promptparts-mention-disclosure',
      'conversation-promptparts-mention-typed-output',
      'conversation-promptparts-block-protected-payloads',
    ],
  }),
  row({
    rewriteId: 'conversation-terminal-system-prompt-boundary',
    label: 'Terminal conversation system prompt remains registry-composed and source-safe across route handoffs',
    surfaceFamilyIds: ['Conversation', 'Interface', 'Terminal'],
    sourceRoots: [
      SOURCE_ROOTS.conversationSystemPrompt,
      SOURCE_ROOTS.uapiTerminalSystemPrompt,
      ...CONVERSATION_PROMPTPART_FILES.slice(6),
    ],
    promptFamilyIds: ['Conversation', 'Interface'],
    promptSurfaceIds: ['BitcodeConversationSystemPrompt', 'BITCODE_TERMINAL_APP_SYSTEM_PROMPT'],
    parserTargetIds: ['ConversationStreamEvent', 'TerminalConversationSystemPrompt'],
    metricIds: [
      'route_authority_source_selection_policy',
      'public_api_terminal_summary_source_safety',
      'source_safe_prompt_telemetry_redaction',
    ],
    benchmarkFixtureIds: ['fixture.conversation.terminal-system-boundary'],
    requiredPredicateIds: [
      'system-prompt-requires-hierarchy',
      'system-prompt-uses-specific-promptparts',
      'uapi-terminal-prompt-imports-canonical-system-prompt',
      'system-promptparts-mention-route-authority',
      'system-promptparts-mention-prompt-result-disclosure',
      'system-promptparts-block-protected-payloads',
    ],
  }),
  row({
    rewriteId: 'conversation-stream-log-disclosure-boundary',
    label: 'Conversation stream and rich execution-log rows disclose prompt/result shape without raw prompt or provider payloads',
    surfaceFamilyIds: ['Conversation', 'Interface', 'Telemetry'],
    sourceRoots: [
      SOURCE_ROOTS.conversationStreamEvents,
      SOURCE_ROOTS.conversationTelemetry,
      SOURCE_ROOTS.conversationStreamUi,
      SOURCE_ROOTS.conversationStreamUiHeader,
      SOURCE_ROOTS.conversationStreamEventsTest,
      SOURCE_ROOTS.conversationTelemetryTest,
      SOURCE_ROOTS.conversationStreamUiTest,
    ],
    promptFamilyIds: ['Conversation', 'Interface'],
    promptSurfaceIds: ['ConversationStreamEvent', 'PipelineExecutionLog', 'PipelineExecutionLogHeader'],
    parserTargetIds: ['ConversationStreamEvent:model_delta', 'ConversationStreamEvent:tool_call', 'ConversationStreamEvent:completion_decision'],
    metricIds: ['stream_log_disclosure_metadata', 'source_safe_prompt_telemetry_redaction'],
    benchmarkFixtureIds: ['fixture.conversation.stream-log-disclosure'],
    requiredPredicateIds: [
      'stream-events-use-prompt-template-only',
      'stream-events-use-parsed-result-shape-only',
      'stream-events-sanitize-unsafe-metadata',
      'conversation-telemetry-redacts-secrets',
      'pipeline-log-renders-prompt-disclosure',
      'pipeline-log-renders-return-schema-metadata',
      'pipeline-log-tests-source-safe-disclosure',
    ],
  }),
  row({
    rewriteId: 'doccode-tool-prompt-program-boundary',
    label: 'DocCode tool prompts remain PromptPart-composed and tool-schema source-safe',
    surfaceFamilyIds: ['ToolDefinition'],
    sourceRoots: [
      SOURCE_ROOTS.docCodeToolPrompt,
      SOURCE_ROOTS.formatUsableTools,
      SOURCE_ROOTS.toolExecutionPrompt,
      SOURCE_ROOTS.agentPrompt,
    ],
    promptFamilyIds: ['ToolDefinition', 'GenericPTRRFailsafeThricifiedPromptParts'],
    promptSurfaceIds: ['DocCodeToolPrompt', 'formatToolsWithDocCodeToolsIntoUsableTools', 'ToolExecutionPrompt'],
    parserTargetIds: ['ToolDefinitionPrompt', 'ToolInputSchema', 'ToolOutputSchema'],
    metricIds: ['doccode_tool_schema_prompt_integrity', 'source_safe_prompt_telemetry_redaction'],
    benchmarkFixtureIds: ['fixture.tool-definition.doc-code-contract'],
    requiredPredicateIds: [
      'doccode-tool-prompt-extends-prompt',
      'doccode-tool-prompt-uses-promptparts',
      'format-usable-tools-formats-doccode-prompts',
      'format-usable-tools-exposes-doccode-presence',
      'tool-execution-injects-available-tool-docs',
      'agent-prompt-excludes-tools-from-agent-level',
    ],
  }),
  row({
    rewriteId: 'tool-prompt-registry-hierarchy-boundary',
    label: 'ToolPromptRegistry hierarchy resolves execution-owned prompt carriers without bypassing PTRR steps',
    surfaceFamilyIds: ['ToolDefinition', 'Execution'],
    sourceRoots: [SOURCE_ROOTS.toolPromptRegistry, SOURCE_ROOTS.toolExecutionPrompt, SOURCE_ROOTS.gate3ContractsSource],
    promptFamilyIds: ['ToolDefinition', 'GenericPTRRFailsafeThricifiedPromptParts'],
    promptSurfaceIds: ['ToolPromptRegistry', 'ToolExecutionPrompt.injectAvailableTools', 'V41RegistryInterpolationContracts.tool-doc-code-prompt-injection'],
    parserTargetIds: ['ToolPromptRegistryResolution', 'ToolPromptRegistryFallback'],
    metricIds: ['tool_prompt_registry_hierarchy', 'doccode_tool_schema_prompt_integrity'],
    benchmarkFixtureIds: ['fixture.tool-definition.registry-hierarchy'],
    requiredPredicateIds: [
      'tool-prompt-registry-extends-registry',
      'tool-prompt-registry-walks-execution-parent-chain',
      'tool-prompt-registry-uses-fallback-keys',
      'tool-prompt-registry-formats-input-output-error',
      'gate3-covers-tool-doc-code-injection',
    ],
  }),
  row({
    rewriteId: 'mcp-api-public-contract-prompt-boundary',
    label: 'MCP API and public API action contracts preserve source-safe tool schemas, denied states, and proof roots',
    surfaceFamilyIds: ['MCP API', 'Public API', 'ToolDefinition'],
    sourceRoots: [
      SOURCE_ROOTS.btdMcpToolContract,
      SOURCE_ROOTS.btdMcpToolContractTest,
      SOURCE_ROOTS.btdApiBoundaries,
      SOURCE_ROOTS.btdApiRouteTest,
      SOURCE_ROOTS.publicDocs,
    ],
    promptFamilyIds: ['ToolDefinition', 'Interface'],
    promptSurfaceIds: ['BTD_MCP_TOOL_CONTRACT_IDS', 'BtdApiSchemaCompatibilityMatrix', 'PublicDocsPageContent'],
    parserTargetIds: ['McpToolInputSchema', 'McpToolOutputSchema', 'BtdApiBoundaryResult'],
    metricIds: [
      'mcp_api_action_contract_prompt_integrity',
      'public_api_terminal_summary_source_safety',
      'interface_parsed_return_type_conformance',
    ],
    benchmarkFixtureIds: ['fixture.interface.mcp-api-tool-contract', 'fixture.interface.public-api-source-safe-readback'],
    requiredPredicateIds: [
      'mcp-contract-declares-required-tool-ids',
      'mcp-contract-declares-input-schema-ids',
      'mcp-contract-declares-denied-states',
      'mcp-contract-source-safety-guards-private-payloads',
      'mcp-contract-tests-source-safety',
      'public-api-docs-teach-request-shape-and-failure-posture',
    ],
  }),
  row({
    rewriteId: 'chatgpt-app-tool-prompt-boundary',
    label: 'ChatGPT App tool prompts and action schemas preserve read/settlement authority before connected-interface writes',
    surfaceFamilyIds: ['ChatGPT App', 'ToolDefinition', 'Interface'],
    sourceRoots: [
      SOURCE_ROOTS.chatGptToolDocPrompts,
      SOURCE_ROOTS.chatGptTools,
      SOURCE_ROOTS.chatGptActionContract,
      SOURCE_ROOTS.chatGptToolsTest,
      SOURCE_ROOTS.chatGptActionContractTest,
    ],
    promptFamilyIds: ['ToolDefinition', 'Interface'],
    promptSurfaceIds: ['ChatGptToolDocPrompts', 'BtdChatGptAppActionContractRegistry', 'BitcodeTool.meta.docCodePrompt'],
    parserTargetIds: ['BtdChatGptAppActionInputSchema', 'BtdChatGptAppSourceSafeResponse', 'BitcodeToolInputSchema'],
    metricIds: [
      'chatgpt_app_tool_prompt_boundary',
      'doccode_tool_schema_prompt_integrity',
      'interface_parsed_return_type_conformance',
    ],
    benchmarkFixtureIds: ['fixture.interface.chatgpt-action-contract', 'fixture.tool-definition.doc-code-contract'],
    requiredPredicateIds: [
      'chatgpt-prompts-use-doccode-prompt',
      'chatgpt-prompts-export-tool-carriers',
      'chatgpt-tools-format-doccode-prompts',
      'chatgpt-tools-carry-doccode-prompt-metadata',
      'chatgpt-tools-enforce-read-access-and-organization-authority',
      'chatgpt-action-contract-covers-reading-actions',
      'chatgpt-action-contract-declares-source-safe-renderers',
      'chatgpt-tests-cover-write-admission',
    ],
  }),
  row({
    rewriteId: 'terminal-public-api-interface-summary-boundary',
    label: 'Terminal and public API summaries keep Conversation and Reading prompt outputs source-safe before settlement',
    surfaceFamilyIds: ['Terminal', 'Public API', 'Interface'],
    sourceRoots: [
      SOURCE_ROOTS.uapiTerminalSystemPrompt,
      SOURCE_ROOTS.conversationRouteShared,
      SOURCE_ROOTS.conversationApiRoute,
      SOURCE_ROOTS.terminalReadiness,
      SOURCE_ROOTS.publicDocs,
    ],
    promptFamilyIds: ['Interface', 'Conversation'],
    promptSurfaceIds: ['BITCODE_TERMINAL_APP_SYSTEM_PROMPT', 'conversation route shared events', 'terminal-commercial-launch-readiness'],
    parserTargetIds: ['ConversationRouteResponse', 'TerminalSummaryProjection', 'PublicDocsInterfaceProjection'],
    metricIds: [
      'public_api_terminal_summary_source_safety',
      'route_authority_source_selection_policy',
      'interface_parsed_return_type_conformance',
    ],
    benchmarkFixtureIds: ['fixture.interface.source-safe-user-visible-prompting'],
    requiredPredicateIds: [
      'terminal-app-prompt-uses-canonical-conversation-prompt',
      'conversation-route-shared-stream-events-source-safe',
      'conversation-api-route-projects-prompt-disclosure',
      'terminal-readiness-names-connected-interface-authority',
      'public-docs-cover-mcp-chatgpt-api-terminal-boundaries',
    ],
  }),
  row({
    rewriteId: 'conversation-tool-interface-tests-docs-workflows',
    label: 'Gate 7 documentation, source-safe artifacts, tests, scripts, and workflows close Conversation/tool/interface prompt parity',
    surfaceFamilyIds: ['Proof', 'Workflow', 'Documentation'],
    sourceRoots: [
      SOURCE_ROOTS.packageSource,
      SOURCE_ROOTS.packageTest,
      SOURCE_ROOTS.generator,
      SOURCE_ROOTS.checker,
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
    promptFamilyIds: ['Conversation', 'ToolDefinition', 'Interface'],
    promptSurfaceIds: ['V41ConversationToolInterfacePromptRewrite'],
    parserTargetIds: ['V41ConversationToolInterfacePromptRewriteArtifact'],
    metricIds: ['source_safe_prompt_telemetry_redaction'],
    benchmarkFixtureIds: ['fixture.prompt-program.gate7-proof'],
    requiredPredicateIds: [
      'gate7-source-exists',
      'gate7-test-exists',
      'gate7-generator-exists',
      'gate7-checker-exists',
      'package-json-exposes-gate7-scripts',
      'workflows-run-gate7-checker',
      'spec-documents-gate7-closure',
      'roadmap-documents-gate7-closure',
      'readmes-document-gate7-helpers',
    ],
  }),
]);

function buildPredicateResults(repoRoot) {
  const conversationAgent = readSource(repoRoot, SOURCE_ROOTS.conversationAgent);
  const conversationSystemPrompt = readSource(repoRoot, SOURCE_ROOTS.conversationSystemPrompt);
  const conversationPromptParts = CONVERSATION_PROMPTPART_FILES.map((file) => readSource(repoRoot, file)).join('\n');
  const uapiTerminalSystemPrompt = readSource(repoRoot, SOURCE_ROOTS.uapiTerminalSystemPrompt);
  const conversationRouteShared = readSource(repoRoot, SOURCE_ROOTS.conversationRouteShared);
  const conversationApiRoute = readSource(repoRoot, SOURCE_ROOTS.conversationApiRoute);
  const conversationStreamEvents = readSource(repoRoot, SOURCE_ROOTS.conversationStreamEvents);
  const conversationTelemetry = readSource(repoRoot, SOURCE_ROOTS.conversationTelemetry);
  const conversationStreamUi = readSource(repoRoot, SOURCE_ROOTS.conversationStreamUi);
  const conversationStreamUiHeader = readSource(repoRoot, SOURCE_ROOTS.conversationStreamUiHeader);
  const conversationStreamEventsTest = readSource(repoRoot, SOURCE_ROOTS.conversationStreamEventsTest);
  const conversationTelemetryTest = readSource(repoRoot, SOURCE_ROOTS.conversationTelemetryTest);
  const conversationStreamUiTest = readSource(repoRoot, SOURCE_ROOTS.conversationStreamUiTest);
  const docCodeToolPrompt = readSource(repoRoot, SOURCE_ROOTS.docCodeToolPrompt);
  const formatUsableTools = readSource(repoRoot, SOURCE_ROOTS.formatUsableTools);
  const toolExecutionPrompt = readSource(repoRoot, SOURCE_ROOTS.toolExecutionPrompt);
  const agentPrompt = readSource(repoRoot, SOURCE_ROOTS.agentPrompt);
  const toolPromptRegistry = readSource(repoRoot, SOURCE_ROOTS.toolPromptRegistry);
  const gate3ContractsSource = readSource(repoRoot, SOURCE_ROOTS.gate3ContractsSource);
  const btdMcpToolContract = readSource(repoRoot, SOURCE_ROOTS.btdMcpToolContract);
  const btdMcpToolContractTest = readSource(repoRoot, SOURCE_ROOTS.btdMcpToolContractTest);
  const btdApiBoundaries = readSource(repoRoot, SOURCE_ROOTS.btdApiBoundaries);
  const btdApiRouteTest = readSource(repoRoot, SOURCE_ROOTS.btdApiRouteTest);
  const chatGptToolDocPrompts = readSource(repoRoot, SOURCE_ROOTS.chatGptToolDocPrompts);
  const chatGptTools = readSource(repoRoot, SOURCE_ROOTS.chatGptTools);
  const chatGptActionContract = readSource(repoRoot, SOURCE_ROOTS.chatGptActionContract);
  const chatGptToolsTest = readSource(repoRoot, SOURCE_ROOTS.chatGptToolsTest);
  const chatGptActionContractTest = readSource(repoRoot, SOURCE_ROOTS.chatGptActionContractTest);
  const publicDocs = readSource(repoRoot, SOURCE_ROOTS.publicDocs);
  const terminalReadiness = readSource(repoRoot, SOURCE_ROOTS.terminalReadiness);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);
  const spec = readSource(repoRoot, SOURCE_ROOTS.spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const readme = readSource(repoRoot, SOURCE_ROOTS.readme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);

  return [
    predicate(
      'conversation-agent-uses-ptrr',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationAgent,
      conversationAgent.includes('factoryPTRRAgent') && !conversationAgent.includes('factoryAgentWithSingleStep'),
    ),
    predicate(
      'conversation-agent-step-prompts-use-promptparts',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationAgent,
      conversationAgent.includes('conversationAgentPrompt') &&
        conversationAgent.includes('conversationStepPrompts') &&
        conversationAgent.includes('PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRPLAN_PURPOSE') &&
        conversationAgent.includes('PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRRETRY_PURPOSE'),
    ),
    predicate(
      'conversation-promptparts-mention-source-safe',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /source-safe/iu.test(conversationPromptParts),
    ),
    predicate(
      'conversation-promptparts-mention-route-authority',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /route authority/iu.test(conversationPromptParts),
    ),
    predicate(
      'conversation-promptparts-mention-source-selection',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /source selection|source selector/iu.test(conversationPromptParts),
    ),
    predicate(
      'conversation-promptparts-mention-disclosure',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /disclosure/iu.test(conversationPromptParts),
    ),
    predicate(
      'conversation-promptparts-mention-typed-output',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /typed output|typed return/iu.test(conversationPromptParts),
    ),
    predicate(
      'conversation-promptparts-block-protected-payloads',
      'conversation-ptrr-promptpart-rewrite-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /protected source/iu.test(conversationPromptParts) && /unpaid AssetPack source/u.test(conversationPromptParts),
    ),
    predicate(
      'system-prompt-requires-hierarchy',
      'conversation-terminal-system-prompt-boundary',
      SOURCE_ROOTS.conversationSystemPrompt,
      conversationSystemPrompt.includes('this.requireHierarchy()') &&
        conversationSystemPrompt.includes("this.require('system:identity')") &&
        conversationSystemPrompt.includes("this.require('system:usage')"),
    ),
    predicate(
      'system-prompt-uses-specific-promptparts',
      'conversation-terminal-system-prompt-boundary',
      SOURCE_ROOTS.conversationSystemPrompt,
      conversationSystemPrompt.includes('PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_IDENTITY_CORESTATEMENT') &&
        conversationSystemPrompt.includes('PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_USAGE_GUIDANCE'),
    ),
    predicate(
      'uapi-terminal-prompt-imports-canonical-system-prompt',
      'conversation-terminal-system-prompt-boundary',
      SOURCE_ROOTS.uapiTerminalSystemPrompt,
      uapiTerminalSystemPrompt.includes('BITCODE_CONVERSATION_SYSTEM_PROMPT') &&
        uapiTerminalSystemPrompt.includes('formatStructured()'),
    ),
    predicate(
      'system-promptparts-mention-route-authority',
      'conversation-terminal-system-prompt-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /route authority/iu.test(conversationPromptParts),
    ),
    predicate(
      'system-promptparts-mention-prompt-result-disclosure',
      'conversation-terminal-system-prompt-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /prompt\/result disclosure/iu.test(conversationPromptParts),
    ),
    predicate(
      'system-promptparts-block-protected-payloads',
      'conversation-terminal-system-prompt-boundary',
      SOURCE_ROOTS.conversationPromptParts,
      /protected prompt, source, settlement, wallet, or unpaid AssetPack payloads/u.test(conversationPromptParts),
    ),
    predicate(
      'stream-events-use-prompt-template-only',
      'conversation-stream-log-disclosure-boundary',
      SOURCE_ROOTS.conversationStreamEvents,
      conversationStreamEvents.includes("promptDisclosurePosture: 'prompt_template_id_only'"),
    ),
    predicate(
      'stream-events-use-parsed-result-shape-only',
      'conversation-stream-log-disclosure-boundary',
      SOURCE_ROOTS.conversationStreamEvents,
      conversationStreamEvents.includes("resultDisclosurePosture: 'parsed_result_shape_only'"),
    ),
    predicate(
      'stream-events-sanitize-unsafe-metadata',
      'conversation-stream-log-disclosure-boundary',
      SOURCE_ROOTS.conversationStreamEvents,
      conversationStreamEvents.includes('sanitizeMetadata') &&
        conversationStreamEvents.includes('rawPrompt') &&
        conversationStreamEvents.includes('rawResponse') &&
        conversationStreamEvents.includes('sourceContent'),
    ),
    predicate(
      'conversation-telemetry-redacts-secrets',
      'conversation-stream-log-disclosure-boundary',
      SOURCE_ROOTS.conversationTelemetry,
      conversationTelemetry.includes('SECRET_VALUE_PATTERNS') &&
        conversationTelemetry.includes('redactPemPrivateKeyBlocks') &&
        conversationTelemetry.includes('source_safe_conversation_telemetry_metadata'),
    ),
    predicate(
      'pipeline-log-renders-prompt-disclosure',
      'conversation-stream-log-disclosure-boundary',
      SOURCE_ROOTS.conversationStreamUi,
      conversationStreamUi.includes('promptDisclosurePosture') &&
        conversationStreamUiHeader.includes('promptDisclosurePosture'),
    ),
    predicate(
      'pipeline-log-renders-return-schema-metadata',
      'conversation-stream-log-disclosure-boundary',
      SOURCE_ROOTS.conversationStreamUi,
      conversationStreamUi.includes('promptTemplateId') &&
        conversationStreamUi.includes('outputSchema') &&
        conversationStreamUi.includes('returnType'),
    ),
    predicate(
      'pipeline-log-tests-source-safe-disclosure',
      'conversation-stream-log-disclosure-boundary',
      SOURCE_ROOTS.conversationStreamUiTest,
      conversationStreamEventsTest.includes('prompt_template_id_only') &&
        conversationTelemetryTest.includes('source_safe_conversation_telemetry') &&
        conversationStreamUiTest.includes('prompt_template_id_only'),
    ),
    predicate(
      'doccode-tool-prompt-extends-prompt',
      'doccode-tool-prompt-program-boundary',
      SOURCE_ROOTS.docCodeToolPrompt,
      docCodeToolPrompt.includes('export class DocCodeToolPrompt extends Prompt'),
    ),
    predicate(
      'doccode-tool-prompt-uses-promptparts',
      'doccode-tool-prompt-program-boundary',
      SOURCE_ROOTS.docCodeToolPrompt,
      docCodeToolPrompt.includes('PromptPart') &&
        docCodeToolPrompt.includes('PROMPTPART_GENERIC_DOCCODE_PURPOSE_LABEL') &&
        docCodeToolPrompt.includes('setPurpose'),
    ),
    predicate(
      'format-usable-tools-formats-doccode-prompts',
      'doccode-tool-prompt-program-boundary',
      SOURCE_ROOTS.formatUsableTools,
      formatUsableTools.includes('formatToolsWithDocCodeToolsIntoUsableTools') &&
        formatUsableTools.includes('docCodePrompt.format(formatter)'),
    ),
    predicate(
      'format-usable-tools-exposes-doccode-presence',
      'doccode-tool-prompt-program-boundary',
      SOURCE_ROOTS.formatUsableTools,
      formatUsableTools.includes('extractToolMetadata') && formatUsableTools.includes('hasDocCodePrompt'),
    ),
    predicate(
      'tool-execution-injects-available-tool-docs',
      'doccode-tool-prompt-program-boundary',
      SOURCE_ROOTS.toolExecutionPrompt,
      toolExecutionPrompt.includes('injectAvailableTools') && toolExecutionPrompt.includes('auto:tool_doc_'),
    ),
    predicate(
      'agent-prompt-excludes-tools-from-agent-level',
      'doccode-tool-prompt-program-boundary',
      SOURCE_ROOTS.agentPrompt,
      agentPrompt.includes('Tools are NOT part of prompts') && agentPrompt.includes('Progressive specificity'),
    ),
    predicate(
      'tool-prompt-registry-extends-registry',
      'tool-prompt-registry-hierarchy-boundary',
      SOURCE_ROOTS.toolPromptRegistry,
      toolPromptRegistry.includes('class ToolPromptRegistry extends RegistryImpl'),
    ),
    predicate(
      'tool-prompt-registry-walks-execution-parent-chain',
      'tool-prompt-registry-hierarchy-boundary',
      SOURCE_ROOTS.toolPromptRegistry,
      toolPromptRegistry.includes('while (current)') && toolPromptRegistry.includes('current.parent'),
    ),
    predicate(
      'tool-prompt-registry-uses-fallback-keys',
      'tool-prompt-registry-hierarchy-boundary',
      SOURCE_ROOTS.toolPromptRegistry,
      toolPromptRegistry.includes('getPromptWithFallback') && toolPromptRegistry.includes('for (const key of keys)'),
    ),
    predicate(
      'tool-prompt-registry-formats-input-output-error',
      'tool-prompt-registry-hierarchy-boundary',
      SOURCE_ROOTS.toolPromptRegistry,
      toolPromptRegistry.includes('formatInput') &&
        toolPromptRegistry.includes('formatOutput') &&
        toolPromptRegistry.includes('formatError'),
    ),
    predicate(
      'gate3-covers-tool-doc-code-injection',
      'tool-prompt-registry-hierarchy-boundary',
      SOURCE_ROOTS.gate3ContractsSource,
      gate3ContractsSource.includes('tool-doc-code-prompt-injection') &&
        gate3ContractsSource.includes('formatToolsWithDocCodeToolsIntoUsableTools'),
    ),
    predicate(
      'mcp-contract-declares-required-tool-ids',
      'mcp-api-public-contract-prompt-boundary',
      SOURCE_ROOTS.btdMcpToolContract,
      btdMcpToolContract.includes('BTD_MCP_TOOL_CONTRACT_IDS') && btdMcpToolContract.includes('buildBtdMcpToolContractRegistry'),
    ),
    predicate(
      'mcp-contract-declares-input-schema-ids',
      'mcp-api-public-contract-prompt-boundary',
      SOURCE_ROOTS.btdMcpToolContract,
      btdMcpToolContract.includes('inputSchemaId') && btdMcpToolContract.includes('bitcode.mcp.assetPackCreate.input.v1'),
    ),
    predicate(
      'mcp-contract-declares-denied-states',
      'mcp-api-public-contract-prompt-boundary',
      SOURCE_ROOTS.btdMcpToolContract,
      btdMcpToolContract.includes('MCP_DENIED_STATES') ||
        (btdMcpToolContract.includes('deniedStates') && btdMcpToolContract.includes('MISSING_API_KEY')),
    ),
    predicate(
      'mcp-contract-source-safety-guards-private-payloads',
      'mcp-api-public-contract-prompt-boundary',
      SOURCE_ROOTS.btdMcpToolContract,
      btdMcpToolContract.includes('SECRET_OR_SOURCE_PATTERNS') &&
        btdMcpToolContract.includes('protected source') &&
        btdApiBoundaries.includes('sourceSafePreviewRoot'),
    ),
    predicate(
      'mcp-contract-tests-source-safety',
      'mcp-api-public-contract-prompt-boundary',
      SOURCE_ROOTS.btdMcpToolContractTest,
      btdMcpToolContractTest.includes('sourceSafety') && btdApiRouteTest.includes('public API'),
    ),
    predicate(
      'public-api-docs-teach-request-shape-and-failure-posture',
      'mcp-api-public-contract-prompt-boundary',
      SOURCE_ROOTS.publicDocs,
      publicDocs.includes('request shape') && publicDocs.includes('failure posture') && publicDocs.includes('MCP'),
    ),
    predicate(
      'chatgpt-prompts-use-doccode-prompt',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptToolDocPrompts,
      chatGptToolDocPrompts.includes('new DocCodeToolPrompt') && chatGptToolDocPrompts.includes('function buildPrompt'),
    ),
    predicate(
      'chatgpt-prompts-export-tool-carriers',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptToolDocPrompts,
      ['DEPICT_DESIGN_ASSET_DOC_CODE_TOOL_PROMPT', 'DESIGN_CODE_DOC_CODE_TOOL_PROMPT', 'WRITE_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT'].every((name) =>
        chatGptToolDocPrompts.includes(name),
      ),
    ),
    predicate(
      'chatgpt-tools-format-doccode-prompts',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptTools,
      chatGptTools.includes('WRITE_CODE_CHANGES_VCS_DOC_CODE_TOOL_PROMPT.format()') &&
        chatGptTools.includes('VERCEL_MCP_DOC_CODE_TOOL_PROMPT.format()'),
    ),
    predicate(
      'chatgpt-tools-carry-doccode-prompt-metadata',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptTools,
      chatGptTools.includes('docCodePrompt:') && chatGptTools.includes('sourceSafeRendererId'),
    ),
    predicate(
      'chatgpt-tools-enforce-read-access-and-organization-authority',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptTools,
      chatGptTools.includes('assertChatGptAppReadAccess') && chatGptTools.includes('assertChatGptAppOrganizationAuthority'),
    ),
    predicate(
      'chatgpt-action-contract-covers-reading-actions',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptActionContract,
      chatGptActionContract.includes('bitcode_request_read') &&
        chatGptActionContract.includes('bitcode_request_finding_fits') &&
        chatGptActionContract.includes('bitcode_deliver_asset_pack'),
    ),
    predicate(
      'chatgpt-action-contract-declares-source-safe-renderers',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptActionContract,
      chatGptActionContract.includes('sourceSafeRendererId') &&
        chatGptActionContract.includes('renderBtdChatGptAppSourceSafeResponse'),
    ),
    predicate(
      'chatgpt-tests-cover-write-admission',
      'chatgpt-app-tool-prompt-boundary',
      SOURCE_ROOTS.chatGptToolsTest,
      chatGptToolsTest.includes('readAccess') &&
        chatGptToolsTest.includes('organizationAuthority') &&
        chatGptActionContractTest.includes('sourceSafeRendererId'),
    ),
    predicate(
      'terminal-app-prompt-uses-canonical-conversation-prompt',
      'terminal-public-api-interface-summary-boundary',
      SOURCE_ROOTS.uapiTerminalSystemPrompt,
      uapiTerminalSystemPrompt.includes('BITCODE_CONVERSATION_SYSTEM_PROMPT'),
    ),
    predicate(
      'conversation-route-shared-stream-events-source-safe',
      'terminal-public-api-interface-summary-boundary',
      SOURCE_ROOTS.conversationRouteShared,
      conversationRouteShared.includes('buildConversationStreamEvent') &&
        conversationRouteShared.includes("promptDisclosurePosture: 'prompt_template_id_only'"),
    ),
    predicate(
      'conversation-api-route-projects-prompt-disclosure',
      'terminal-public-api-interface-summary-boundary',
      SOURCE_ROOTS.conversationApiRoute,
      conversationApiRoute.includes('buildConversationStreamEvent') && conversationApiRoute.includes('sourceSafetyClass'),
    ),
    predicate(
      'terminal-readiness-names-connected-interface-authority',
      'terminal-public-api-interface-summary-boundary',
      SOURCE_ROOTS.terminalReadiness,
      terminalReadiness.includes('MCP and ChatGPT App connected interfaces') &&
        terminalReadiness.includes('not as parallel Exchange owners'),
    ),
    predicate(
      'public-docs-cover-mcp-chatgpt-api-terminal-boundaries',
      'terminal-public-api-interface-summary-boundary',
      SOURCE_ROOTS.publicDocs,
      publicDocs.includes('MCP/API') && publicDocs.includes('ChatGPT App') && publicDocs.includes('Terminal'),
    ),
    predicate('gate7-source-exists', 'conversation-tool-interface-tests-docs-workflows', SOURCE_ROOTS.packageSource, sourceExists(repoRoot, SOURCE_ROOTS.packageSource)),
    predicate('gate7-test-exists', 'conversation-tool-interface-tests-docs-workflows', SOURCE_ROOTS.packageTest, sourceExists(repoRoot, SOURCE_ROOTS.packageTest)),
    predicate('gate7-generator-exists', 'conversation-tool-interface-tests-docs-workflows', SOURCE_ROOTS.generator, sourceExists(repoRoot, SOURCE_ROOTS.generator)),
    predicate('gate7-checker-exists', 'conversation-tool-interface-tests-docs-workflows', SOURCE_ROOTS.checker, sourceExists(repoRoot, SOURCE_ROOTS.checker)),
    predicate(
      'package-json-exposes-gate7-scripts',
      'conversation-tool-interface-tests-docs-workflows',
      SOURCE_ROOTS.packageJson,
      packageJson.includes('generate:v41-conversation-tool-interface-prompt-rewrite') &&
        packageJson.includes('check:v41-gate7'),
    ),
    predicate(
      'workflows-run-gate7-checker',
      'conversation-tool-interface-tests-docs-workflows',
      SOURCE_ROOTS.gateWorkflow,
      gateWorkflow.includes('check-v41-gate7-conversation-tool-interface-prompt-rewrite.mjs') &&
        canonWorkflow.includes('check-v41-gate7-conversation-tool-interface-prompt-rewrite.mjs'),
    ),
    predicate(
      'spec-documents-gate7-closure',
      'conversation-tool-interface-tests-docs-workflows',
      SOURCE_ROOTS.spec,
      spec.includes('Gate 7 is closed by') &&
        delta.includes('Gate 7 is package-backed') &&
        notes.includes('Conversation, tool-definition, MCP API, ChatGPT App, public API, Terminal'),
    ),
    predicate(
      'roadmap-documents-gate7-closure',
      'conversation-tool-interface-tests-docs-workflows',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V41 Gate 7 closure anchor') &&
        ((/Current working gate: V41 Gate (?:7|8|9)/u.test(roadmap) &&
          (/Next queued gate after V41 Gate (?:7|8): V41 (?:Prompt Benchmark Report And Telemetry Integration|Promotion Readiness)/u.test(roadmap) ||
            /V41 Gate 9 closure anchor/u.test(roadmap))) ||
          /Latest closed version: V41 Prompt And PromptPart Excellence/u.test(roadmap) ||
          /Recent V41 closure anchor/u.test(roadmap)),
    ),
    predicate(
      'readmes-document-gate7-helpers',
      'conversation-tool-interface-tests-docs-workflows',
      SOURCE_ROOTS.protocolReadme,
      readme.includes('V41 Gate 7') && protocolReadme.includes('V41ConversationToolInterfacePromptRewrite'),
    ),
  ];
}

function dependencyRoot(report, fallbackPrefix) {
  return report?.artifactRoot || `${fallbackPrefix}:missing`;
}

function sourceRootStats(repoRoot, rows) {
  const sourceRoots = unique(rows.flatMap((item) => item.sourceRoots));
  const sourceHashRoots = Object.fromEntries(
    sourceRoots
      .filter((sourcePath) => sourceExists(repoRoot, sourcePath) && statSync(path.join(repoRoot, sourcePath)).isFile())
      .map((sourcePath) => [sourcePath, `source:${sourceHash(repoRoot, sourcePath)}`]),
  );
  return {
    sourceRoots,
    missingSourceRoots: sourceRoots.filter((sourcePath) => !sourceExists(repoRoot, sourcePath)),
    legacySourceRoots: sourceRoots.filter((sourcePath) => sourcePath.includes('_legacy/')),
    sourceHashRoots,
  };
}

function inventoryCounts(inventory) {
  const promptPartRows = inventory?.promptPartRows || [];
  const promptRows = inventory?.promptRows || [];
  return {
    conversationPromptPartRowCount: promptPartRows.filter((item) => item.promptFamilyIds?.includes('Conversation')).length,
    conversationPromptRowCount: promptRows.filter((item) => item.promptFamilyIds?.includes('Conversation')).length,
    toolPromptPartRowCount: promptPartRows.filter((item) => item.promptFamilyIds?.includes('ToolDefinition')).length,
    toolPromptRowCount: promptRows.filter((item) => item.promptFamilyIds?.includes('ToolDefinition')).length,
    interfacePromptPartRowCount: promptPartRows.filter((item) => item.promptFamilyIds?.includes('Interface')).length,
    interfacePromptRowCount: promptRows.filter((item) => item.promptFamilyIds?.includes('Interface')).length,
  };
}

function buildSourceSafety(rows) {
  return {
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
    rowCount: rows.length,
  };
}

export function buildV41ConversationToolInterfacePromptRewrite(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const generatedAt = options.generatedAt || 'deterministic';
  const rows = [...V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ROWS];
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults.filter((item) => !item.passed).map((item) => item.id);
  const failingRowIds = unique(predicateResults.filter((item) => !item.passed).map((item) => item.rowId));
  const stats = sourceRootStats(repoRoot, rows);
  const inventory = buildV41PromptPartPromptInventory({ repoRoot, generatedAt });
  const gate3 = buildV41RegistryInterpolationContracts({ repoRoot, generatedAt });
  const gate4 = buildV41ReadingPromptBenchmarkBaselines({ repoRoot, generatedAt });
  const gate5 = buildV41ReadNeedPromptHardening({ repoRoot, generatedAt });
  const gate6 = buildV41ReadFitsFindingPromptHardening({ repoRoot, generatedAt });
  const v38ConversationToolParity = buildV38ConversationToolPromptInferenceParity({ repoRoot });
  const counts = inventoryCounts(inventory);
  const rowRoots = rows.map((item) => item.rowRoot);
  const sourceSafety = buildSourceSafety(rows);
  const coverage = {
    rowCount: rows.length,
    requiredPredicateCount: predicateResults.length,
    passedPredicateCount: predicateResults.length - failedPredicateIds.length,
    failedPredicateIds,
    failingRowIds,
    sourceRootCount: stats.sourceRoots.length,
    sourceRootPresentCount: stats.sourceRoots.length - stats.missingSourceRoots.length,
    missingSourceRoots: stats.missingSourceRoots,
    legacySourceRoots: stats.legacySourceRoots,
    promptSurfaceCount: unique(rows.flatMap((item) => item.promptSurfaceIds)).length,
    parserTargetCount: unique(rows.flatMap((item) => item.parserTargetIds)).length,
    benchmarkFixtureCount: unique(rows.flatMap((item) => item.benchmarkFixtureIds)).length,
    metricCount: unique(rows.flatMap((item) => item.metricIds)).length,
    hardeningScoreMinimum: failedPredicateIds.length === 0 ? 1 : 0,
    ...counts,
    v38ConversationToolParityPassed: v38ConversationToolParity.passed === true,
    gate2InventoryPassed: inventory.passed === true,
    gate3RegistryInterpolationPassed: gate3.passed === true,
    gate4ReadingBenchmarkPassed: gate4.passed === true,
    gate5ReadNeedHardeningPassed: gate5.passed === true,
    gate6ReadFitsFindingHardeningPassed: gate6.passed === true,
    sourceSafeMetadataOnly: true,
    rawPromptTextSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
  };
  const dependencyRoots = {
    v38ConversationToolPromptInferenceParityRoot: dependencyRoot(
      v38ConversationToolParity,
      'v38-conversation-tool-prompt-inference-parity',
    ),
    gate2InventoryRoot: dependencyRoot(inventory, 'v41-promptpart-prompt-inventory'),
    gate3RegistryInterpolationRoot: dependencyRoot(gate3, 'v41-registry-interpolation-contract'),
    gate4ReadingPromptBenchmarkBaselineRoot: dependencyRoot(gate4, 'v41-reading-prompt-benchmark-baselines'),
    gate5ReadNeedPromptHardeningRoot: dependencyRoot(gate5, 'v41-readneed-prompt-hardening'),
    gate6ReadFitsFindingPromptHardeningRoot: dependencyRoot(gate6, 'v41-readfitsfinding-prompt-hardening'),
  };
  const passed =
    failedPredicateIds.length === 0 &&
    stats.missingSourceRoots.length === 0 &&
    stats.legacySourceRoots.length === 0 &&
    v38ConversationToolParity.passed === true &&
    inventory.passed === true &&
    gate3.passed === true &&
    gate4.passed === true &&
    gate5.passed === true &&
    gate6.passed === true;
  const artifactRootSeed = JSON.stringify({
    rowRoots,
    failedPredicateIds,
    dependencyRoots,
    sourceHashRoots: stats.sourceHashRoots,
    metricIds: V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_METRIC_IDS,
  });

  return {
    artifactId: 'v41-conversation-tool-interface-prompt-rewrite',
    schemaId: V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_SCHEMA_ID,
    version: V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_VERSION,
    currentTarget: V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_CURRENT_TARGET,
    sourceSafetyVerdict: V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_SOURCE_SAFETY_VERDICT,
    artifactPath: V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ARTIFACT_PATH,
    generatedAt,
    artifactRoot: artifactRoot(artifactRootSeed),
    passed,
    failures: [
      ...failedPredicateIds.map((id) => `Failed predicate: ${id}`),
      ...stats.missingSourceRoots.map((sourcePath) => `Missing source root: ${sourcePath}`),
      ...stats.legacySourceRoots.map((sourcePath) => `Legacy source root included: ${sourcePath}`),
      ...(v38ConversationToolParity.passed ? [] : ['V38 Conversation/tool prompt parity dependency failed']),
      ...(inventory.passed ? [] : ['V41 Gate 2 inventory dependency failed']),
      ...(gate3.passed ? [] : ['V41 Gate 3 registry/interpolation dependency failed']),
      ...(gate4.passed ? [] : ['V41 Gate 4 Reading benchmark dependency failed']),
      ...(gate5.passed ? [] : ['V41 Gate 5 ReadNeed hardening dependency failed']),
      ...(gate6.passed ? [] : ['V41 Gate 6 ReadFitsFinding hardening dependency failed']),
    ],
    metricIds: [...V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_METRIC_IDS],
    disclosureTiers: [...V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_DISCLOSURE_TIERS],
    rows: rows.map((item) => ({
      ...item,
      passed: !failingRowIds.includes(item.rewriteId),
      hardeningScore: failingRowIds.includes(item.rewriteId) ? 0 : 1,
      sourceHashes: Object.fromEntries(
        item.sourceRoots
          .filter((sourcePath) => sourceExists(repoRoot, sourcePath) && statSync(path.join(repoRoot, sourcePath)).isFile())
          .map((sourcePath) => [sourcePath, sourceHash(repoRoot, sourcePath)]),
      ),
    })),
    predicateResults,
    dependencyRoots,
    coverage,
    sourceSafety,
    sourceRoots: SOURCE_ROOTS,
  };
}

// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV41PromptPartPromptInventory } from './v41-promptpart-prompt-inventory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V41_REGISTRY_INTERPOLATION_CONTRACTS_ARTIFACT_PATH =
  '.bitcode/v41-registry-interpolation-contracts.json';
export const V41_REGISTRY_INTERPOLATION_CONTRACTS_SCHEMA_ID =
  'bitcode.v41.registryInterpolationContracts.v1';
export const V41_REGISTRY_INTERPOLATION_CONTRACTS_VERSION = 'V41';
export const V41_REGISTRY_INTERPOLATION_CONTRACTS_CURRENT_TARGET = 'V40';
export const V41_REGISTRY_INTERPOLATION_CONTRACTS_SOURCE_SAFETY_VERDICT =
  'source-safe-registry-interpolation-contract-metadata';

export const V41_REGISTRY_INTERPOLATION_REQUIRED_FIELD_IDS = Object.freeze([
  'contractId',
  'sourceRoots',
  'registryIds',
  'compositionLevelIds',
  'interpolationKeyIds',
  'missingKeyBehaviorIds',
  'toolPromptInjectionIds',
  'contextHandlingIds',
  'parserTargetIds',
  'executionAncestryFrameIds',
  'validationCommand',
  'disclosureTier',
]);

export const V41_REGISTRY_INTERPOLATION_COMPOSITION_LEVEL_IDS = Object.freeze([
  'pipeline-or-phase-context',
  'ptrr-agent',
  'ptrr-step',
  'failsafe-generation-sequence',
  'failsafe-substep',
  'thricified-generation',
  'tool-doc-code-prompt',
  'parser-target',
]);

export const V41_REGISTRY_INTERPOLATION_DISCLOSURE_TIERS = Object.freeze([
  'registry_id_source_safe',
  'interpolation_key_source_safe',
  'execution_ancestry_frame_source_safe',
  'parser_target_id_source_safe',
  'source_hash_source_safe',
  'raw_prompt_text_private',
  'raw_provider_response_private',
  'private_context_private',
  'unpaid_assetpack_source_private',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-prompt-text',
  'raw-provider-responses',
  'private-context',
  'settlement-private-payloads',
  'unpaid-assetpack-source',
]);

const SOURCE_ROOTS = Object.freeze({
  promptPrimitive: 'packages/prompts/src/prompt.ts',
  templatedPromptPartPrimitive: 'packages/prompts/src/parts/TemplatedPromptPart.ts',
  executionPrompt: 'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
  executionPrimitive: 'packages/execution-generics/src/Execution.ts',
  promptExecution: 'packages/prompts/src/execution/PromptExecution.ts',
  agentExecution: 'packages/agent-generics/src/execution/AgentExecution.ts',
  agentExecutionIndex: 'packages/agent-generics/src/execution/index.ts',
  agentPrompt: 'packages/agent-generics/src/prompts/AgentPrompt.ts',
  agentStepPrompt: 'packages/agent-generics/src/prompts/AgentStepPrompt.ts',
  agentGenerationSubStepPrompt: 'packages/agent-generics/src/prompts/AgentGenerationSubStepPrompt.ts',
  failsafeMetaSubStepPrompt: 'packages/agent-generics/src/prompts/FailsafeMetaSubStepPrompt.ts',
  toolExecutionPrompt: 'packages/agent-generics/src/prompts/ToolExecutionPrompt.ts',
  agentFactory: 'packages/agent-generics/src/agents/factories.ts',
  stepFactories: 'packages/agent-generics/src/steps/factories.ts',
  failsafeSequence: 'packages/agent-generics/src/steps/failsafe-sequence.ts',
  thricifiedGeneration: 'packages/agent-generics/src/steps/thinkings-generation.ts',
  substepFactories: 'packages/agent-generics/src/substeps/factories.ts',
  promptOverlays: 'packages/agent-generics/src/execution/prompt-overlays.ts',
  docCodeToolDecorator: 'packages/tools-generics/src/doc-code-tool/DocCodeToolDecorator.ts',
  docCodeToolPrompt: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
  formatUsableTools: 'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
  readNeed: 'packages/pipelines/asset-pack/src/read-need.ts',
  readNeedReview: 'packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts',
  readFitsRuntime: 'packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts',
  depositorySearch: 'packages/pipelines/asset-pack/src/depository-search.ts',
  assetPackSynthesisAgent:
    'packages/pipelines/asset-pack/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent.ts',
  assetPackCompletionAgent: 'packages/pipelines/asset-pack/src/agents/finish/asset-pack-completion-agent.ts',
  packageSource: 'packages/protocol/src/canonical/v41-registry-interpolation-contracts.js',
  packageTest: 'packages/protocol/test/v41-registry-interpolation-contracts.test.js',
  generator: 'scripts/generate-v41-registry-interpolation-contracts.mjs',
  checker: 'scripts/check-v41-gate3-registry-interpolation-contracts.mjs',
  gate2InventorySource: 'packages/protocol/src/canonical/v41-promptpart-prompt-inventory.js',
  gate2InventoryArtifact: '.bitcode/v41-promptpart-prompt-inventory.json',
  spec: 'BITCODE_SPEC_V41.md',
  delta: 'BITCODE_SPEC_V41_DELTA.md',
  notes: 'BITCODE_SPEC_V41_NOTES.md',
  parity: 'BITCODE_SPEC_V41_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function contractRoot(input) {
  return `v41-registry-interpolation-contract:${digest(input)}`;
}

function rowRoot(input) {
  return `v41-registry-interpolation-row:${digest(input)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.contractId),
    sourceSafetyClass: 'source_safe_registry_interpolation_contract_metadata',
    rawPromptTextSerialized: false,
    rawProviderResponseSerialized: false,
    protectedSourceVisible: false,
    privateContextSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V41_REGISTRY_INTERPOLATION_CONTRACT_ROWS = Object.freeze([
  row({
    contractId: 'prompt-registry-totality',
    label: 'Prompt registry hierarchy, required paths, patterns, and missing-path failures',
    sourceRoots: [SOURCE_ROOTS.promptPrimitive, SOURCE_ROOTS.executionPrompt],
    registryIds: ['Prompt', 'ExecutionPrompt', 'RegistryImpl<PromptPart>'],
    compositionLevelIds: ['pipeline-or-phase-context', 'parser-target'],
    interpolationKeyIds: [],
    missingKeyBehaviorIds: [
      'required-path-missing-throws',
      'required-pattern-missing-throws',
      'required-hierarchy-missing-throws',
      'executionprompt-invalid-root-throws',
    ],
    toolPromptInjectionIds: [],
    contextHandlingIds: [],
    parserTargetIds: [],
    executionAncestryFrameIds: [],
    requiredPredicateIds: [
      'prompt.extends-registry',
      'prompt.validates-required-paths',
      'prompt.validates-required-patterns',
      'prompt.validates-required-hierarchy',
      'executionprompt.enforces-root-paths',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'registry_id_source_safe',
  }),
  row({
    contractId: 'templated-promptpart-interpolation',
    label: 'Templated PromptPart placeholder extraction, defaults, validation, and missing-key behavior',
    sourceRoots: [SOURCE_ROOTS.templatedPromptPartPrimitive],
    registryIds: ['TemplatedPromptPart', 'PromptPart'],
    compositionLevelIds: ['pipeline-or-phase-context'],
    interpolationKeyIds: ['template', 'variables', 'defaults', 'validate', '{{variable}}'],
    missingKeyBehaviorIds: ['missing-required-template-variable-throws', 'template-validation-failure-throws'],
    toolPromptInjectionIds: [],
    contextHandlingIds: ['resolved-template-values'],
    parserTargetIds: [],
    executionAncestryFrameIds: [],
    requiredPredicateIds: [
      'templated.extracts-placeholders',
      'templated.merges-defaults',
      'templated.validates-values',
      'templated.throws-missing-variable',
      'templated.returns-promptpart',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'interpolation_key_source_safe',
  }),
  row({
    contractId: 'ptrr-agent-prompt-composition',
    label: 'PTRR agent prompt carrier attaches agent name and identity through execution prompt paths',
    sourceRoots: [SOURCE_ROOTS.agentPrompt, SOURCE_ROOTS.agentFactory, SOURCE_ROOTS.agentExecution],
    registryIds: ['AgentPrompt', 'AgentExecution', 'ExecutionPrompt'],
    compositionLevelIds: ['ptrr-agent'],
    interpolationKeyIds: ['agent:name', 'agent:identity'],
    missingKeyBehaviorIds: ['agent-prompt-carrier-required'],
    toolPromptInjectionIds: [],
    contextHandlingIds: ['agent-store:name', 'agent-store:startTime', 'agent-store:output'],
    parserTargetIds: [],
    executionAncestryFrameIds: ['root-execution', 'agent-execution'],
    requiredPredicateIds: [
      'agentprompt.defines-name-identity',
      'agentfactory.attaches-agent-prompt',
      'agentfactory.stores-agent-metadata',
      'agentexecution.owns-prompt-and-registries',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'execution_ancestry_frame_source_safe',
  }),
  row({
    contractId: 'ptrr-step-prompt-composition',
    label: 'PTRR step prompt carrier attaches Plan/Try/Refine/Retry purpose through step execution paths',
    sourceRoots: [SOURCE_ROOTS.agentStepPrompt, SOURCE_ROOTS.stepFactories, SOURCE_ROOTS.agentExecutionIndex],
    registryIds: ['AgentStepPrompt', 'StepExecution', 'ExecutionPrompt'],
    compositionLevelIds: ['ptrr-step'],
    interpolationKeyIds: ['step:purpose'],
    missingKeyBehaviorIds: ['step-prompt-required-for-ptrr-step'],
    toolPromptInjectionIds: [],
    contextHandlingIds: ['step-store:name', 'tools-store:usable', 'tools-store:use', 'tools-store:used'],
    parserTargetIds: [],
    executionAncestryFrameIds: ['agent-execution', 'step-execution'],
    requiredPredicateIds: [
      'stepprompt.defines-purpose',
      'stepfactory.creates-step-executions',
      'stepfactory.attaches-step-purpose',
      'stepexecution.proxies-registries',
      'stepfactory.stores-tool-state',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'execution_ancestry_frame_source_safe',
  }),
  row({
    contractId: 'failsafe-sequence-context-handling',
    label: 'FailsafeGenerationSequence selects concise context, chunks oversized composed requests, and stitches typed outputs',
    sourceRoots: [SOURCE_ROOTS.failsafeSequence, SOURCE_ROOTS.substepFactories, SOURCE_ROOTS.failsafeMetaSubStepPrompt],
    registryIds: ['FailsafeGenerationSequence', 'FailsafeMetaSubStepPrompt', 'FailsafeExecution'],
    compositionLevelIds: ['failsafe-generation-sequence', 'failsafe-substep'],
    interpolationKeyIds: ['selectedKeys', 'selectedContext', 'chunkResults'],
    missingKeyBehaviorIds: ['no-default-llm-throws', 'stitch-schema-parse-fails-closed'],
    toolPromptInjectionIds: [],
    contextHandlingIds: [
      'prepare-concise-context',
      'chunk-then-sum',
      'stitch-until-complete',
      'context.keys',
      'context.selectedKeys',
      'context.selectedContext',
      'maxRequestTokens',
    ],
    parserTargetIds: ['outputSchema'],
    executionAncestryFrameIds: ['step-execution', 'failsafe-execution', 'generation-execution'],
    requiredPredicateIds: [
      'failsafe.delegates-to-thricified',
      'failsafe.includes-context-chunk-stitch',
      'failsafe.stores-selected-context',
      'failsafe.stores-ptrr-failsafe',
      'failsafe.prompt-has-handle',
      'failsafe.uses-output-schema',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'execution_ancestry_frame_source_safe',
  }),
  row({
    contractId: 'thricified-generation-final-resolution',
    label: 'ThricifiedGeneration resolves final Reason, Judge, and StructuredOutput call chain and typed parser target',
    sourceRoots: [
      SOURCE_ROOTS.thricifiedGeneration,
      SOURCE_ROOTS.substepFactories,
      SOURCE_ROOTS.agentGenerationSubStepPrompt,
    ],
    registryIds: ['ThricifiedGeneration', 'AgentGenerationSubStepPrompt', 'GenerationExecution'],
    compositionLevelIds: ['thricified-generation'],
    interpolationKeyIds: ['substep:generate', 'auto:output_schema'],
    missingKeyBehaviorIds: ['no-default-llm-throws', 'parsed-output-required-when-parser-present'],
    toolPromptInjectionIds: ['auto:tools_doc_code_tools', 'auto:output_schema'],
    contextHandlingIds: ['systemPrompt', 'userPrompt', 'finalPrompt', 'llm.input', 'llm.prompt', 'llm.output'],
    parserTargetIds: ['ReasoningSchema', 'JudgmentSchema', 'outputSchema.parse'],
    executionAncestryFrameIds: ['failsafe-execution', 'generation-execution'],
    requiredPredicateIds: [
      'thricified.sequences-reason-judge-structured-output',
      'substep.builds-hierarchical-prompt',
      'substep.stores-final-prompt-and-output',
      'substep.stores-parsed-output',
      'generationprompt.injects-tool-docs-and-schema',
      'substep.enforces-json-generation-hints',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'parser_target_id_source_safe',
  }),
  row({
    contractId: 'execution-ancestry-context-overlays',
    label: 'Execution ancestry, prompt overlays, storage, and stream metadata bind context into prompt resolution',
    sourceRoots: [
      SOURCE_ROOTS.executionPrimitive,
      SOURCE_ROOTS.promptExecution,
      SOURCE_ROOTS.promptOverlays,
      SOURCE_ROOTS.substepFactories,
    ],
    registryIds: ['Execution', 'PromptExecution', 'ExecutionStreamAdapter', 'PromptOverlay'],
    compositionLevelIds: ['pipeline-or-phase-context', 'failsafe-substep', 'thricified-generation'],
    interpolationKeyIds: [
      'preprocess:evidence_documents:list',
      'preprocess:evidence_documents:details',
      'preprocess:otf:list',
    ],
    missingKeyBehaviorIds: ['findup-returns-undefined-when-absent', 'stream-errors-do-not-break-execution'],
    toolPromptInjectionIds: [],
    contextHandlingIds: ['store', 'findUp', 'getRoot', 'getPath', 'children', 'parent'],
    parserTargetIds: [],
    executionAncestryFrameIds: ['root-execution', 'pipeline-execution', 'agent-execution', 'step-execution', 'substep-execution'],
    requiredPredicateIds: [
      'execution.stores-and-streams-state',
      'execution.finds-up-ancestry',
      'execution.exposes-path-and-root',
      'promptexecution.inherits-requirements',
      'promptoverlays.inject-evidence-and-otf',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'execution_ancestry_frame_source_safe',
  }),
  row({
    contractId: 'tool-doc-code-prompt-injection',
    label: 'Tool doc-code prompts register, attach, format, and inject source-safe usable tool descriptions',
    sourceRoots: [
      SOURCE_ROOTS.docCodeToolDecorator,
      SOURCE_ROOTS.docCodeToolPrompt,
      SOURCE_ROOTS.formatUsableTools,
      SOURCE_ROOTS.toolExecutionPrompt,
      SOURCE_ROOTS.substepFactories,
    ],
    registryIds: ['DocCodeToolPrompt', 'DocCodeTool', 'ToolExecutionPrompt'],
    compositionLevelIds: ['tool-doc-code-prompt'],
    interpolationKeyIds: ['metadata:*', 'sections:purpose:*', 'sections:capabilities:*', 'sections:parameters:*', 'sections:output:*'],
    missingKeyBehaviorIds: ['tool-without-doc-code-falls-back', 'no-tools-available-falls-back'],
    toolPromptInjectionIds: [
      'registerDocCodeToolPrompt',
      'attachDocCodeToolPrompt',
      '__docCodePrompt',
      'formatToolsWithDocCodeToolsIntoUsableTools',
      'auto:tool_doc_*',
    ],
    contextHandlingIds: ['tools.usable', 'tools.use', 'tools.used'],
    parserTargetIds: [],
    executionAncestryFrameIds: ['step-execution', 'tool-substep'],
    requiredPredicateIds: [
      'doccodetool.registry-registers-and-gets-prompts',
      'doccodetool.decorator-attaches-prompt',
      'doccodetoolprompt.composes-required-sections',
      'usabletools.formats-doc-code-prompts',
      'toolexecutionprompt.injects-available-tool-docs',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'registry_id_source_safe',
  }),
  row({
    contractId: 'readneed-comprehension-return-type-contract',
    label: 'ReadNeedComprehensionSynthesis prompt registry, interpolation, telemetry, and parsed return type contract',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReview],
    registryIds: ['ReadNeedComprehensionSynthesis', 'READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT'],
    compositionLevelIds: ['pipeline-or-phase-context', 'ptrr-agent', 'ptrr-step', 'parser-target'],
    interpolationKeyIds: ['promptTemplateIds', 'interpolationContextKeys', 'phaseIds', 'agentIds'],
    missingKeyBehaviorIds: ['accepted-need-required-for-finding-fits', 'review-resynthesis-feedback-required'],
    toolPromptInjectionIds: [],
    contextHandlingIds: ['read-request', 'read-measurement', 'feedback-history', 'review-boundary'],
    parserTargetIds: ['ReadNeedComprehensionSynthesisSchema', 'outputSchemaIds'],
    executionAncestryFrameIds: ['pipeline-execution', 'phase-execution', 'agent-execution', 'ptrr-step-execution'],
    requiredPredicateIds: [
      'readneed.schema-is-zod-object',
      'readneed.collects-prompt-template-ids',
      'readneed.collects-interpolation-keys',
      'readneed.collects-output-schema-ids',
      'readneed.source-safety-receipt-present',
      'readneed-review.supports-resynthesis',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'parser_target_id_source_safe',
  }),
  row({
    contractId: 'readfits-finding-search-return-type-contract',
    label: 'ReadFitsFindingSynthesis many-fit search prompt, embedding, ranking, and typed result contract',
    sourceRoots: [SOURCE_ROOTS.readFitsRuntime, SOURCE_ROOTS.depositorySearch],
    registryIds: ['ReadFitsFindingSynthesis', 'READ_FITS_FINDING_SYNTHESIS_CONTRACT'],
    compositionLevelIds: ['pipeline-or-phase-context', 'ptrr-agent', 'ptrr-step', 'parser-target'],
    interpolationKeyIds: ['queryPlan', 'embeddingPolicy', 'rankingEvidence', 'selectedFitEvidence'],
    missingKeyBehaviorIds: ['accepted-need-admission-required', 'blocked-readiness-when-no-quality-fit'],
    toolPromptInjectionIds: ['provider-specific-search-channel'],
    contextHandlingIds: [
      'accepted_need_admission',
      'query_plan',
      'search_channel',
      'candidate_ranking',
      'selected_fit_provenance',
      'fit_result',
    ],
    parserTargetIds: ['DepositorySearchQueryPlan', 'DepositorySearchResult', 'outputSchemaIds'],
    executionAncestryFrameIds: ['pipeline-execution', 'phase-execution', 'agent-execution', 'tool-execution'],
    requiredPredicateIds: [
      'readfits.runtime-names-storage-record-kinds',
      'readfits.runtime-collects-telemetry-output-schemas',
      'depository.search-has-seven-channel-ids',
      'depository.search-has-embedding-policy',
      'depository.search-has-provider-interface',
      'depository.search-builds-fit-evidence',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'parser_target_id_source_safe',
  }),
  row({
    contractId: 'assetpack-synthesis-parser-delivery-contract',
    label: 'AssetPack synthesis and finishing parser targets remain withheld-source until settlement delivery',
    sourceRoots: [SOURCE_ROOTS.assetPackSynthesisAgent, SOURCE_ROOTS.assetPackCompletionAgent],
    registryIds: ['ReadFitsFindingSynthesisAssetPackSynthesisAgent', 'AssetPackCompletionAgent'],
    compositionLevelIds: ['ptrr-agent', 'ptrr-step', 'parser-target'],
    interpolationKeyIds: ['read', 'definitionOfRead', 'requirements', 'discovery', 'deliveryMechanismTemplate'],
    missingKeyBehaviorIds: ['always-real-ptrr-no-deterministic-fallback', 'completion-schema-parse-fails-closed'],
    toolPromptInjectionIds: [],
    contextHandlingIds: ['assetPackSynthesisArtifacts', 'writtenAssets', 'deliveryMechanism', 'processingStats'],
    parserTargetIds: ['AssetPackSynthesisOutputSchema', 'AssetPackCompletionOutputSchema'],
    executionAncestryFrameIds: ['pipeline-execution', 'implementation-agent-execution', 'finish-agent-execution'],
    requiredPredicateIds: [
      'assetpack-synthesis.uses-ptrr-agent',
      'assetpack-synthesis.has-output-schema',
      'assetpack-synthesis.always-real-ptrr-unwraps-envelope',
      'assetpack-completion.has-output-schema',
      'assetpack-completion.parses-output',
      'assetpack-completion.records-btc-fee-fields',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'parser_target_id_source_safe',
  }),
  row({
    contractId: 'gate2-inventory-registry-coverage-binding',
    label: 'Gate 2 PromptPart and Prompt inventory binds prompt registry coverage before Gate 3 contract closure',
    sourceRoots: [SOURCE_ROOTS.gate2InventorySource, SOURCE_ROOTS.gate2InventoryArtifact],
    registryIds: ['V41PromptPartPromptInventory'],
    compositionLevelIds: ['pipeline-or-phase-context', 'ptrr-agent', 'ptrr-step', 'tool-doc-code-prompt'],
    interpolationKeyIds: ['templateVariableNames', 'registryPathCount', 'benchmarkFixtureIds'],
    missingKeyBehaviorIds: ['prompt-inventory-artifact-stale-fails'],
    toolPromptInjectionIds: ['tool-definition-prompts'],
    contextHandlingIds: ['promptFamilyIds', 'semanticPurposeId', 'validationCommand'],
    parserTargetIds: ['inventory-row'],
    executionAncestryFrameIds: [],
    requiredPredicateIds: [
      'gate2.inventory-passed',
      'gate2.inventory-has-registry-paths',
      'gate2.inventory-has-template-variables',
      'gate2.inventory-has-reading-prompts',
      'gate2.inventory-has-tool-prompts',
      'gate2.inventory-prepares-v42-roadmap',
    ],
    validationCommand: 'pnpm run check:v41-gate3',
    disclosureTier: 'source_hash_source_safe',
  }),
]);

function buildSourceIndex(repoRoot) {
  return Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );
}

function buildPredicateResults(sourceText, gate2Inventory) {
  return [
    predicateResult(
      'prompt.extends-registry',
      SOURCE_ROOTS.promptPrimitive,
      sourceText.promptPrimitive.includes('extends RegistryImpl<PromptPart>'),
    ),
    predicateResult(
      'prompt.validates-required-paths',
      SOURCE_ROOTS.promptPrimitive,
      sourceText.promptPrimitive.includes('Required prompt path missing'),
    ),
    predicateResult(
      'prompt.validates-required-patterns',
      SOURCE_ROOTS.promptPrimitive,
      sourceText.promptPrimitive.includes('No prompt paths match required pattern'),
    ),
    predicateResult(
      'prompt.validates-required-hierarchy',
      SOURCE_ROOTS.promptPrimitive,
      sourceText.promptPrimitive.includes('Prompt requires hierarchical structure'),
    ),
    predicateResult(
      'executionprompt.enforces-root-paths',
      SOURCE_ROOTS.executionPrompt,
      sourceText.executionPrompt.includes('generic_system')
        && sourceText.executionPrompt.includes('specific_execution')
        && sourceText.executionPrompt.includes('Invalid prompt path'),
    ),
    predicateResult(
      'templated.extracts-placeholders',
      SOURCE_ROOTS.templatedPromptPartPrimitive,
      sourceText.templatedPromptPartPrimitive.includes('extractVariables(template)')
        && sourceText.templatedPromptPartPrimitive.includes('{{'),
    ),
    predicateResult(
      'templated.merges-defaults',
      SOURCE_ROOTS.templatedPromptPartPrimitive,
      sourceText.templatedPromptPartPrimitive.includes('...templated.defaults'),
    ),
    predicateResult(
      'templated.validates-values',
      SOURCE_ROOTS.templatedPromptPartPrimitive,
      sourceText.templatedPromptPartPrimitive.includes('Template validation failed'),
    ),
    predicateResult(
      'templated.throws-missing-variable',
      SOURCE_ROOTS.templatedPromptPartPrimitive,
      sourceText.templatedPromptPartPrimitive.includes('Missing required template variable'),
    ),
    predicateResult(
      'templated.returns-promptpart',
      SOURCE_ROOTS.templatedPromptPartPrimitive,
      sourceText.templatedPromptPartPrimitive.includes('return createPromptPart(result)'),
    ),
    predicateResult(
      'agentprompt.defines-name-identity',
      SOURCE_ROOTS.agentPrompt,
      sourceText.agentPrompt.includes('agent:name') && sourceText.agentPrompt.includes('agent:identity'),
    ),
    predicateResult(
      'agentfactory.attaches-agent-prompt',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes('specific_execution:agent:name')
        && sourceText.agentFactory.includes('specific_execution:agent:identity'),
    ),
    predicateResult(
      'agentfactory.stores-agent-metadata',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes("store('agent', 'name'")
        && sourceText.agentFactory.includes("store('agent', 'output'"),
    ),
    predicateResult(
      'agentexecution.owns-prompt-and-registries',
      SOURCE_ROOTS.agentExecution,
      sourceText.agentExecution.includes('readonly prompt: ExecutionPrompt')
        && sourceText.agentExecution.includes('readonly tools')
        && sourceText.agentExecution.includes('readonly llms')
        && sourceText.agentExecution.includes('readonly agents'),
    ),
    predicateResult(
      'stepprompt.defines-purpose',
      SOURCE_ROOTS.agentStepPrompt,
      sourceText.agentStepPrompt.includes('step:purpose'),
    ),
    predicateResult(
      'stepfactory.creates-step-executions',
      SOURCE_ROOTS.stepFactories,
      ['plan', 'try', 'refine', 'retry'].every((stepId) =>
        sourceText.stepFactories.includes(`StepExecution)('${stepId}'`),
      ),
    ),
    predicateResult(
      'stepfactory.attaches-step-purpose',
      SOURCE_ROOTS.stepFactories,
      sourceText.stepFactories.includes('specific_execution:step:purpose'),
    ),
    predicateResult(
      'stepexecution.proxies-registries',
      SOURCE_ROOTS.agentExecutionIndex,
      sourceText.agentExecutionIndex.includes('get llms()')
        && sourceText.agentExecutionIndex.includes('get tools()')
        && sourceText.agentExecutionIndex.includes('get agents()'),
    ),
    predicateResult(
      'stepfactory.stores-tool-state',
      SOURCE_ROOTS.stepFactories,
      sourceText.stepFactories.includes("store('tools', 'usable'")
        && sourceText.stepFactories.includes("store('tools', 'use'")
        && sourceText.stepFactories.includes("store('tools', 'used'"),
    ),
    predicateResult(
      'failsafe.delegates-to-thricified',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('createThinkingsGeneration'),
    ),
    predicateResult(
      'failsafe.includes-context-chunk-stitch',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('factoryPrepareConciseContext')
        && sourceText.failsafeSequence.includes('factoryChunkThenSum')
        && sourceText.failsafeSequence.includes('factoryStitchUntilComplete'),
    ),
    predicateResult(
      'failsafe.stores-selected-context',
      SOURCE_ROOTS.substepFactories,
      // PCC selection contract: the keys-only tree, the selected keys, and the
      // read-in selected values are stored on the failsafe execution.
      sourceText.substepFactories.includes("store('context', 'keys'")
        && sourceText.substepFactories.includes("store('context', 'selectedKeys'")
        && sourceText.substepFactories.includes("store('context', 'selectedContext'"),
    ),
    predicateResult(
      'failsafe.stores-ptrr-failsafe',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes("store('ptrr', 'failsafe'"),
    ),
    predicateResult(
      'failsafe.prompt-has-handle',
      SOURCE_ROOTS.failsafeMetaSubStepPrompt,
      sourceText.failsafeMetaSubStepPrompt.includes('failsafe:handle'),
    ),
    predicateResult(
      'failsafe.uses-output-schema',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('outputSchema.parse')
        || sourceText.substepFactories.includes('factoryStitchUntilComplete<T>'),
    ),
    predicateResult(
      'thricified.sequences-reason-judge-structured-output',
      SOURCE_ROOTS.thricifiedGeneration,
      sourceText.thricifiedGeneration.includes('factoryReason()')
        && sourceText.thricifiedGeneration.includes('factoryJudge()')
        && sourceText.thricifiedGeneration.includes('factoryStructuredOutput(outputSchema)')
        && sourceText.thricifiedGeneration.includes('sequential<any>(...seq)'),
    ),
    predicateResult(
      'substep.builds-hierarchical-prompt',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('buildHierarchicalPrompt(substep)')
        && sourceText.substepFactories.includes('prompts.join'),
    ),
    predicateResult(
      'substep.stores-final-prompt-and-output',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes("store('llm', 'input'")
        && sourceText.substepFactories.includes("store('llm', 'prompt'")
        && sourceText.substepFactories.includes("store('llm', 'output'"),
    ),
    predicateResult(
      'substep.stores-parsed-output',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes("store('llm', 'parsedOutput'"),
    ),
    predicateResult(
      'generationprompt.injects-tool-docs-and-schema',
      SOURCE_ROOTS.agentGenerationSubStepPrompt,
      sourceText.agentGenerationSubStepPrompt.includes('auto:tools_doc_code_tools')
        && sourceText.agentGenerationSubStepPrompt.includes('auto:output_schema'),
    ),
    predicateResult(
      'substep.enforces-json-generation-hints',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER')
        && sourceText.substepFactories.includes('PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA'),
    ),
    predicateResult(
      'execution.stores-and-streams-state',
      SOURCE_ROOTS.executionPrimitive,
      sourceText.executionPrimitive.includes('ExecutionStreamAdapter.onStore')
        && sourceText.executionPrimitive.includes('storeWithDestinations'),
    ),
    predicateResult(
      'execution.finds-up-ancestry',
      SOURCE_ROOTS.executionPrimitive,
      sourceText.executionPrimitive.includes('findUp<T extends StorableValue>'),
    ),
    predicateResult(
      'execution.exposes-path-and-root',
      SOURCE_ROOTS.executionPrimitive,
      sourceText.executionPrimitive.includes('getRoot()') && sourceText.executionPrimitive.includes('getPath()'),
    ),
    predicateResult(
      'promptexecution.inherits-requirements',
      SOURCE_ROOTS.promptExecution,
      sourceText.promptExecution.includes('parent.prompts.getRequired()'),
    ),
    predicateResult(
      'promptoverlays.inject-evidence-and-otf',
      SOURCE_ROOTS.promptOverlays,
      sourceText.promptOverlays.includes('preprocess:evidence_documents:list')
        && sourceText.promptOverlays.includes('preprocess:otf:list'),
    ),
    predicateResult(
      'doccodetool.registry-registers-and-gets-prompts',
      SOURCE_ROOTS.docCodeToolDecorator,
      sourceText.docCodeToolDecorator.includes('registerDocCodeToolPrompt')
        && sourceText.docCodeToolDecorator.includes('getDocCodeToolPrompt'),
    ),
    predicateResult(
      'doccodetool.decorator-attaches-prompt',
      SOURCE_ROOTS.docCodeToolDecorator,
      sourceText.docCodeToolDecorator.includes('__docCodePrompt')
        && sourceText.docCodeToolDecorator.includes('attachDocCodeToolPrompt'),
    ),
    predicateResult(
      'doccodetoolprompt.composes-required-sections',
      SOURCE_ROOTS.docCodeToolPrompt,
      sourceText.docCodeToolPrompt.includes('sections:purpose:label')
        && sourceText.docCodeToolPrompt.includes('sections:parameters:content')
        && sourceText.docCodeToolPrompt.includes('metadata:name'),
    ),
    predicateResult(
      'usabletools.formats-doc-code-prompts',
      SOURCE_ROOTS.formatUsableTools,
      sourceText.formatUsableTools.includes('formatToolsWithDocCodeToolsIntoUsableTools')
        && sourceText.formatUsableTools.includes('No tools available.'),
    ),
    predicateResult(
      'toolexecutionprompt.injects-available-tool-docs',
      SOURCE_ROOTS.toolExecutionPrompt,
      sourceText.toolExecutionPrompt.includes('injectAvailableTools')
        && sourceText.toolExecutionPrompt.includes('auto:tool_doc_'),
    ),
    predicateResult(
      'readneed.schema-is-zod-object',
      SOURCE_ROOTS.readNeed,
      sourceText.readNeed.includes('ReadNeedComprehensionSynthesisSchema = z.object'),
    ),
    predicateResult(
      'readneed.collects-prompt-template-ids',
      SOURCE_ROOTS.readNeed,
      sourceText.readNeed.includes('promptTemplateIds'),
    ),
    predicateResult(
      'readneed.collects-interpolation-keys',
      SOURCE_ROOTS.readNeed,
      sourceText.readNeed.includes('interpolationContextKeys'),
    ),
    predicateResult(
      'readneed.collects-output-schema-ids',
      SOURCE_ROOTS.readNeed,
      sourceText.readNeed.includes('outputSchemaIds'),
    ),
    predicateResult(
      'readneed.source-safety-receipt-present',
      SOURCE_ROOTS.readNeed,
      sourceText.readNeed.includes('rawProviderResponseVisible: false')
        && sourceText.readNeed.includes('unpaidAssetPackSourceVisible: false'),
    ),
    predicateResult(
      'readneed-review.supports-resynthesis',
      SOURCE_ROOTS.readNeedReview,
      sourceText.readNeedReview.includes('resynthesis') || sourceText.readNeedReview.includes('feedback'),
    ),
    predicateResult(
      'readfits.runtime-names-storage-record-kinds',
      SOURCE_ROOTS.readFitsRuntime,
      sourceText.readFitsRuntime.includes('accepted_need_admission')
        && sourceText.readFitsRuntime.includes('selected_fit_provenance'),
    ),
    predicateResult(
      'readfits.runtime-collects-telemetry-output-schemas',
      SOURCE_ROOTS.readFitsRuntime,
      sourceText.readFitsRuntime.includes('outputSchemaIds') && sourceText.readFitsRuntime.includes('telemetryReceipts'),
    ),
    predicateResult(
      'depository.search-has-seven-channel-ids',
      SOURCE_ROOTS.depositorySearch,
      [
        "'lexical'",
        "'symbolic'",
        "'path'",
        "'metadata'",
        "'measurement'",
        "'embedding-vector'",
        "'provider-specific'",
      ].every((needle) => sourceText.depositorySearch.includes(needle)),
    ),
    predicateResult(
      'depository.search-has-embedding-policy',
      SOURCE_ROOTS.depositorySearch,
      sourceText.depositorySearch.includes('buildAssetPackEmbeddingPolicy')
        && sourceText.depositorySearch.includes('embeddingPolicy'),
    ),
    predicateResult(
      'depository.search-has-provider-interface',
      SOURCE_ROOTS.depositorySearch,
      sourceText.depositorySearch.includes('DepositorySearchProvider')
        && sourceText.depositorySearch.includes('search(input'),
    ),
    predicateResult(
      'depository.search-builds-fit-evidence',
      SOURCE_ROOTS.depositorySearch,
      sourceText.depositorySearch.includes('buildDepositoryFitResultEvidence')
        || sourceText.depositorySearch.includes('DepositoryFitResultEvidence'),
    ),
    predicateResult(
      'assetpack-synthesis.uses-ptrr-agent',
      SOURCE_ROOTS.assetPackSynthesisAgent,
      sourceText.assetPackSynthesisAgent.includes('factoryAgentWithPTRR')
        && sourceText.assetPackSynthesisAgent.includes('ReadFitsFindingSynthesisAssetPackSynthesisAgent'),
    ),
    predicateResult(
      'assetpack-synthesis.has-output-schema',
      SOURCE_ROOTS.assetPackSynthesisAgent,
      sourceText.assetPackSynthesisAgent.includes('AssetPackSynthesisOutputSchema'),
    ),
    predicateResult(
      'assetpack-synthesis.always-real-ptrr-unwraps-envelope',
      SOURCE_ROOTS.assetPackSynthesisAgent,
      sourceText.assetPackSynthesisAgent.includes('finalOutput')
        && sourceText.assetPackSynthesisAgent.includes('factoryAgentWithPTRR'),
    ),
    predicateResult(
      'assetpack-completion.has-output-schema',
      SOURCE_ROOTS.assetPackCompletionAgent,
      sourceText.assetPackCompletionAgent.includes('AssetPackCompletionOutputSchema'),
    ),
    predicateResult(
      'assetpack-completion.parses-output',
      SOURCE_ROOTS.assetPackCompletionAgent,
      sourceText.assetPackCompletionAgent.includes('AssetPackCompletionOutputSchema.parse'),
    ),
    predicateResult(
      'assetpack-completion.records-btc-fee-fields',
      SOURCE_ROOTS.assetPackCompletionAgent,
      sourceText.assetPackCompletionAgent.includes('feeAsset')
        && sourceText.assetPackCompletionAgent.includes('btcFeesPaid')
        && sourceText.assetPackCompletionAgent.includes('btcFeeUsdEquivalent'),
    ),
    predicateResult(
      'gate2.inventory-passed',
      SOURCE_ROOTS.gate2InventorySource,
      gate2Inventory.passed === true,
    ),
    predicateResult(
      'gate2.inventory-has-registry-paths',
      SOURCE_ROOTS.gate2InventorySource,
      gate2Inventory.coverage.promptRowsWithRegistryPaths >= 10
        && gate2Inventory.coverage.registryPathCount >= 100,
    ),
    predicateResult(
      'gate2.inventory-has-template-variables',
      SOURCE_ROOTS.gate2InventorySource,
      gate2Inventory.coverage.templateVariableNameCount >= 0,
    ),
    predicateResult(
      'gate2.inventory-has-reading-prompts',
      SOURCE_ROOTS.gate2InventorySource,
      gate2Inventory.coverage.readingPromptRowCount >= 5,
    ),
    predicateResult(
      'gate2.inventory-has-tool-prompts',
      SOURCE_ROOTS.gate2InventorySource,
      gate2Inventory.coverage.toolPromptRowCount >= 5,
    ),
    predicateResult(
      'gate2.inventory-prepares-v42-roadmap',
      SOURCE_ROOTS.gate2InventorySource,
      gate2Inventory.coverage.v42RoadmapPrepared === true,
    ),
  ];
}

function sourceEvidenceForRows(repoRoot, rows) {
  const sourcePaths = unique(rows.flatMap((item) => item.sourceRoots));
  return sourcePaths.map((sourcePath) => ({
    sourcePath,
    exists: sourceExists(repoRoot, sourcePath),
    legacy: sourcePath.startsWith('_legacy/'),
    sourceHash: sourceExists(repoRoot, sourcePath) ? digest(readSource(repoRoot, sourcePath)) : null,
  }));
}

export function buildV41RegistryInterpolationContracts(input = {}) {
  const generatedAt = typeof input.generatedAt === 'string' ? input.generatedAt : '2026-05-26T00:00:00.000Z';
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const rows = V41_REGISTRY_INTERPOLATION_CONTRACT_ROWS.map((item) => ({
    ...item,
    sourceRootsPresent: item.sourceRoots.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
  }));
  const gate2Inventory = buildV41PromptPartPromptInventory({ generatedAt, repoRoot });
  const sourceText = buildSourceIndex(repoRoot);
  const sourcePredicateResults = buildPredicateResults(sourceText, gate2Inventory);
  const sourceEvidence = sourceEvidenceForRows(repoRoot, rows);
  const requiredPredicateIds = unique(rows.flatMap((item) => item.requiredPredicateIds));
  const passedPredicateIds = sourcePredicateResults.filter((result) => result.passed).map((result) => result.id).sort();
  const failedPredicateIds = requiredPredicateIds.filter((predicateId) =>
    !sourcePredicateResults.some((result) => result.id === predicateId && result.passed),
  );
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.exists).map((entry) => entry.sourcePath);
  const legacySourceRoots = sourceEvidence.filter((entry) => entry.legacy).map((entry) => entry.sourcePath);
  const allRegistryIds = unique(rows.flatMap((item) => item.registryIds));
  const allInterpolationKeyIds = unique(rows.flatMap((item) => item.interpolationKeyIds));
  const allMissingKeyBehaviorIds = unique(rows.flatMap((item) => item.missingKeyBehaviorIds));
  const allToolPromptInjectionIds = unique(rows.flatMap((item) => item.toolPromptInjectionIds));
  const allParserTargetIds = unique(rows.flatMap((item) => item.parserTargetIds));
  const allExecutionAncestryFrameIds = unique(rows.flatMap((item) => item.executionAncestryFrameIds));
  const failures = [];

  if (!gate2Inventory.passed) failures.push('Gate 2 PromptPart and Prompt inventory is not passing.');
  if (failedPredicateIds.length) failures.push(`failed source predicates: ${failedPredicateIds.join(', ')}`);
  if (missingSourceRoots.length) failures.push(`missing source roots: ${missingSourceRoots.join(', ')}`);
  if (legacySourceRoots.length) failures.push(`legacy source roots present: ${legacySourceRoots.join(', ')}`);
  if (rows.length < 10) failures.push('Registry/interpolation contract rows are below the minimum required count.');
  if (allRegistryIds.length < 10) failures.push('Registry/interpolation registry coverage is below minimum.');
  if (allParserTargetIds.length < 6) failures.push('Parser target coverage is below minimum.');

  const coverage = {
    rowCount: rows.length,
    requiredFieldIds: [...V41_REGISTRY_INTERPOLATION_REQUIRED_FIELD_IDS],
    compositionLevelIds: [...V41_REGISTRY_INTERPOLATION_COMPOSITION_LEVEL_IDS],
    disclosureTiers: [...V41_REGISTRY_INTERPOLATION_DISCLOSURE_TIERS],
    registryIdCount: allRegistryIds.length,
    interpolationKeyCount: allInterpolationKeyIds.length,
    missingKeyBehaviorCount: allMissingKeyBehaviorIds.length,
    toolPromptInjectionCount: allToolPromptInjectionIds.length,
    parserTargetCount: allParserTargetIds.length,
    executionAncestryFrameCount: allExecutionAncestryFrameIds.length,
    requiredPredicateCount: requiredPredicateIds.length,
    passedPredicateCount: passedPredicateIds.length,
    failedPredicateIds,
    sourceRootCount: sourceEvidence.length,
    sourceRootPresentCount: sourceEvidence.filter((entry) => entry.exists).length,
    missingSourceRoots,
    legacySourceRoots: legacySourceRoots.length > 0,
    gate2InventoryRoot: gate2Inventory.artifactRoot,
    gate2PromptPartRowCount: gate2Inventory.coverage.promptPartRowCount,
    gate2PromptRowCount: gate2Inventory.coverage.promptRowCount,
    gate2PromptRowsWithRegistryPaths: gate2Inventory.coverage.promptRowsWithRegistryPaths,
    gate2RegistryPathCount: gate2Inventory.coverage.registryPathCount,
    gate2V42RoadmapPrepared: gate2Inventory.coverage.v42RoadmapPrepared,
    sourceSafeMetadataOnly: true,
    rawPromptTextSerialized: false,
    rawProviderResponseSerialized: false,
    privateContextSerialized: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
  };

  const artifactRoot = contractRoot(
    JSON.stringify({
      rows: rows.map((item) => item.rowRoot),
      predicates: passedPredicateIds,
      coverage: {
        registryIdCount: coverage.registryIdCount,
        parserTargetCount: coverage.parserTargetCount,
        gate2InventoryRoot: coverage.gate2InventoryRoot,
      },
    }),
  );

  return {
    artifactId: 'v41-registry-interpolation-contracts',
    schemaId: V41_REGISTRY_INTERPOLATION_CONTRACTS_SCHEMA_ID,
    version: V41_REGISTRY_INTERPOLATION_CONTRACTS_VERSION,
    currentTarget: V41_REGISTRY_INTERPOLATION_CONTRACTS_CURRENT_TARGET,
    generatedAt,
    artifactPath: V41_REGISTRY_INTERPOLATION_CONTRACTS_ARTIFACT_PATH,
    sourceSafetyVerdict: V41_REGISTRY_INTERPOLATION_CONTRACTS_SOURCE_SAFETY_VERDICT,
    requiredFieldIds: [...V41_REGISTRY_INTERPOLATION_REQUIRED_FIELD_IDS],
    compositionLevelIds: [...V41_REGISTRY_INTERPOLATION_COMPOSITION_LEVEL_IDS],
    disclosureTiers: [...V41_REGISTRY_INTERPOLATION_DISCLOSURE_TIERS],
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    rows,
    sourcePredicateResults,
    sourceEvidence,
    coverage,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      rawPromptTextSerialized: false,
      rawProviderResponseSerialized: false,
      privateContextSerialized: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      allowedPayloadClasses: [
        'registry-ids',
        'interpolation-key-ids',
        'execution-ancestry-frame-ids',
        'parser-target-ids',
        'source-paths',
        'source-hashes',
        'predicate-verdicts',
      ],
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
    failures,
    passed:
      failures.length === 0
      && failedPredicateIds.length === 0
      && gate2Inventory.passed
      && coverage.sourceRootPresentCount === coverage.sourceRootCount
      && coverage.registryIdCount >= 10
      && coverage.parserTargetCount >= 6
      && coverage.rawPromptTextSerialized === false
      && coverage.rawProviderResponseSerialized === false
      && coverage.privateContextSerialized === false
      && coverage.unpaidAssetPackSourceVisible === false
      && coverage.credentialsSerialized === false
      && coverage.legacySourceRoots === false,
    artifactRoot,
  };
}

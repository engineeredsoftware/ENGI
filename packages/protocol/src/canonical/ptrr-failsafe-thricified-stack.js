// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV38InferenceSurfaceInventory } from './inference-surface-inventory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_PTRR_FAILSAFE_THRICIFIED_STACK_ARTIFACT_PATH =
  '.bitcode/v38-ptrr-failsafe-thricified-stack.json';
export const V38_PTRR_FAILSAFE_THRICIFIED_STACK_SCHEMA_ID =
  'bitcode.v38.ptrrFailsafeThricifiedStack.v1';
export const V38_PTRR_FAILSAFE_THRICIFIED_STACK_VERSION = 'V38';
export const V38_PTRR_FAILSAFE_THRICIFIED_STACK_CURRENT_TARGET = 'V37';
export const V38_PTRR_FAILSAFE_THRICIFIED_STACK_SOURCE_SAFETY_VERDICT =
  'source-safe-ptrr-failsafe-thricified-stack-metadata';

export const V38_PTRR_STEP_IDS = Object.freeze(['plan', 'try', 'refine', 'retry']);
export const V38_FAILSAFE_STAGE_IDS = Object.freeze([
  'prepare-concise-context',
  'chunk-then-sum',
  'stitch-until-complete',
]);
export const V38_THRICIFIED_GENERATION_STAGE_IDS = Object.freeze([
  'reason',
  'judge',
  'structured-output',
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
]);

const SOURCE_ROOTS = Object.freeze({
  agentFactory: 'packages/agent-generics/src/agents/factories.ts',
  stepFactories: 'packages/agent-generics/src/steps/factories.ts',
  failsafeSequence: 'packages/agent-generics/src/steps/failsafe-sequence.ts',
  thricifiedGeneration: 'packages/agent-generics/src/steps/thinkings-generation.ts',
  substepFactories: 'packages/agent-generics/src/substeps/factories.ts',
  readingContract: 'packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
  gate2Inventory: 'packages/protocol/src/canonical/inference-surface-inventory.js',
});

const STEP_SECTION_ENDINGS = Object.freeze({
  plan: '// ==================== TRY STEP ====================',
  try: '// ==================== REFINE STEP ====================',
  refine: '// ==================== RETRY STEP ====================',
  retry: '// ==================== STEP FACTORY ====================',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-ptrr-stack-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceSection(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  if (start < 0) return '';
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  return source.slice(start, end < 0 ? undefined : end);
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function buildSourceIndex(repoRoot) {
  const sourceText = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  const stepSections = Object.fromEntries(
    V38_PTRR_STEP_IDS.map((stepId) => [
      stepId,
      sourceSection(
        sourceText.stepFactories,
        `export function factory${stepId[0].toUpperCase()}${stepId.slice(1)}Step`,
        STEP_SECTION_ENDINGS[stepId],
      ),
    ]),
  );

  return { sourceText, stepSections };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_ptrr_failsafe_thricified_stack_metadata',
    protectedSourceVisible: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

function stepRow(stepId) {
  const label = `${stepId[0].toUpperCase()}${stepId.slice(1)} PTRR step`;
  return row({
    rowId: `step:${stepId}`,
    familyId: 'ptrr_step',
    label,
    sourceRoots: [SOURCE_ROOTS.stepFactories],
    ptrrStepIds: [stepId],
    failsafeStageIds: [...V38_FAILSAFE_STAGE_IDS],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    toolBoundary: stepId === 'retry' ? 'after-retry-final-attempt' : 'conditional-postprocess-after-failsafe',
    providerCallSlotsPerStep: 9,
    requiredPredicateIds: [
      `step.${stepId}.creates-step-execution`,
      `step.${stepId}.sets-step-name`,
      `step.${stepId}.creates-failsafe-sequence`,
      `step.${stepId}.attaches-step-prompt`,
      `step.${stepId}.stores-agent-start`,
      `step.${stepId}.stores-agent-complete`,
      `step.${stepId}.publishes-work-update`,
      `step.${stepId}.logs-start-trace-error`,
      `step.${stepId}.runs-tools-after-failsafe`,
    ],
    storageTargetIds: ['step.name', 'agent.start', 'agent.complete', 'tools.usable', 'tools.use', 'tools.used'],
    streamTargetIds: ['agent-start', 'agent-complete', 'tool-use', 'schema-verdict', 'llm-substep'],
  });
}

export const V38_PTRR_FAILSAFE_THRICIFIED_STACK_ROWS = Object.freeze([
  row({
    rowId: 'agent:factoryAgentWithPTRR',
    familyId: 'ptrr_agent_factory',
    label: 'factoryAgentWithPTRR prompt and step carrier',
    sourceRoots: [SOURCE_ROOTS.agentFactory],
    ptrrStepIds: [...V38_PTRR_STEP_IDS],
    failsafeStageIds: [...V38_FAILSAFE_STAGE_IDS],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    toolBoundary: 'step-owned-tools',
    providerCallSlotsPerStep: 9,
    requiredPredicateIds: [
      'agent.requires-one-prompt-carrier',
      'agent.requires-complete-step-prompts',
      'agent.resolves-agent-prompt',
      'agent.resolves-step-prompts',
      'agent.constructs-four-ptrr-steps',
      'agent.attaches-agent-prompt',
      'agent.stores-agent-metadata',
    ],
    storageTargetIds: ['agent.name', 'agent.startTime', 'agent.endTime', 'agent.output'],
    streamTargetIds: ['agent-start', 'agent-complete', 'agent-output'],
  }),
  ...V38_PTRR_STEP_IDS.map(stepRow),
  row({
    rowId: 'failsafe:createFailsafeGenerationSequence',
    familyId: 'failsafe_sequence',
    label: 'FailsafeGenerationSequence over ThricifiedGeneration',
    sourceRoots: [SOURCE_ROOTS.failsafeSequence],
    ptrrStepIds: [...V38_PTRR_STEP_IDS],
    failsafeStageIds: [...V38_FAILSAFE_STAGE_IDS],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    toolBoundary: 'outside-failsafe-sequence',
    providerCallSlotsPerStep: 9,
    requiredPredicateIds: [
      'failsafe.delegates-to-thricified',
      'failsafe.includes-prepare',
      'failsafe.includes-chunk',
      'failsafe.includes-stitch',
      'failsafe.sequences-failsafes',
      'failsafe.preserves-debug-slicing',
    ],
    storageTargetIds: ['ptrr.failsafe', 'context.full', 'context.selectors', 'chunking.required'],
    streamTargetIds: ['failsafe-start', 'failsafe-complete', 'context-prepared', 'chunking-state'],
  }),
  row({
    rowId: 'generation:createThricifiedGeneration',
    familyId: 'thricified_generation',
    label: 'ThricifiedGeneration Reason/Judge/StructuredOutput chain',
    sourceRoots: [SOURCE_ROOTS.thricifiedGeneration],
    ptrrStepIds: [...V38_PTRR_STEP_IDS],
    failsafeStageIds: [],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    toolBoundary: 'tools-not-owned-here',
    providerCallSlotsPerThricified: 3,
    requiredPredicateIds: [
      'generation.constructs-reason',
      'generation.constructs-judge',
      'generation.constructs-structured-output',
      'generation.sequences-in-order',
      'generation.fallbacks-to-all-stages',
      'generation.marks-introspection',
    ],
    storageTargetIds: ['llm.input', 'llm.prompt', 'llm.output', 'llm.parsedOutput', 'llm.usage'],
    streamTargetIds: ['llm-substep-start', 'llm-substep-success', 'llm-substep-error'],
  }),
  row({
    rowId: 'substep:prompt-context-telemetry',
    familyId: 'substep_execution',
    label: 'Failsafe and Generation execution ancestry, prompt composition, and telemetry',
    sourceRoots: [SOURCE_ROOTS.substepFactories],
    ptrrStepIds: [...V38_PTRR_STEP_IDS],
    failsafeStageIds: [...V38_FAILSAFE_STAGE_IDS],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    toolBoundary: 'tool-substep-separate-from-generation-substeps',
    providerCallSlotsPerStep: 9,
    requiredPredicateIds: [
      'substep.creates-failsafe-execution',
      'substep.creates-generation-execution',
      'substep.stores-ptrr-failsafe',
      'substep.stores-ptrr-generation',
      'substep.applies-prompt-overlays',
      'substep.builds-hierarchical-prompt',
      'substep.executes-default-llm',
      'substep.stores-llm-input-prompt-output',
      'substep.stores-parsed-output',
      'substep.maps-sequence-prompts',
    ],
    storageTargetIds: ['ptrr.failsafe', 'ptrr.generation', 'llm.input', 'llm.prompt', 'llm.output', 'llm.parsedOutput'],
    streamTargetIds: ['prompt-template', 'interpolated-prompt', 'raw-response', 'parsed-output', 'schema-verdict'],
  }),
  row({
    rowId: 'reading:gate2-counts-bound-to-stack',
    familyId: 'reading_stack_totals',
    label: 'Gate 2 Reading and Conversation counts bound to Gate 3 stack law',
    sourceRoots: [SOURCE_ROOTS.gate2Inventory, SOURCE_ROOTS.readingContract],
    ptrrStepIds: [...V38_PTRR_STEP_IDS],
    failsafeStageIds: [...V38_FAILSAFE_STAGE_IDS],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    toolBoundary: 'selected-tools-remain-step-owned',
    providerCallSlotsPerStep: 9,
    requiredPredicateIds: [
      'gate2.counts-52-ptrr-steps',
      'gate2.counts-156-thricified-chains',
      'gate2.counts-468-provider-call-slots',
      'reading.contract-names-both-pipelines',
    ],
    storageTargetIds: ['pipeline.phase', 'agent.step', 'failsafe.receipt', 'generation.receipt'],
    streamTargetIds: ['pipeline-event', 'agent-step', 'failsafe-event', 'generation-event'],
  }),
]);

function buildPredicateResults(repoRoot, index, gate2Inventory) {
  const { sourceText, stepSections } = index;
  const predicateResults = [
    predicateResult(
      'agent.requires-one-prompt-carrier',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes('accepts one Bitcode prompt carrier'),
    ),
    predicateResult(
      'agent.requires-complete-step-prompts',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes('missingStepPrompts') && sourceText.agentFactory.includes('plan/try/refine/retry'),
    ),
    predicateResult(
      'agent.resolves-agent-prompt',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes('resolveBitcodePTRRAgentPrompt'),
    ),
    predicateResult(
      'agent.resolves-step-prompts',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes('resolveBitcodePTRRStepPrompt'),
    ),
    predicateResult(
      'agent.constructs-four-ptrr-steps',
      SOURCE_ROOTS.agentFactory,
      ['factoryPlanStep', 'factoryTryStep', 'factoryRefineStep', 'factoryRetryStep'].every((needle) =>
        sourceText.agentFactory.includes(needle),
      ),
    ),
    predicateResult(
      'agent.attaches-agent-prompt',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes('specific_execution:agent:name')
        && sourceText.agentFactory.includes('specific_execution:agent:identity'),
    ),
    predicateResult(
      'agent.stores-agent-metadata',
      SOURCE_ROOTS.agentFactory,
      sourceText.agentFactory.includes("agentExec.store('agent', 'name'")
        && sourceText.agentFactory.includes("agentExec.store('agent', 'output'"),
    ),
  ];

  for (const stepId of V38_PTRR_STEP_IDS) {
    const stepSource = stepSections[stepId] || '';
    predicateResults.push(
      predicateResult(
        `step.${stepId}.creates-step-execution`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes(`StepExecution)('${stepId}'`) || stepSource.includes(`StepExecution)("${stepId}"`),
      ),
      predicateResult(
        `step.${stepId}.sets-step-name`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes(`store('step', 'name', '${stepId}'`),
      ),
      predicateResult(
        `step.${stepId}.creates-failsafe-sequence`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes('createFailsafeGenerationSequence'),
      ),
      predicateResult(
        `step.${stepId}.attaches-step-prompt`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes('specific_execution:step:purpose'),
      ),
      predicateResult(
        `step.${stepId}.stores-agent-start`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes("'start'") && stepSource.includes('agentName'),
      ),
      predicateResult(
        `step.${stepId}.stores-agent-complete`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes("'complete'") && stepSource.includes('agentName'),
      ),
      predicateResult(
        `step.${stepId}.publishes-work-update`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes('publishAgentStepWorkUpdate'),
      ),
      predicateResult(
        `step.${stepId}.logs-start-trace-error`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes('logStepStart') && stepSource.includes('logStepTrace') && stepSource.includes('logStepError'),
      ),
      predicateResult(
        `step.${stepId}.runs-tools-after-failsafe`,
        SOURCE_ROOTS.stepFactories,
        stepSource.includes('factoryToolsExecution'),
      ),
    );
  }

  predicateResults.push(
    predicateResult(
      'failsafe.delegates-to-thricified',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('createThinkingsGeneration'),
    ),
    predicateResult(
      'failsafe.includes-prepare',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('factoryPrepareConciseContext'),
    ),
    predicateResult(
      'failsafe.includes-chunk',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('factoryChunkThenSum'),
    ),
    predicateResult(
      'failsafe.includes-stitch',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('factoryStitchUntilComplete'),
    ),
    predicateResult(
      'failsafe.sequences-failsafes',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('sequential<any>(...failsafeExecutors)'),
    ),
    predicateResult(
      'failsafe.preserves-debug-slicing',
      SOURCE_ROOTS.failsafeSequence,
      sourceText.failsafeSequence.includes('BITCODE_DEBUG_ONLY_FAILSAFES')
        && sourceText.failsafeSequence.includes('BITCODE_DEBUG_ONLY_GENERATIONS'),
    ),
    predicateResult(
      'generation.constructs-reason',
      SOURCE_ROOTS.thricifiedGeneration,
      sourceText.thricifiedGeneration.includes('factoryReason()'),
    ),
    predicateResult(
      'generation.constructs-judge',
      SOURCE_ROOTS.thricifiedGeneration,
      sourceText.thricifiedGeneration.includes('factoryJudge()'),
    ),
    predicateResult(
      'generation.constructs-structured-output',
      SOURCE_ROOTS.thricifiedGeneration,
      sourceText.thricifiedGeneration.includes('factoryStructuredOutput(outputSchema)'),
    ),
    predicateResult(
      'generation.sequences-in-order',
      SOURCE_ROOTS.thricifiedGeneration,
      sourceText.thricifiedGeneration.indexOf("include('reason')") < sourceText.thricifiedGeneration.indexOf("include('judge')")
        && sourceText.thricifiedGeneration.indexOf("include('judge')") < sourceText.thricifiedGeneration.indexOf("include('structured_output')")
        && sourceText.thricifiedGeneration.includes('sequential<any>(...seq)'),
    ),
    predicateResult(
      'generation.fallbacks-to-all-stages',
      SOURCE_ROOTS.thricifiedGeneration,
      sourceText.thricifiedGeneration.includes('parts.length')
        && sourceText.thricifiedGeneration.includes('genReason')
        && sourceText.thricifiedGeneration.includes('genJudge')
        && sourceText.thricifiedGeneration.includes('genStructured'),
    ),
    predicateResult(
      'generation.marks-introspection',
      SOURCE_ROOTS.thricifiedGeneration,
      sourceText.thricifiedGeneration.includes("__gen = 'thinkings'"),
    ),
    predicateResult(
      'substep.creates-failsafe-execution',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('factoryAgentFailsafeSubStepExecution'),
    ),
    predicateResult(
      'substep.creates-generation-execution',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('factoryAgentGenerationSubStepExecution'),
    ),
    predicateResult(
      'substep.stores-ptrr-failsafe',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes("store('ptrr', 'failsafe'"),
    ),
    predicateResult(
      'substep.stores-ptrr-generation',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes("store('ptrr', 'generation'"),
    ),
    predicateResult(
      'substep.applies-prompt-overlays',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('applyPromptOverlays'),
    ),
    predicateResult(
      'substep.builds-hierarchical-prompt',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('buildHierarchicalPrompt(substep)'),
    ),
    predicateResult(
      'substep.executes-default-llm',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('getDefaultLLM') && sourceText.substepFactories.includes('await llm(llmInput)'),
    ),
    predicateResult(
      'substep.stores-llm-input-prompt-output',
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
      'substep.maps-sequence-prompts',
      SOURCE_ROOTS.substepFactories,
      sourceText.substepFactories.includes('getSequencePrompt(sequence)')
        && sourceText.substepFactories.includes('PROMPTPART_GENERIC_AGENT_GENERATION_REASON'),
    ),
    predicateResult(
      'gate2.counts-52-ptrr-steps',
      SOURCE_ROOTS.gate2Inventory,
      gate2Inventory.coverage.totalPtrrStepCount === 52,
    ),
    predicateResult(
      'gate2.counts-156-thricified-chains',
      SOURCE_ROOTS.gate2Inventory,
      gate2Inventory.coverage.totalThricifiedGenerationCount === 156,
    ),
    predicateResult(
      'gate2.counts-468-provider-call-slots',
      SOURCE_ROOTS.gate2Inventory,
      gate2Inventory.coverage.totalProviderCallCount === 468,
    ),
    predicateResult(
      'reading.contract-names-both-pipelines',
      SOURCE_ROOTS.readingContract,
      sourceText.readingContract.includes('ReadNeedComprehensionSynthesis')
        && sourceText.readingContract.includes('ReadFitsFindingSynthesis'),
    ),
  );

  return predicateResults;
}

function sourceEvidenceForRows(repoRoot, rows) {
  const sourcePaths = [...new Set(rows.flatMap((item) => item.sourceRoots))].sort();
  return sourcePaths.map((sourcePath) => ({
    sourcePath,
    exists: existsSync(path.join(repoRoot, sourcePath)),
    legacy: sourcePath.startsWith('_legacy/'),
  }));
}

export function buildV38PtrrFailsafeThricifiedStack(input = {}) {
  const generatedAt = typeof input.generatedAt === 'string' ? input.generatedAt : '2026-05-24T00:00:00.000Z';
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const rows = V38_PTRR_FAILSAFE_THRICIFIED_STACK_ROWS.map((item) => ({
    ...item,
    sourceRootsPresent: item.sourceRoots.every((sourcePath) => existsSync(path.join(repoRoot, sourcePath))),
  }));
  const gate2Inventory = buildV38InferenceSurfaceInventory({ generatedAt, repoRoot });
  const sourceIndex = buildSourceIndex(repoRoot);
  const sourcePredicateResults = buildPredicateResults(repoRoot, sourceIndex, gate2Inventory);
  const sourceEvidence = sourceEvidenceForRows(repoRoot, rows);
  const requiredPredicateIds = [...new Set(rows.flatMap((item) => item.requiredPredicateIds))].sort();
  const passedPredicateIds = sourcePredicateResults.filter((result) => result.passed).map((result) => result.id).sort();
  const failedPredicateIds = requiredPredicateIds.filter((predicateId) =>
    !sourcePredicateResults.some((result) => result.id === predicateId && result.passed),
  );
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.exists).map((entry) => entry.sourcePath);
  const legacySourceRoots = sourceEvidence.filter((entry) => entry.legacy).map((entry) => entry.sourcePath);
  const expectedProviderCallSlots = gate2Inventory.coverage.totalPtrrStepCount
    * V38_FAILSAFE_STAGE_IDS.length
    * V38_THRICIFIED_GENERATION_STAGE_IDS.length;
  const failures = [];

  if (!gate2Inventory.passed) failures.push('Gate 2 inference surface inventory is not passing.');
  if (failedPredicateIds.length) failures.push(`failed source predicates: ${failedPredicateIds.join(', ')}`);
  if (missingSourceRoots.length) failures.push(`missing source roots: ${missingSourceRoots.join(', ')}`);
  if (legacySourceRoots.length) failures.push(`legacy source roots present: ${legacySourceRoots.join(', ')}`);
  if (expectedProviderCallSlots !== gate2Inventory.coverage.totalProviderCallCount) {
    failures.push('Gate 3 provider-call slot law does not match Gate 2 inventory totals.');
  }

  const coverage = {
    rowCount: rows.length,
    ptrrStepIds: [...V38_PTRR_STEP_IDS],
    failsafeStageIds: [...V38_FAILSAFE_STAGE_IDS],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    requiredPredicateCount: requiredPredicateIds.length,
    passedPredicateCount: passedPredicateIds.length,
    failedPredicateIds,
    sourceRootCount: sourceEvidence.length,
    missingSourceRoots,
    legacySourceRoots: legacySourceRoots.length > 0,
    gate2InventoryRoot: gate2Inventory.artifactRoot,
    totalPtrrStepCount: gate2Inventory.coverage.totalPtrrStepCount,
    totalFailsafeSequenceCount: gate2Inventory.coverage.totalFailsafeSequenceCount,
    totalThricifiedGenerationCount: gate2Inventory.coverage.totalThricifiedGenerationCount,
    totalProviderCallCount: gate2Inventory.coverage.totalProviderCallCount,
    expectedProviderCallSlots,
    providerCallSlotsPerPtrrStep: V38_FAILSAFE_STAGE_IDS.length * V38_THRICIFIED_GENERATION_STAGE_IDS.length,
    toolsAreStepOwned: rows.every((item) => String(item.toolBoundary || '').length > 0),
    protectedSourceVisible: rows.some((item) => item.protectedSourceVisible === true),
    credentialsSerialized: rows.some((item) => item.credentialsSerialized === true),
    unpaidAssetPackSourceVisible: rows.some((item) => item.unpaidAssetPackSourceVisible === true),
    knownCarryForwardGapIds: [
      'gate4-completes-promptpart-and-prompt-benchmarks',
      'gate5-binds-source-safe-inference-telemetry-to-stream-contracts',
      'gate9-repairs-non-ptrr-quick-conversation-surfaces',
    ],
  };

  const artifactRoot = `v38-ptrr-failsafe-thricified-stack:${digest(
    JSON.stringify({
      rows: rows.map((item) => item.rowRoot),
      predicates: passedPredicateIds,
      totals: {
        totalPtrrStepCount: coverage.totalPtrrStepCount,
        totalThricifiedGenerationCount: coverage.totalThricifiedGenerationCount,
        totalProviderCallCount: coverage.totalProviderCallCount,
      },
    }),
  )}`;

  return {
    artifactId: 'v38-ptrr-failsafe-thricified-stack',
    schemaId: V38_PTRR_FAILSAFE_THRICIFIED_STACK_SCHEMA_ID,
    version: V38_PTRR_FAILSAFE_THRICIFIED_STACK_VERSION,
    currentTarget: V38_PTRR_FAILSAFE_THRICIFIED_STACK_CURRENT_TARGET,
    generatedAt,
    artifactPath: V38_PTRR_FAILSAFE_THRICIFIED_STACK_ARTIFACT_PATH,
    sourceSafetyVerdict: V38_PTRR_FAILSAFE_THRICIFIED_STACK_SOURCE_SAFETY_VERDICT,
    ptrrStepIds: [...V38_PTRR_STEP_IDS],
    failsafeStageIds: [...V38_FAILSAFE_STAGE_IDS],
    thricifiedGenerationStageIds: [...V38_THRICIFIED_GENERATION_STAGE_IDS],
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    rows,
    sourcePredicateResults,
    sourceEvidence,
    coverage,
    failures,
    passed:
      failures.length === 0
      && failedPredicateIds.length === 0
      && gate2Inventory.passed
      && coverage.totalProviderCallCount === coverage.expectedProviderCallSlots
      && coverage.toolsAreStepOwned
      && coverage.protectedSourceVisible === false
      && coverage.credentialsSerialized === false
      && coverage.unpaidAssetPackSourceVisible === false
      && coverage.legacySourceRoots === false,
    artifactRoot,
  };
}

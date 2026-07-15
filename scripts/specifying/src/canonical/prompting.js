// @ts-check

/**
 * @typedef {import('./type-contracts.js').EvaluatorMode} EvaluatorMode
 * @typedef {import('./type-contracts.js').EvaluatorKind} EvaluatorKind
 * @typedef {import('./type-contracts.js').MeasurementClass} MeasurementClass
 * @typedef {import('./type-contracts.js').PromptValueType} PromptValueType
 * @typedef {import('./type-contracts.js').PromptSchemaEntry} PromptSchemaEntry
 * @typedef {import('./type-contracts.js').PromptContextInput} PromptContextInput
 * @typedef {import('./type-contracts.js').PromptContractShape} PromptContractShape
 * @typedef {import('./type-contracts.js').BuiltPromptSurface} BuiltPromptSurface
 * @typedef {import('./type-contracts.js').ParsedCompletionEnvelope} ParsedCompletionEnvelope
 * @typedef {import('./type-contracts.js').EvaluatorSurfaceContract} EvaluatorSurfaceContract
 */

import crypto from 'node:crypto';
import { PROFILE_A } from '../realization-profile.js';
import {
  buildTheoremVerdict,
  buildArtifactBinding,
  buildReplayStep,
  allTheoremsPassed as aggregateTheoremVerdicts,
  computeProofClosure
} from './proof-annotations.js';

const DEFAULT_MODEL_ID = 'deterministic-local-evaluator.v15';
const DEFAULT_PROMPT_TEMPLATE_VERSION = 'spec-v15-prompt-contract.v1';

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(/** @type {Record<string, unknown>} */ (value)[key])}`).join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableHashObject(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {readonly unknown[]} [values=[]]
 * @returns {string[]}
 */
function summarizeStrings(values = []) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {string} template
 * @param {Record<string, unknown>} [values={}]
 * @returns {string}
 */
function interpolateTemplate(template, values = {}) {
  return String(template || '').replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
    const value = values[key];
    return Array.isArray(value) ? value.join(', ') : String(value ?? '');
  });
}

/**
 * @param {PromptValueType} type
 * @param {unknown} value
 * @returns {unknown}
 */
function normalizeCompletionValue(type, value) {
  if (type === 'string') {
    if (typeof value !== 'string') {
      throw new Error(`Bitcode parsed completion failed: expected string, received ${typeof value}.`);
    }
    return value;
  }

  if (type === 'string[]') {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
      throw new Error('Bitcode parsed completion failed: expected string[] payload.');
    }
    return summarizeStrings(value);
  }

  return value;
}

/**
 * @param {BuiltPromptSurface | null | undefined} promptSurface
 * @param {unknown} parsedPayload
 * @returns {Record<string, unknown>}
 */
function normalizeParsedPayload(promptSurface, parsedPayload) {
  const expectedSchema = promptSurface?.promptContract?.expectedOutputSchema || [];
  const requiredTopLevelKeys = expectedSchema.filter((entry) => entry.required !== false).map((entry) => entry.field);
  const actualPayload = parsedPayload && typeof parsedPayload === 'object' && !Array.isArray(parsedPayload)
    ? /** @type {Record<string, unknown>} */ (parsedPayload)
    : null;

  if (!actualPayload) {
    throw new Error('Bitcode parsed completion failed: payload must be a strict JSON object.');
  }

  const actualKeys = Object.keys(actualPayload).sort();
  const expectedKeys = expectedSchema.map((entry) => entry.field).sort();

  if (promptSurface?.promptContract?.requiresExactTopLevelKeys && canonicalJson(actualKeys) !== canonicalJson(expectedKeys)) {
    throw new Error(`Bitcode parsed completion failed: expected keys [${expectedKeys.join(', ')}], received [${actualKeys.join(', ')}].`);
  }

  for (const requiredField of requiredTopLevelKeys) {
    if (!(requiredField in actualPayload)) {
      throw new Error(`Bitcode parsed completion failed: missing required field ${requiredField}.`);
    }
  }

  return Object.fromEntries(expectedSchema.map((entry) => [
    entry.field,
    normalizeCompletionValue(entry.type, actualPayload[entry.field])
  ]));
}

/**
 * @param {{
 *   evaluatorId: string,
 *   evaluatorKind: EvaluatorKind,
 *   measurementClass: MeasurementClass,
 *   mode: EvaluatorMode,
 *   evidenceRefs?: readonly unknown[],
 *   modelId?: string,
 *   promptId?: string | null,
 *   toolId?: string | null,
 *   replayableTrace?: boolean,
 *   profile?: string,
 *   standIn?: boolean
 * }} input
 * @returns {EvaluatorSurfaceContract}
 */
export function buildEvaluatorSurface({
  evaluatorId,
  evaluatorKind,
  measurementClass,
  mode,
  evidenceRefs = [],
  modelId = DEFAULT_MODEL_ID,
  promptId = null,
  toolId = null,
  replayableTrace = true,
  profile = PROFILE_A,
  standIn = mode !== 'inferred'
}) {
  return {
    evaluatorId,
    evaluatorKind,
    measurementClass,
    mode,
    modelId,
    promptId,
    toolId,
    replayableTrace,
    profile,
    standIn,
    evidenceRefs: summarizeStrings(evidenceRefs)
  };
}

/**
 * @param {string} outputField
 * @param {readonly unknown[]} evidenceRefs
 * @param {string} promptOrEvaluatorId
 * @param {string} [modelId=DEFAULT_MODEL_ID]
 * @returns {{
 *   outputField: string,
 *   evidenceRefs: string[],
 *   promptOrEvaluatorId: string,
 *   modelId: string,
 *   evaluatorSurface: EvaluatorSurfaceContract,
 *   replayableTrace: boolean,
 *   admissible: boolean
 * }}
 */
export function buildInferenceProof(outputField, evidenceRefs, promptOrEvaluatorId, modelId = DEFAULT_MODEL_ID) {
  const standIn = modelId === DEFAULT_MODEL_ID;
  return {
    outputField,
    evidenceRefs: summarizeStrings(evidenceRefs),
    promptOrEvaluatorId,
    modelId,
    evaluatorSurface: buildEvaluatorSurface({
      evaluatorId: promptOrEvaluatorId,
      evaluatorKind: 'inferred-evaluator',
      measurementClass: 'inferred-measurement',
      mode: 'inferred',
      promptId: promptOrEvaluatorId,
      modelId,
      evidenceRefs,
      standIn
    }),
    replayableTrace: true,
    admissible: summarizeStrings(evidenceRefs).length > 0 && !!promptOrEvaluatorId && !!modelId
  };
}

/**
 * @param {string} template
 * @returns {string[]}
 */
export function extractPromptPlaceholders(template) {
  return summarizeStrings(
    [...String(template || '').matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)].map((match) => match[1])
  );
}

/**
 * @param {{
 *   promptId: string,
 *   templateVersion?: string,
 *   template: string,
 *   contextInputs?: PromptContextInput[],
 *   outputFields?: string[],
 *   outputSchema?: PromptSchemaEntry[],
 *   downstreamArtifacts?: readonly unknown[],
 *   nonRenderedContextFields?: readonly unknown[],
 *   evidenceRefs?: readonly unknown[]
 * }} input
 * @returns {PromptContractShape}
 */
export function buildPromptContract({
  promptId,
  templateVersion = DEFAULT_PROMPT_TEMPLATE_VERSION,
  template,
  contextInputs = [],
  outputFields = [],
  outputSchema = [],
  downstreamArtifacts = [],
  nonRenderedContextFields = [],
  evidenceRefs = []
}) {
  const placeholderSet = extractPromptPlaceholders(template);
  const declaredContextFields = summarizeStrings(contextInputs.map((input) => input.field));
  const explicitNonRendered = summarizeStrings(nonRenderedContextFields);
  const missingPlaceholderBindings = placeholderSet.filter((field) => !declaredContextFields.includes(field));
  const undeclaredNonRenderedContextFields = explicitNonRendered.filter((field) => !declaredContextFields.includes(field));
  const unusedContextFields = declaredContextFields.filter((field) => !placeholderSet.includes(field) && !explicitNonRendered.includes(field));
  const renderedContextFields = declaredContextFields.filter((field) => placeholderSet.includes(field));
  /** @type {PromptSchemaEntry[]} */
  const exactOutputSchema = outputSchema.length
    ? outputSchema.map((entry) => ({
        field: entry.field,
        type: entry.type,
        required: entry.required !== false
      }))
    : outputFields.map((field) => ({
        field,
        type: field === 'task' ? 'string' : 'string[]',
        required: true
      }));
  const contractPayload = {
    promptId,
    templateVersion,
    template,
    declaredContextFields,
    explicitNonRendered,
    exactOutputSchema,
    downstreamArtifacts
  };

  return {
    promptId,
    templateVersion,
    outputFields: exactOutputSchema.map((entry) => entry.field),
    templateHash: stableHashObject(template),
    contextSchemaHash: stableHashObject(declaredContextFields),
    outputSchemaHash: stableHashObject(exactOutputSchema),
    placeholderSet,
    declaredContextFields,
    nonRenderedContextFields: explicitNonRendered,
    renderedContextFields,
    unusedContextFields,
    missingPlaceholderBindings,
    undeclaredNonRenderedContextFields,
    evidenceRefDigest: stableHashObject(summarizeStrings(evidenceRefs)),
    downstreamArtifactBindings: summarizeStrings(downstreamArtifacts),
    expectedOutputSchema: exactOutputSchema,
    parseContractId: `parse_contract_${sha256(`${promptId}:${templateVersion}`).slice(0, 12)}`,
    parseMode: 'strict-json-object',
    requiresExactTopLevelKeys: true,
    allowsExtraneousText: false,
    onParseFailure: 'reject-and-emit-telemetry',
    onMissingRequiredField: 'fail-closed',
    completeness: {
      ok: missingPlaceholderBindings.length === 0
        && unusedContextFields.length === 0
        && undeclaredNonRenderedContextFields.length === 0,
      missingPlaceholderBindings,
      unusedContextFields,
      undeclaredNonRenderedContextFields
    },
    contractHash: stableHashObject(contractPayload)
  };
}

/**
 * @param {PromptContractShape} promptContract
 * @returns {void}
 */
export function assertPromptContractComplete(promptContract) {
  if (!promptContract.completeness.ok) {
    throw new Error(
      `Bitcode prompt completeness failed for ${promptContract.promptId}: ` +
      `missing placeholders [${promptContract.missingPlaceholderBindings.join(', ')}], ` +
      `unused context [${promptContract.unusedContextFields.join(', ')}], ` +
      `undeclared non-rendered [${promptContract.undeclaredNonRenderedContextFields.join(', ')}].`
    );
  }
}

/**
 * @param {PromptContractShape[]} [promptContracts=[]]
 * @param {{
 *   promptSurfaces?: BuiltPromptSurface[],
 *   parsedCompletionEnvelopeArtifact?: Record<string, unknown> | null,
 *   promptFamilyRegistry?: Record<string, unknown> | null,
 *   classifiedPromptOwnedFields?: readonly unknown[],
 *   explicitExclusions?: readonly unknown[],
 *   expectedDownstreamConsumersByField?: Record<string, string[]>
 * }} [options={}]
 */
export function buildPromptCompletenessProof(promptContracts = [], options = {}) {
  const {
    promptSurfaces = [],
    parsedCompletionEnvelopeArtifact = null,
    promptFamilyRegistry = null,
    classifiedPromptOwnedFields = [],
    explicitExclusions = [],
    expectedDownstreamConsumersByField = {}
  } = options;
  const classifiedFields = summarizeStrings(classifiedPromptOwnedFields);
  const excludedFields = summarizeStrings(explicitExclusions);
  const registryFields = summarizeStrings((/** @type {any} */ (promptFamilyRegistry))?.['registeredPromptOwnedFields'] || []);
  const registeredFields = registryFields.length
    ? registryFields
    : summarizeStrings(promptContracts.flatMap((contract) => contract.outputFields || []));
  const parsedEnvelopeByField = new Map(
    (/** @type {ParsedCompletionEnvelope[]} */ ((/** @type {any} */ (parsedCompletionEnvelopeArtifact))?.['envelopes'] || []))
      .flatMap((entry) => (entry.ownedOutputFields || []).map((field) => [field, entry]))
  );
  const promptSurfaceByField = new Map(
    promptSurfaces.flatMap((surface) => (surface.lineage?.outputFields || []).map((field) => [field, surface]))
  );
  const allFields = summarizeStrings([...classifiedFields, ...registeredFields, ...excludedFields]);
  const memberVerdicts = allFields.map((field) => {
    const contract = promptContracts.find((entry) => (entry.outputFields || []).includes(field)) || null;
    const surface = promptSurfaceByField.get(field) || null;
    const envelope = parsedEnvelopeByField.get(field) || null;
    const familyMember = Array.isArray((/** @type {any} */ (promptFamilyRegistry))?.['promptMembers'])
      ? (/** @type {any} */ (promptFamilyRegistry))['promptMembers'].find((entry) => entry?.memberId === field) || null
      : null;
    const expectedConsumers = summarizeStrings(expectedDownstreamConsumersByField[field] || []);
    const declaredConsumers = summarizeStrings(surface?.lineage?.downstreamArtifacts || []);
    const downstreamConsumersClosed = expectedConsumers.length === 0
      ? declaredConsumers.length > 0 || excludedFields.includes(field)
      : expectedConsumers.every((path) => declaredConsumers.includes(path));
    return {
      field,
      registered: registeredFields.includes(field),
      classified: classifiedFields.includes(field),
      inDeclaredFamilyRegistry: !!familyMember || registryFields.length === 0,
      explicitlyExcluded: excludedFields.includes(field),
      contractComplete: !!contract?.completeness?.ok,
      parsedEnvelopeAdmissible: !!envelope?.admissible,
      downstreamConsumersClosed,
      provenanceAnnotationsTruthful: !!surface,
      passed: excludedFields.includes(field)
        ? true
        : registeredFields.includes(field)
          && (!!familyMember || registryFields.length === 0)
          && classifiedFields.includes(field)
          && !!contract?.completeness?.ok
          && !!envelope?.admissible
          && downstreamConsumersClosed
          && !!surface
    };
  });
  const coverageTotalityClosed = classifiedFields.every((field) => registeredFields.includes(field) || excludedFields.includes(field));
  const noGhostCoverageClosed = registeredFields.every((field) => classifiedFields.includes(field) || excludedFields.includes(field));
  const explicitExclusionClosed = classifiedFields
    .filter((field) => !registeredFields.includes(field))
    .every((field) => excludedFields.includes(field));
  const contractsClosed = promptContracts.every((contract) => contract.completeness.ok);
  const parsedEnvelopesAdmissible = Boolean((/** @type {any} */ (parsedCompletionEnvelopeArtifact))?.['allContractsResolved']) && Boolean((/** @type {any} */ (parsedCompletionEnvelopeArtifact))?.['allPayloadsAdmissible']);
  const downstreamConsumersClosed = memberVerdicts
    .filter((entry) => !entry.explicitlyExcluded)
    .every((entry) => entry.downstreamConsumersClosed);
  const provenanceTruthClosed = memberVerdicts
    .filter((entry) => !entry.explicitlyExcluded)
    .every((entry) => entry.provenanceAnnotationsTruthful);
  const witnessArtifactPaths = summarizeStrings([
    promptFamilyRegistry ? '.bitcode/prompt-family-registry.json' : null,
    '.bitcode/prompt-contracts.json',
    '.bitcode/prompt-surfaces.json',
    '.bitcode/parsed-completion-envelopes.json',
    '.bitcode/prompt-completeness-proof.json'
  ]);
  const replayArtifacts = witnessArtifactPaths.slice();
  const replaySteps = [
    buildReplayStep({
      stepId: 'prompt-completeness.member-set-reconciliation',
      theoremIds: ['prompt_completeness.coverage_totality', 'prompt_completeness.no_ghost_coverage', 'prompt_completeness.explicit_exclusion_closure'],
      requiredArtifactPaths: summarizeStrings([promptFamilyRegistry ? '.bitcode/prompt-family-registry.json' : null, '.bitcode/prompt-contracts.json', '.bitcode/prompt-surfaces.json']),
      instruction: 'Reconcile classified, registered, and excluded prompt-owned fields.'
    }),
    buildReplayStep({
      stepId: 'prompt-completeness.parse-admissibility',
      theoremIds: ['prompt_completeness.contract_closure', 'prompt_completeness.parsed_envelope_admissibility'],
      requiredArtifactPaths: ['.bitcode/prompt-contracts.json', '.bitcode/parsed-completion-envelopes.json'],
      instruction: 'Recompute prompt contract completeness and parsed-envelope admissibility.'
    }),
    buildReplayStep({
      stepId: 'prompt-completeness.consumer-closure',
      theoremIds: ['prompt_completeness.downstream_consumer_closure'],
      requiredArtifactPaths: ['.bitcode/prompt-surfaces.json'],
      instruction: 'Compare declared downstream consumers to the expected semantic consumer graph.'
    }),
    buildReplayStep({
      stepId: 'prompt-completeness.provenance-truth',
      theoremIds: ['prompt_completeness.provenance_truth'],
      requiredArtifactPaths: ['.bitcode/prompt-surfaces.json', '.bitcode/prompt-contracts.json'],
      instruction: 'Verify prompt-owned outputs remain truthfully represented by their prompt surfaces and contracts.'
    })
  ];
  const artifactBindings = summarizeStrings([
    promptFamilyRegistry ? '.bitcode/prompt-family-registry.json' : null
  ]).map((artifactPath) => buildArtifactBinding({ artifactPath, role: 'registry', theoremIds: ['prompt_completeness.coverage_totality', 'prompt_completeness.no_ghost_coverage', 'prompt_completeness.explicit_exclusion_closure'], requiredForWitness: true, requiredForReplay: true }))
    .concat([
    buildArtifactBinding({ artifactPath: '.bitcode/prompt-contracts.json', role: 'contract', theoremIds: ['prompt_completeness.contract_closure'], requiredForWitness: true, requiredForReplay: true }),
    buildArtifactBinding({ artifactPath: '.bitcode/prompt-surfaces.json', role: 'primary-proof', theoremIds: ['prompt_completeness.coverage_totality', 'prompt_completeness.downstream_consumer_closure', 'prompt_completeness.provenance_truth'], requiredForWitness: true, requiredForReplay: true }),
    buildArtifactBinding({ artifactPath: '.bitcode/parsed-completion-envelopes.json', role: 'supporting-proof', theoremIds: ['prompt_completeness.parsed_envelope_admissibility'], requiredForWitness: true, requiredForReplay: true }),
    buildArtifactBinding({ artifactPath: '.bitcode/prompt-completeness-proof.json', role: 'primary-proof', theoremIds: ['prompt_completeness.witness_replay_closure'], requiredForWitness: true, requiredForReplay: true })
  ]);
  const theoremIds = [
    'prompt_completeness.coverage_totality',
    'prompt_completeness.no_ghost_coverage',
    'prompt_completeness.explicit_exclusion_closure',
    'prompt_completeness.contract_closure',
    'prompt_completeness.parsed_envelope_admissibility',
    'prompt_completeness.downstream_consumer_closure',
    'prompt_completeness.provenance_truth',
    'prompt_completeness.witness_replay_closure'
  ];
  const proofClosure = computeProofClosure({
    artifactBindings,
    witnessArtifactPaths,
    replayArtifactPaths: replayArtifacts,
    replaySteps,
    theoremIds,
    excludeTheoremIds: ['prompt_completeness.witness_replay_closure']
  });
  const theoremVerdicts = [
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.coverage_totality',
      passed: coverageTotalityClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['prompt-completeness.member-set-reconciliation'],
      failureReasons: coverageTotalityClosed ? [] : ['classified prompt-owned fields are missing prompt family coverage']
    }),
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.no_ghost_coverage',
      passed: noGhostCoverageClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['prompt-completeness.member-set-reconciliation'],
      failureReasons: noGhostCoverageClosed ? [] : ['registered prompt members are not all classified or explicitly excluded']
    }),
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.explicit_exclusion_closure',
      passed: explicitExclusionClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['prompt-completeness.member-set-reconciliation'],
      failureReasons: explicitExclusionClosed ? [] : ['a classified prompt-owned field is omitted without explicit exclusion']
    }),
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.contract_closure',
      passed: contractsClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['prompt-completeness.parse-admissibility'],
      failureReasons: contractsClosed ? [] : ['one or more prompt contracts are incomplete']
    }),
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.parsed_envelope_admissibility',
      passed: parsedEnvelopesAdmissible,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['prompt-completeness.parse-admissibility'],
      failureReasons: parsedEnvelopesAdmissible ? [] : ['parsed completion envelopes are unresolved or inadmissible']
    }),
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.downstream_consumer_closure',
      passed: downstreamConsumersClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['prompt-completeness.consumer-closure'],
      failureReasons: downstreamConsumersClosed ? [] : ['declared prompt downstream consumers are incomplete or inaccurate']
    }),
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.provenance_truth',
      passed: provenanceTruthClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: ['prompt-completeness.provenance-truth'],
      failureReasons: provenanceTruthClosed ? [] : ['prompt-owned fields are not all truthfully represented by prompt surfaces']
    }),
    buildTheoremVerdict({
      theoremId: 'prompt_completeness.witness_replay_closure',
      passed: proofClosure.allClosed,
      witnessArtifactPaths,
      replayArtifactPaths: replayArtifacts,
      replayStepIds: replaySteps.map((entry) => entry.stepId),
      failureReasons: proofClosure.allClosed ? [] : ['prompt-completeness witness/replay closure is incomplete']
    })
  ];
  return {
    conformanceProfile: PROFILE_A,
    checkedPromptCount: promptContracts.length,
    allContractsComplete: promptContracts.every((contract) => contract.completeness.ok),
    promptFamilyRegistry,
    classifiedPromptOwnedFields: classifiedFields,
    registeredPromptOwnedFields: registeredFields,
    explicitExclusions: excludedFields,
    promptChecks: promptContracts.map((contract) => ({
      promptId: contract.promptId,
      templateHash: contract.templateHash,
      contextSchemaHash: contract.contextSchemaHash,
      outputSchemaHash: contract.outputSchemaHash,
      placeholderCount: contract.placeholderSet.length,
      renderedContextFields: contract.renderedContextFields,
      nonRenderedContextFields: contract.nonRenderedContextFields,
      missingPlaceholderBindings: contract.missingPlaceholderBindings,
      unusedContextFields: contract.unusedContextFields,
      completenessOk: contract.completeness.ok
    })),
    memberVerdicts,
    coverageTotalityClosed,
    parseClosureClosed: contractsClosed && parsedEnvelopesAdmissible,
    downstreamConsumerClosureClosed: downstreamConsumersClosed,
    provenanceTruthClosed,
    witnessClosureClosed: proofClosure.witnessBindingsClosed,
    replayClosureClosed: proofClosure.replayBindingsClosed && proofClosure.replayStepArtifactCoverageClosed && proofClosure.theoremReplayCoverageClosed,
    testClosureClosed: true,
    theoremVerdicts,
    artifactBindings,
    replaySteps,
    witnessArtifactPaths,
    replayArtifacts,
    replayInstructions: replaySteps.map((entry) => entry.instruction),
    proofHash: stableHashObject({
      promptContracts: promptContracts.map((contract) => ({
        promptId: contract.promptId,
        contractHash: contract.contractHash,
        completeness: contract.completeness
      })),
      promptFamilyRegistryHash: (/** @type {any} */ (promptFamilyRegistry))?.['registryHash'] || null
    }),
    allTheoremsPassed: aggregateTheoremVerdicts(theoremVerdicts)
  };
}

/**
 * @param {{
 *   promptId: string,
 *   purpose: string,
 *   template: string,
 *   values: Record<string, unknown>,
 *   contextInputs?: PromptContextInput[],
 *   outputFields?: string[],
 *   downstreamArtifacts?: readonly unknown[],
 *   evaluatorKind?: EvaluatorKind,
 *   modelId?: string,
 *   standIn?: boolean,
 *   nonRenderedContextFields?: readonly unknown[],
 *   templateVersion?: string
 * }} input
 * @returns {BuiltPromptSurface}
 */
export function buildPromptSurface({
  promptId,
  purpose,
  template,
  values,
  contextInputs = [],
  outputFields = [],
  downstreamArtifacts = [],
  evaluatorKind = 'inferred-evaluator',
  modelId = DEFAULT_MODEL_ID,
  standIn = true,
  nonRenderedContextFields = [],
  templateVersion = DEFAULT_PROMPT_TEMPLATE_VERSION
}) {
  const evidenceRefs = summarizeStrings(contextInputs.flatMap((input) => input.evidenceRefs || []));
  const normalizedDownstreamArtifacts = summarizeStrings(downstreamArtifacts);
  /** @type {PromptSchemaEntry[]} */
  const outputSchema = outputFields.map((field) => ({
    field,
    type: field === 'task' ? 'string' : 'string[]',
    required: true
  }));
  const promptContract = buildPromptContract({
    promptId,
    templateVersion,
    template,
    contextInputs,
    outputFields,
    outputSchema,
    downstreamArtifacts,
    nonRenderedContextFields,
    evidenceRefs
  });

  assertPromptContractComplete(promptContract);

  return {
    promptId,
    purpose,
    templateVersion,
    template,
    interpolatedPrompt: interpolateTemplate(template, values),
    interpolatedValues: values,
    contextInputs: contextInputs.map((input, index) => ({
      order: index + 1,
      field: input.field,
      value: input.value,
      source: input.source,
      evidenceRefs: summarizeStrings(input.evidenceRefs || []),
      artifactBindings: summarizeStrings(input.artifactBindings || []),
      notes: input.notes || null
    })),
    lineage: {
      derivedFrom: contextInputs.map((input) => input.field),
      evidenceRefs,
      outputFields,
      downstreamArtifacts: normalizedDownstreamArtifacts
    },
    promptContract,
    parsableCompletionContract: {
      contractId: promptContract.parseContractId,
      evaluatorId: promptId,
      payloadType: outputSchema.length === 1 ? (outputSchema[0]?.type || 'object') : 'object',
      schemaHash: promptContract.outputSchemaHash,
      ownedOutputFields: outputFields,
      requiredTopLevelKeys: outputSchema.filter((entry) => entry.required).map((entry) => entry.field),
      parseMode: promptContract.parseMode,
      requiresExactTopLevelKeys: promptContract.requiresExactTopLevelKeys,
      allowsExtraneousText: promptContract.allowsExtraneousText,
      downstreamArtifacts: normalizedDownstreamArtifacts,
      onParseFailure: promptContract.onParseFailure,
      onMissingRequiredField: promptContract.onMissingRequiredField
    },
    evaluatorSurface: buildEvaluatorSurface({
      evaluatorId: promptId,
      evaluatorKind,
      measurementClass: 'inferred-measurement',
      mode: 'inferred',
      promptId,
      modelId,
      evidenceRefs,
      standIn,
      profile: PROFILE_A
    })
  };
}

/**
 * @param {{
 *   promptSurface: BuiltPromptSurface,
 *   parsedPayload: unknown,
 *   parsedAt?: string,
 *   executionMode?: string,
 *   evidenceRefs?: readonly unknown[]
 * }} input
 * @returns {ParsedCompletionEnvelope}
 */
export function buildParsedCompletionEnvelope({
  promptSurface,
  parsedPayload,
  parsedAt = nowIso(),
  executionMode = 'deterministic-stand-in',
  evidenceRefs = []
}) {
  const normalizedParsedPayload = normalizeParsedPayload(promptSurface, parsedPayload);
  const normalizedEvidenceRefs = summarizeStrings([
    ...(promptSurface?.lineage?.evidenceRefs || []),
    ...evidenceRefs
  ]);
  const promptId = promptSurface?.promptId || 'unknown-prompt';
  const parseContractId = promptSurface?.promptContract?.parseContractId || 'unknown-parse-contract';
  const envelopeCore = {
    promptId,
    parseContractId,
    normalizedParsedPayload,
    normalizedEvidenceRefs,
    executionMode
  };

  return {
    envelopeId: `parsed_completion_${sha256(canonicalJson(envelopeCore)).slice(0, 12)}`,
    promptId,
    parseContractId,
    contractHash: promptSurface?.promptContract?.contractHash || null,
    promptTemplateVersion: promptSurface?.templateVersion || DEFAULT_PROMPT_TEMPLATE_VERSION,
    parsedAt,
    executionMode,
    standIn: executionMode !== 'live-external',
    parseOutcome: 'accepted-strict-json-object',
    ownedOutputFields: promptSurface?.parsableCompletionContract?.ownedOutputFields || [],
    requiredTopLevelKeys: promptSurface?.parsableCompletionContract?.requiredTopLevelKeys || [],
    normalizedParsedPayload,
    evidenceRefs: normalizedEvidenceRefs,
    downstreamArtifacts: promptSurface?.lineage?.downstreamArtifacts || [],
    evaluatorSurface: promptSurface?.evaluatorSurface || null,
    payloadHash: stableHashObject(normalizedParsedPayload),
    envelopeHash: stableHashObject({
      promptId,
      parseContractId,
      normalizedParsedPayload,
      normalizedEvidenceRefs,
      executionMode
    }),
    admissible: true
  };
}

/**
 * @param {ParsedCompletionEnvelope[]} [parsedCompletionEnvelopes=[]]
 */
export function buildParsedCompletionEnvelopeArtifact(parsedCompletionEnvelopes = []) {
  return {
    conformanceProfile: PROFILE_A,
    envelopeCount: parsedCompletionEnvelopes.length,
    promptIds: summarizeStrings(parsedCompletionEnvelopes.map((entry) => entry.promptId)),
    allContractsResolved: parsedCompletionEnvelopes.every((entry) => !!entry.parseContractId && !!entry.contractHash),
    allPayloadsAdmissible: parsedCompletionEnvelopes.every((entry) => entry.admissible === true),
    executionModes: summarizeStrings(parsedCompletionEnvelopes.map((entry) => entry.executionMode)),
    envelopes: parsedCompletionEnvelopes,
    artifactHash: stableHashObject(parsedCompletionEnvelopes.map((entry) => ({
      envelopeId: entry.envelopeId,
      promptId: entry.promptId,
      payloadHash: entry.payloadHash,
      envelopeHash: entry.envelopeHash
    })))
  };
}

// @ts-check

import crypto from 'node:crypto';
import {
  buildInitialState,
  makeCandidateAsset,
  publicState,
  runMakeBitcodeBranch
} from '../bitcode-demo.js';

export const V18_PROOF_MEMBER_MATRIX_ID = 'v18-proof-member-semantic-matrix';
export const V18_THEOREM_EVIDENCE_MATRIX_ID = 'v18-theorem-evidence-matrix';
export const V18_STATE_MACHINE_MATRIX_ID = 'v18-state-machine-matrix';
export const V18_PROJECTION_PRINCIPALS = ['internal', 'reviewer', 'buyer', 'public'];
export const V18_BRANCH_MODES = ['patch', 'context'];

const NON_DIGESTED_RECURSIVE_ARTIFACT_PATHS = new Set([
  '.bitcode/system-proof-bundle.json',
  '.bitcode/proof-witness-manifest.json'
]);

const MEMBER_TRUE_FIELDS_BY_FAMILY = {
  'inference-synthesis': [
    'fieldProofPresent',
    'momentContractPresent',
    'promptSurfacePresent',
    'parsedEnvelopePresent',
    'evaluatorStatusTruthful',
    'evidenceBasisClosed'
  ],
  'prompt-completeness': [
    'registered',
    'classified',
    'inDeclaredFamilyRegistry',
    'contractComplete',
    'parsedEnvelopeAdmissible',
    'downstreamConsumersClosed',
    'provenanceAnnotationsTruthful'
  ]
};

const STAGED_MEMBER_FAMILIES = new Set(['static-code-analysis', 'verification-decisions']);

/**
 * @param {readonly unknown[]} [values=[]]
 * @returns {string[]}
 */
function summarizeStrings(values = []) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableHashObject(value) {
  return `sha256:${crypto.createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

/**
 * @param {any} run
 * @returns {Map<string, string>}
 */
function buildDigestByPath(run) {
  return new Map((run.artifactDigestEntries || []).map((/** @type {any} */ entry) => [String(entry.path || ''), String(entry.digest || '')]));
}

/**
 * @param {Map<string, string>} digestByPath
 * @param {string[]} paths
 * @returns {Array<{ path: string, digest: string }>}
 */
function buildDigestRefs(digestByPath, paths) {
  return paths
    .map((path) => ({ path, digest: digestByPath.get(path) || '' }))
    .filter((entry) => entry.digest);
}

/**
 * @param {Map<string, string>} digestByPath
 * @param {string[]} paths
 * @returns {string[]}
 */
function findMissingDigestPaths(digestByPath, paths) {
  return paths.filter((path) => !digestByPath.has(path) && !NON_DIGESTED_RECURSIVE_ARTIFACT_PATHS.has(path));
}

/**
 * @param {string[]} reasons
 * @param {boolean} condition
 * @param {string} reason
 */
function requireCondition(reasons, condition, reason) {
  if (!condition) reasons.push(reason);
}

/**
 * @param {any} matrix
 * @returns {any}
 */
export function summarizeV18Matrix(matrix) {
  const groupCounts = Object.fromEntries(
    summarizeStrings((matrix.cells || []).map((/** @type {any} */ cell) => cell.matrixGroup)).map((group) => [
      group,
      (matrix.cells || []).filter((/** @type {any} */ cell) => cell.matrixGroup === group).length
    ])
  );
  return {
    matrixId: matrix.matrixId,
    sourceRunCount: matrix.sourceRunCount,
    cellCount: matrix.cellCount,
    passedCellCount: matrix.passedCellCount,
    failedCellCount: matrix.failedCells.length,
    acceptedExclusionCount: matrix.acceptedExclusions.length,
    groupCounts
  };
}

/**
 * @param {any} data
 * @param {{ version?: string, generatedAt?: string }} [input={}]
 * @returns {any}
 */
export function buildV18ProofMemberSemanticMatrix(data, {
  version = 'V18',
  generatedAt = new Date().toISOString()
} = {}) {
  /** @type {any[]} */
  const cells = [];
  for (const run of data.runDetails || []) {
    const digestByPath = buildDigestByPath(run);
    for (const family of run.families || []) {
      for (const member of family.memberVerdicts || []) {
        const payload = member.payload || {};
        const evidencePaths = summarizeStrings([
          family.proofArtifactPath,
          ...(family.witnessArtifactPaths || []),
          ...(family.replayArtifacts || [])
        ]);
        /** @type {string[]} */
        const reasons = [];
        requireCondition(reasons, member.passed === true, 'member verdict did not pass');
        requireCondition(reasons, (family.memberIds || []).includes(member.id), 'member id is not declared in the family catalog');
        requireCondition(reasons, !!family.proofArtifactPath, 'family proof artifact path is missing');
        requireCondition(reasons, evidencePaths.length > 0, 'member has no evidence paths');

        const requiredTrueFieldsByFamily = /** @type {Record<string, string[]>} */ (MEMBER_TRUE_FIELDS_BY_FAMILY);
        for (const field of requiredTrueFieldsByFamily[String(family.proofFamily || '')] || []) {
          requireCondition(reasons, payload[field] === true, `required semantic field ${field} was not true`);
        }
        if (family.proofFamily === 'prompt-completeness') {
          requireCondition(reasons, payload.explicitlyExcluded === false, 'prompt member was explicitly excluded');
          requireCondition(reasons, payload.field === member.id, 'prompt member field does not match member id');
        }
        if (family.proofFamily === 'inference-synthesis') {
          requireCondition(reasons, payload.field === member.id, 'inference member field does not match member id');
        }
        if (STAGED_MEMBER_FAMILIES.has(family.proofFamily)) {
          requireCondition(reasons, Array.isArray(payload.stageIds) && payload.stageIds.length > 0, 'staged member does not declare stage ids');
        }
        const missingDigestPaths = findMissingDigestPaths(digestByPath, evidencePaths);
        requireCondition(reasons, missingDigestPaths.length === 0, `missing evidence digests: ${missingDigestPaths.join(', ')}`);

        cells.push({
          scenarioId: run.scenarioId,
          branchMode: run.branchMode,
          proofFamily: family.proofFamily,
          memberId: member.id,
          proofArtifactPath: family.proofArtifactPath,
          witnessArtifactPaths: family.witnessArtifactPaths,
          replayArtifactPaths: family.replayArtifacts,
          predicateId: `${family.proofFamily}.member.${member.id}.semantic-payload`,
          semanticFields: Object.keys(payload).sort(),
          evidencePaths,
          evidenceDigestRefs: buildDigestRefs(digestByPath, evidencePaths),
          passed: reasons.length === 0,
          failureReason: reasons.join('; ')
        });
      }
    }
  }

  const failedCells = cells.filter((cell) => !cell.passed).map((cell) => ({ ...cell, matrixId: V18_PROOF_MEMBER_MATRIX_ID }));
  return {
    matrixId: V18_PROOF_MEMBER_MATRIX_ID,
    version,
    generatedAt,
    sourceRunCount: (data.runDetails || []).length,
    cellCount: cells.length,
    passedCellCount: cells.length - failedCells.length,
    failedCells,
    acceptedExclusions: [],
    cells
  };
}

/**
 * @param {any} data
 * @param {{ version?: string, generatedAt?: string }} [input={}]
 * @returns {any}
 */
export function buildV18TheoremEvidenceMatrix(data, {
  version = 'V18',
  generatedAt = new Date().toISOString()
} = {}) {
  /** @type {any[]} */
  const cells = [];
  for (const run of data.runDetails || []) {
    const digestByPath = buildDigestByPath(run);
    const requiredArtifactPathSet = new Set(run.requiredArtifactPaths || []);
    for (const family of run.families || []) {
      const replayStepById = new Map((family.replaySteps || []).map((/** @type {any} */ step) => [String(step.stepId || ''), step]));
      for (const theorem of family.theoremVerdicts || []) {
        const replaySteps = (theorem.replayStepIds || []).map((/** @type {string} */ stepId) => replayStepById.get(stepId)).filter(Boolean);
        const replayRequiredArtifactPaths = summarizeStrings(replaySteps.flatMap((/** @type {any} */ step) => step.requiredArtifactPaths || []));
        const evidencePaths = summarizeStrings([
          ...(theorem.witnessArtifactPaths || []),
          ...(theorem.replayArtifactPaths || []),
          ...replayRequiredArtifactPaths
        ]);
        /** @type {string[]} */
        const reasons = [];
        requireCondition(reasons, theorem.passed === true, 'theorem verdict did not pass');
        requireCondition(reasons, (family.theoremIds || []).includes(theorem.theoremId), 'theorem id is not declared in the family catalog');
        requireCondition(reasons, (theorem.replayStepIds || []).length > 0, 'theorem declares no replay steps');
        requireCondition(reasons, replaySteps.length === (theorem.replayStepIds || []).length, 'one or more theorem replay steps are missing from the family catalog');
        requireCondition(reasons, (theorem.witnessArtifactPaths || []).length > 0, 'theorem declares no witness artifacts');
        requireCondition(reasons, (theorem.replayArtifactPaths || []).length > 0, 'theorem declares no replay artifacts');
        const missingRequiredPaths = replayRequiredArtifactPaths.filter((artifactPath) => !requiredArtifactPathSet.has(artifactPath));
        requireCondition(reasons, missingRequiredPaths.length === 0, `replay-required artifacts are not verifier-required: ${missingRequiredPaths.join(', ')}`);
        const missingDigestPaths = findMissingDigestPaths(digestByPath, evidencePaths);
        requireCondition(reasons, missingDigestPaths.length === 0, `missing evidence digests: ${missingDigestPaths.join(', ')}`);

        cells.push({
          scenarioId: run.scenarioId,
          branchMode: run.branchMode,
          proofFamily: family.proofFamily,
          theoremId: theorem.theoremId,
          replayStepIds: theorem.replayStepIds,
          witnessArtifactPaths: theorem.witnessArtifactPaths,
          replayArtifactPaths: theorem.replayArtifactPaths,
          requiredArtifactPaths: replayRequiredArtifactPaths,
          evidencePredicateId: `${family.proofFamily}.theorem.${theorem.theoremId}.evidence-binding`,
          evidencePaths,
          evidenceDigestRefs: buildDigestRefs(digestByPath, evidencePaths),
          passed: reasons.length === 0,
          failureReason: reasons.join('; ')
        });
      }
    }
  }

  const failedCells = cells.filter((cell) => !cell.passed).map((cell) => ({ ...cell, matrixId: V18_THEOREM_EVIDENCE_MATRIX_ID }));
  return {
    matrixId: V18_THEOREM_EVIDENCE_MATRIX_ID,
    version,
    generatedAt,
    sourceRunCount: (data.runDetails || []).length,
    cellCount: cells.length,
    passedCellCount: cells.length - failedCells.length,
    failedCells,
    acceptedExclusions: [],
    cells
  };
}

/**
 * @param {any} latestRun
 * @returns {boolean}
 */
function latestRunProofClosed(latestRun) {
  return latestRun?.proofContract?.allTheoremsPassed === true
    && (latestRun?.systemProofBundle?.proofFamilies || []).length === 9
    && (latestRun?.systemProofBundle?.proofFamilies || []).every((/** @type {any} */ family) => family.allTheoremsPassed === true);
}

/**
 * @param {string[]} reasons
 * @param {() => boolean} assertion
 * @param {string} reason
 */
function captureInvariant(reasons, assertion, reason) {
  try {
    requireCondition(reasons, assertion(), reason);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    reasons.push(`${reason}: ${detail}`);
  }
}

/**
 * @param {any} baseState
 * @param {string} scenarioId
 * @returns {{ state: any, repoAssetId: string, rawAssetId: string }}
 */
function buildMixedDepositState(baseState, scenarioId) {
  const scenario = baseState.readScenarios.find((/** @type {any} */ entry) => entry.scenarioId === scenarioId);
  const session = baseState.githubAppSessions.find((/** @type {any} */ entry) => entry.repo === scenario?.repo) || baseState.githubAppSessions[0];
  const inventoryEntries = baseState.repoArtifactInventory
    .filter((/** @type {any} */ entry) => entry.repo === session?.repo)
    .slice(0, 2);
  const scenarioText = summarizeStrings([
    scenario?.scenarioId,
    scenario?.scenarioFamily,
    scenario?.repo,
    ...(scenario?.expectedTargetArtifactKinds || []),
    ...(scenario?.canonicalRunEvidence?.extractedOutputs?.failingCases || []),
    ...(scenario?.canonicalRunEvidence?.extractedOutputs?.weakDimensions || []),
    ...(scenario?.repoContext?.stackHints || []),
    'remediation',
    'validation',
    'proof',
    'branch',
    'workflow'
  ]).join('\n');
  const repoAsset = makeCandidateAsset({
    title: `V18 repo-backed ${scenarioId}`,
    author: 'V18 Matrix',
    artifactKind: 'patch',
    artifactType: 'code/patch',
    sourceRepo: session?.repo || scenario?.repo || 'frontier/demo-auth',
    authSession: session,
    inventoryEntries,
    contentDerivedFromSelection: inventoryEntries.length > 0,
    content: scenarioText,
    operatorNote: 'V18 mixed-deposit matrix repo-backed asset.'
  });
  const rawAsset = makeCandidateAsset({
    title: `V18 raw ${scenarioId}`,
    author: 'V18 Matrix',
    artifactKind: 'patch',
    artifactType: 'code/patch',
    sourceRepo: scenario?.repo || session?.repo || 'frontier/demo-auth',
    content: `${scenarioText}\nraw local supplement remediation validation proof branch workflow`,
    operatorNote: 'V18 mixed-deposit matrix raw asset.'
  });
  return {
    state: {
      ...baseState,
      assets: [repoAsset, rawAsset, ...baseState.assets],
      ledger: {
        ...baseState.ledger,
        accounts: {
          ...baseState.ledger.accounts,
          [`supplier:${repoAsset.assetId}:pending_claims`]: '0',
          [`supplier:${rawAsset.assetId}:pending_claims`]: '0'
        }
      }
    },
    repoAssetId: repoAsset.assetId,
    rawAssetId: rawAsset.assetId
  };
}

/**
 * @param {any} cell
 * @param {string[]} reasons
 * @returns {any}
 */
function finalizeStateCell(cell, reasons) {
  return {
    ...cell,
    passed: reasons.length === 0,
    failureReason: reasons.join('; ')
  };
}

/**
 * @param {{
 *   version?: string,
 *   generatedAt?: string,
 *   scenarioIds?: string[],
 *   branchModes?: string[],
 *   principals?: string[],
 *   buildInitialStateFn?: typeof buildInitialState,
 *   runMakeBitcodeBranchFn?: typeof runMakeBitcodeBranch,
 *   publicStateFn?: typeof publicState
 * }} [input={}]
 * @returns {any}
 */
export function buildV18StateMachineMatrix({
  version = 'V18',
  generatedAt = new Date().toISOString(),
  scenarioIds,
  branchModes = V18_BRANCH_MODES,
  principals = V18_PROJECTION_PRINCIPALS,
  buildInitialStateFn = buildInitialState,
  runMakeBitcodeBranchFn = runMakeBitcodeBranch,
  publicStateFn = publicState
} = {}) {
  const seededState = buildInitialStateFn();
  const availableScenarioIds = seededState.readScenarios.map((/** @type {any} */ scenario) => String(scenario.scenarioId));
  const selectedScenarioIds = scenarioIds?.length ? scenarioIds : availableScenarioIds;
  /** @type {any[]} */
  const cells = [];

  for (const previousScenarioId of selectedScenarioIds) {
    for (const nextScenarioId of selectedScenarioIds) {
      /** @type {string[]} */
      const reasons = [];
      const initialState = buildInitialStateFn();
      const first = runMakeBitcodeBranchFn(initialState, { scenarioId: previousScenarioId, branchMode: 'patch' });
      const second = runMakeBitcodeBranchFn(first.nextState, { scenarioId: nextScenarioId, branchMode: 'patch' });
      captureInvariant(reasons, () => second.nextState.runHistory.length === 2, 'run history did not retain two ordered entries');
      captureInvariant(reasons, () => second.nextState.runHistory[0]?.scenarioId === previousScenarioId, 'first run-history entry changed');
      captureInvariant(reasons, () => second.nextState.runHistory[1]?.scenarioId === nextScenarioId, 'second run-history entry changed');
      captureInvariant(reasons, () => second.latestRun.scenarioId === nextScenarioId, 'latest run did not reflect the second scenario');
      captureInvariant(reasons, () => latestRunProofClosed(second.latestRun), 'second run proof closure failed');
      cells.push(finalizeStateCell({
        matrixGroup: 'repeated-run',
        previousScenarioId,
        scenarioId: nextScenarioId,
        branchMode: 'patch',
        actionSequence: ['make-bitcode-branch:first', 'make-bitcode-branch:second'],
        expectedTerminalState: 'two-run-history-latest-second',
        predicateId: 'state-machine.repeated-run.latest-run-history-proof-coherence',
        terminalInvariants: {
          runHistoryLength: second.nextState.runHistory.length,
          latestScenarioId: second.latestRun.scenarioId,
          allFamiliesPassed: second.latestRun.systemProofBundle.proofFamilies.every((/** @type {any} */ family) => family.allTheoremsPassed === true)
        }
      }, reasons));
    }
  }

  for (const scenarioId of selectedScenarioIds) {
    /** @type {string[]} */
    const reasons = [];
    const initialState = buildInitialStateFn();
    const first = runMakeBitcodeBranchFn(initialState, { scenarioId, branchMode: 'patch' });
    const resetState = buildInitialStateFn();
    const afterReset = runMakeBitcodeBranchFn(resetState, { scenarioId, branchMode: 'patch' });
    captureInvariant(reasons, () => first.nextState.runHistory.length === 1, 'pre-reset run did not create history');
    captureInvariant(reasons, () => !resetState.latestRun, 'reset state retained latestRun');
    captureInvariant(reasons, () => resetState.runHistory.length === 0, 'reset state retained run history');
    captureInvariant(reasons, () => afterReset.nextState.runHistory.length === 1, 'reset state was not branchable');
    captureInvariant(reasons, () => latestRunProofClosed(afterReset.latestRun), 'post-reset proof closure failed');
    cells.push(finalizeStateCell({
      matrixGroup: 'reset-after-run',
      scenarioId,
      branchMode: 'patch',
      actionSequence: ['make-bitcode-branch', 'reset', 'make-bitcode-branch'],
      expectedTerminalState: 'seeded-state-restored-and-branchable',
      predicateId: 'state-machine.reset-after-run.seeded-state-restoration',
      terminalInvariants: {
        resetRunHistoryLength: resetState.runHistory.length,
        postResetRunHistoryLength: afterReset.nextState.runHistory.length,
        latestScenarioId: afterReset.latestRun.scenarioId
      }
    }, reasons));
  }

  for (const scenarioId of selectedScenarioIds) {
    for (const branchMode of branchModes) {
      for (const principal of principals) {
        /** @type {string[]} */
        const reasons = [];
        const mixed = buildMixedDepositState(buildInitialStateFn(), scenarioId);
        const run = runMakeBitcodeBranchFn(mixed.state, { scenarioId, branchMode });
        const projected = publicStateFn(run.nextState, principal);
        const evaluatedIds = new Set((run.latestRun.evaluatedCandidates || []).map((/** @type {any} */ entry) => entry.assetId));
        captureInvariant(reasons, () => run.latestRun.scenarioId === scenarioId, 'mixed-deposit run scenario drifted');
        captureInvariant(reasons, () => run.latestRun.branchMode === branchMode, 'mixed-deposit run branch mode drifted');
        captureInvariant(reasons, () => projected.latestRun?.projectionPrincipal === principal, 'mixed-deposit projected principal drifted');
        captureInvariant(reasons, () => evaluatedIds.has(mixed.repoAssetId), 'repo-backed deposit was not evaluated');
        captureInvariant(reasons, () => evaluatedIds.has(mixed.rawAssetId), 'raw deposit was not evaluated');
        captureInvariant(reasons, () => run.latestRun.assetPack.selectedAssets.length > 0, 'mixed-deposit run selected no assets');
        captureInvariant(reasons, () => latestRunProofClosed(run.latestRun), 'mixed-deposit proof closure failed');
        cells.push(finalizeStateCell({
          matrixGroup: 'mixed-deposit',
          scenarioId,
          branchMode,
          principal,
          actionSequence: ['deposit:repo-backed', 'deposit:raw', 'make-bitcode-branch', 'project-state'],
          expectedTerminalState: 'mixed-deposits-evaluated-and-branch-realized',
          predicateId: 'state-machine.mixed-deposit.evaluation-projection-proof-coherence',
          terminalInvariants: {
            repoAssetId: mixed.repoAssetId,
            rawAssetId: mixed.rawAssetId,
            projectionPrincipal: projected.latestRun?.projectionPrincipal,
            selectedAssetCount: run.latestRun.assetPack.selectedAssets.length,
            runHistoryLength: run.nextState.runHistory.length
          }
        }, reasons));
      }
    }
  }

  for (const scenarioId of selectedScenarioIds) {
    for (const branchMode of branchModes) {
      for (const principal of principals) {
        /** @type {string[]} */
        const reasons = [];
        const emptyState = { ...buildInitialStateFn(), assets: [] };
        let errorMessage = '';
        try {
          runMakeBitcodeBranchFn(emptyState, { scenarioId, branchMode });
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : String(error);
        }
        const projected = publicStateFn(emptyState, principal);
        captureInvariant(reasons, () => /No candidates survived into the asset pack/i.test(errorMessage), 'no-survivor did not fail with the expected conflict');
        captureInvariant(reasons, () => emptyState.runHistory.length === 0, 'no-survivor failure mutated run history');
        captureInvariant(reasons, () => !emptyState.latestRun, 'no-survivor failure created latestRun');
        captureInvariant(reasons, () => projected.latestRun == null, 'no-survivor projected state exposed a latest run');
        cells.push(finalizeStateCell({
          matrixGroup: 'no-survivor',
          scenarioId,
          branchMode,
          principal,
          actionSequence: ['empty-assets', 'make-bitcode-branch', 'project-state'],
          expectedTerminalState: 'request-caused-conflict-with-state-preserved',
          predicateId: 'state-machine.no-survivor.conflict-state-preservation',
          terminalInvariants: {
            errorMessage,
            projectedPrincipal: principal,
            runHistoryLength: emptyState.runHistory.length,
            latestRunPresent: Boolean(emptyState.latestRun)
          }
        }, reasons));
      }
    }
  }

  const failedCells = cells.filter((cell) => !cell.passed).map((cell) => ({ ...cell, matrixId: V18_STATE_MACHINE_MATRIX_ID }));
  return {
    matrixId: V18_STATE_MACHINE_MATRIX_ID,
    version,
    generatedAt,
    sourceRunCount: selectedScenarioIds.length * branchModes.length,
    matrixGroups: summarizeStrings(cells.map((cell) => cell.matrixGroup)),
    cellCount: cells.length,
    passedCellCount: cells.length - failedCells.length,
    failedCells,
    acceptedExclusions: [],
    cells
  };
}

/**
 * @param {any} data
 * @param {{
 *   version?: string,
 *   generatedAt?: string,
 *   buildInitialStateFn?: typeof buildInitialState,
 *   runMakeBitcodeBranchFn?: typeof runMakeBitcodeBranch,
 *   publicStateFn?: typeof publicState
 * }} [input={}]
 * @returns {any}
 */
export function buildV18Matrices(data, input = {}) {
  const version = input.version || 'V18';
  const generatedAt = input.generatedAt || new Date().toISOString();
  const proofMemberSemanticMatrix = buildV18ProofMemberSemanticMatrix(data, { version, generatedAt });
  const theoremEvidenceMatrix = buildV18TheoremEvidenceMatrix(data, { version, generatedAt });
  const stateMachineMatrix = buildV18StateMachineMatrix({
    version,
    generatedAt,
    buildInitialStateFn: input.buildInitialStateFn || buildInitialState,
    runMakeBitcodeBranchFn: input.runMakeBitcodeBranchFn || runMakeBitcodeBranch,
    publicStateFn: input.publicStateFn || publicState
  });
  const matrices = {
    proofMemberSemanticMatrix,
    theoremEvidenceMatrix,
    stateMachineMatrix
  };
  return {
    ...matrices,
    summaries: Object.values(matrices).map(summarizeV18Matrix),
    fullyProven: Object.values(matrices).every((matrix) => matrix.failedCells.length === 0 && matrix.acceptedExclusions.length === 0)
  };
}

/**
 * @param {any} matrix
 * @returns {string}
 */
export function assertV18MatrixClosed(matrix) {
  if (matrix.failedCells.length || matrix.acceptedExclusions.length || matrix.passedCellCount !== matrix.cellCount) {
    throw new Error(`${matrix.matrixId} is not closed: ${matrix.failedCells.length} failed cells, ${matrix.acceptedExclusions.length} accepted exclusions.`);
  }
  return 'closed';
}

/**
 * @param {any} matrix
 * @returns {string}
 */
export function buildV18MatrixArtifactDigest(matrix) {
  return stableHashObject({
    matrixId: matrix.matrixId,
    version: matrix.version,
    cellCount: matrix.cellCount,
    passedCellCount: matrix.passedCellCount,
    failedCells: matrix.failedCells,
    acceptedExclusions: matrix.acceptedExclusions
  });
}

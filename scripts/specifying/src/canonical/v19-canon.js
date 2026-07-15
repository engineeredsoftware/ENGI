// @ts-check

import crypto from 'node:crypto';
import { buildV18Matrices, summarizeV18Matrix } from './v18-matrices.js';

export const V19_PROOF_MEMBER_MATRIX_ID = 'v19-proof-member-semantic-matrix';
export const V19_THEOREM_EVIDENCE_MATRIX_ID = 'v19-theorem-evidence-matrix';
export const V19_STATE_MACHINE_MATRIX_ID = 'v19-state-machine-matrix';
export const V19_NEGATIVE_MUTATION_MATRIX_ID = 'v19-negative-proof-mutation-matrix';
export const V19_DETERMINISTIC_REPLAY_REPORT_ID = 'v19-deterministic-replay-report';
export const V19_VOLATILITY_INVENTORY_ID = 'v19-volatility-inventory';
export const V19_CONTRACT_CHANGE_LEDGER_ID = 'v19-contract-change-ledger';

export const V19_ARTIFACT_PATHS = {
  proofMemberSemanticMatrix: '.bitcode/v19-proof-member-semantic-matrix.json',
  theoremEvidenceMatrix: '.bitcode/v19-theorem-evidence-matrix.json',
  stateMachineMatrix: '.bitcode/v19-state-machine-matrix.json',
  negativeProofMutationMatrix: '.bitcode/v19-negative-proof-mutation-matrix.json',
  deterministicReplayReport: '.bitcode/v19-deterministic-replay-report.json',
  volatilityInventory: '.bitcode/v19-volatility-inventory.json',
  contractChangeLedger: '.bitcode/v19-contract-change-ledger.json'
};

const V19_REQUIRED_MUTATION_CLASSES = [
  'missing-digest',
  'proof-family-catalog-drift',
  'corrupted-replay-step',
  'dropped-theorem-verdict',
  'mutated-member-payload',
  'changed-projection-policy',
  'missing-witness-path',
  'changed-matrix-axis',
  'unsorted-artifact-inventory',
  'volatile-timestamp'
];

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function sortForJson(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortForJson);
  const record = /** @type {Record<string, unknown>} */ (value);
  /** @type {Record<string, unknown>} */
  const sorted = {};
  for (const key of Object.keys(record).sort()) {
    sorted[key] = sortForJson(record[key]);
  }
  return sorted;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function serializeCanonicalJson(value) {
  return `${JSON.stringify(sortForJson(value), null, 2)}\n`;
}

/**
 * @param {string} content
 * @returns {string}
 */
export function digestContent(content) {
  return `sha256:${crypto.createHash('sha256').update(content).digest('hex')}`;
}

/**
 * @param {unknown} value
 * @returns {any}
 */
function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * @param {readonly unknown[]} [values=[]]
 * @returns {string[]}
 */
function summarizeStrings(values = []) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {boolean} condition
 * @param {string} errorClass
 * @param {string} message
 */
function assertMutation(condition, errorClass, message) {
  if (condition) return;
  const error = new Error(message);
  // @ts-expect-error Classified mutation errors are intentionally lightweight.
  error.errorClass = errorClass;
  throw error;
}

/**
 * @param {any} matrix
 * @param {string} matrixId
 * @returns {any}
 */
function renameInheritedMatrix(matrix, matrixId) {
  return {
    ...cloneJson(matrix),
    inheritedFromMatrixId: matrix.matrixId,
    matrixId,
    cells: (matrix.cells || []).map((/** @type {any} */ cell) => ({ ...cell, matrixId })),
    failedCells: (matrix.failedCells || []).map((/** @type {any} */ cell) => ({ ...cell, matrixId }))
  };
}

/**
 * @param {any} data
 * @param {{
 *   version?: string,
 *   generatedAt?: string,
 *   buildInitialStateFn?: any,
 *   runMakeBitcodeBranchFn?: any,
 *   publicStateFn?: any
 * }} [input={}]
 * @returns {any}
 */
export function buildV19PositiveMatrices(data, input = {}) {
  const version = input.version || 'V19';
  const generatedAt = input.generatedAt || data.generatedAt;
  const inherited = buildV18Matrices(data, {
    ...input,
    version,
    generatedAt
  });
  const proofMemberSemanticMatrix = renameInheritedMatrix(inherited.proofMemberSemanticMatrix, V19_PROOF_MEMBER_MATRIX_ID);
  const theoremEvidenceMatrix = renameInheritedMatrix(inherited.theoremEvidenceMatrix, V19_THEOREM_EVIDENCE_MATRIX_ID);
  const stateMachineMatrix = renameInheritedMatrix(inherited.stateMachineMatrix, V19_STATE_MACHINE_MATRIX_ID);
  const matrices = {
    proofMemberSemanticMatrix,
    theoremEvidenceMatrix,
    stateMachineMatrix
  };
  const summaries = Object.values(matrices).map(summarizeV18Matrix);
  return {
    inheritedPositiveBaseline: {
      fromVersion: 'V18',
      cellCount: summaries.reduce((sum, summary) => sum + summary.cellCount, 0),
      proofMemberSemanticCellCount: proofMemberSemanticMatrix.cellCount,
      theoremEvidenceCellCount: theoremEvidenceMatrix.cellCount,
      stateMachineCellCount: stateMachineMatrix.cellCount
    },
    ...matrices,
    summaries,
    fullyProven: Object.values(matrices).every((matrix) => matrix.failedCells.length === 0 && matrix.acceptedExclusions.length === 0)
  };
}

/**
 * @param {any} artifact
 * @param {string} artifactPath
 * @param {{
 *   generatedAt: string,
 *   canonicalCommitRecordedAt?: string | null,
 *   worktreeState?: string
 * }} context
 * @returns {Array<{ artifactPath: string, fieldPath: string, classification: string, value: string, reason: string }>}
 */
function scanVolatileFields(artifact, artifactPath, context) {
  /** @type {Array<{ artifactPath: string, fieldPath: string, classification: string, value: string, reason: string }>} */
  const findings = [];
  const isoTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
  const deterministicParsedAt = '2026-04-09T00:00:00.000Z';

  /**
   * @param {unknown} value
   * @param {string} fieldPath
   */
  function walk(value, fieldPath) {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, `${fieldPath}[${index}]`));
      return;
    }
    if (typeof value !== 'object') return;
    const record = /** @type {Record<string, unknown>} */ (value);
    for (const key of Object.keys(record)) {
      const childPath = fieldPath ? `${fieldPath}.${key}` : key;
      const child = record[key];
      if (typeof child === 'string') {
        const lowerKey = key.toLowerCase();
        if (key === 'generatedAt') {
          findings.push({
            artifactPath,
            fieldPath: childPath,
            classification: child === context.generatedAt ? 'context-bound' : 'blocking-volatile',
            value: child,
            reason: child === context.generatedAt ? 'generatedAt is fixed by replay context' : 'generatedAt differs from replay context'
          });
        } else if (key === 'canonicalCommitRecordedAt') {
          findings.push({
            artifactPath,
            fieldPath: childPath,
            classification: child === (context.canonicalCommitRecordedAt || child) ? 'context-bound' : 'blocking-volatile',
            value: child,
            reason: 'canonical commit timestamp is fixed by proof-source commit'
          });
        } else if (key === 'parsedAt') {
          findings.push({
            artifactPath,
            fieldPath: childPath,
            classification: child === deterministicParsedAt ? 'canonical-stable' : 'blocking-volatile',
            value: child,
            reason: child === deterministicParsedAt ? 'parsed completion timestamp is deterministic' : 'parsed completion timestamp is not deterministic'
          });
        } else if ((lowerKey.endsWith('at') || lowerKey.includes('timestamp')) && isoTimestamp.test(child)) {
          findings.push({
            artifactPath,
            fieldPath: childPath,
            classification: 'blocking-volatile',
            value: child,
            reason: 'timestamp-like field is not explicitly fixed by replay context'
          });
        } else if (lowerKey.includes('random') || lowerKey.includes('nonce')) {
          findings.push({
            artifactPath,
            fieldPath: childPath,
            classification: 'blocking-volatile',
            value: child,
            reason: 'random-looking field is not allowed in canonical proof artifacts'
          });
        }
      }
      walk(child, childPath);
    }
  }

  walk(artifact, '');
  return findings;
}

/**
 * @param {any[]} entries
 * @returns {boolean}
 */
function artifactDigestEntriesSorted(entries) {
  const paths = entries.map((entry) => String(entry?.path || ''));
  return paths.every((path, index) => index === 0 || String(paths[index - 1] || '') <= path);
}

/**
 * @param {{
 *   data: any,
 *   positiveMatrices: any,
 *   version?: string,
 *   generatedAt?: string,
 *   extraArtifacts?: Record<string, unknown>
 * }} input
 * @returns {any}
 */
export function buildV19VolatilityInventory({
  data,
  positiveMatrices,
  version = 'V19',
  generatedAt = data.generatedAt,
  extraArtifacts = {}
}) {
  const artifacts = {
    '_proven-data': data,
    [V19_ARTIFACT_PATHS.proofMemberSemanticMatrix]: positiveMatrices.proofMemberSemanticMatrix,
    [V19_ARTIFACT_PATHS.theoremEvidenceMatrix]: positiveMatrices.theoremEvidenceMatrix,
    [V19_ARTIFACT_PATHS.stateMachineMatrix]: positiveMatrices.stateMachineMatrix,
    ...extraArtifacts
  };
  const findings = Object.entries(artifacts).flatMap(([artifactPath, artifact]) => scanVolatileFields(artifact, artifactPath, {
    generatedAt,
    canonicalCommitRecordedAt: data.canonicalCommitRecordedAt,
    worktreeState: data.worktreeState
  }));

  for (const run of data.runDetails || []) {
    const sorted = artifactDigestEntriesSorted(run.artifactDigestEntries || []);
    findings.push({
      artifactPath: '_proven-data',
      fieldPath: `runDetails.${run.scenarioId}.${run.branchMode}.artifactDigestEntries`,
      classification: sorted ? 'canonical-stable' : 'blocking-volatile',
      value: sorted ? 'sorted' : 'unsorted',
      reason: sorted ? 'artifact digest inventory is deterministic by path order' : 'artifact digest inventory is not path-sorted'
    });
  }

  const classificationCounts = Object.fromEntries(
    ['canonical-stable', 'context-bound', 'preview-volatile', 'blocking-volatile'].map((classification) => [
      classification,
      findings.filter((finding) => finding.classification === classification).length
    ])
  );
  const blockingFindings = findings.filter((finding) => finding.classification === 'blocking-volatile');
  return {
    inventoryId: V19_VOLATILITY_INVENTORY_ID,
    version,
    generatedAt,
    scannedArtifactCount: Object.keys(artifacts).length,
    findingCount: findings.length,
    classificationCounts,
    blockingFindings,
    passed: blockingFindings.length === 0,
    findings
  };
}

/**
 * @param {any} data
 * @returns {{ run: any, family: any, member: any, theorem: any, witnessPath: string, digestPath: string, artifact: any }}
 */
function selectRepresentativeProofSurface(data) {
  const run = data.runDetails[0];
  const family = run?.families?.find((/** @type {any} */ entry) => (entry.memberVerdicts || []).length && (entry.theoremVerdicts || []).length) || run?.families?.[0];
  const member = family?.memberVerdicts?.[0];
  const theorem = family?.theoremVerdicts?.[0];
  const witnessPath = String(family?.witnessArtifactPaths?.find((/** @type {string} */ path) => !['.bitcode/system-proof-bundle.json', '.bitcode/proof-witness-manifest.json'].includes(path)) || family?.witnessArtifactPaths?.[0] || '');
  const digestPath = String(run?.artifactDigestEntries?.find((/** @type {any} */ entry) => entry.path === witnessPath)?.path || run?.artifactDigestEntries?.[0]?.path || '');
  const artifact = run?.proofArtifacts?.find((/** @type {any} */ entry) => entry.classification && entry.assetPackEvidence) || run?.proofArtifacts?.[0];
  return { run, family, member, theorem, witnessPath, digestPath, artifact };
}

/**
 * @param {{
 *   mutationClass: string,
 *   expectedErrorClass: string,
 *   run: any,
 *   family?: any,
 *   member?: any,
 *   theorem?: any,
 *   artifactPath?: string,
 *   execute: () => void
 * }} definition
 * @returns {any}
 */
function executeMutationCell(definition) {
  let actualErrorClass = 'none';
  let failureReason = '';
  try {
    definition.execute();
  } catch (error) {
    actualErrorClass = String(/** @type {any} */ (error)?.errorClass || 'unexpected-error');
    failureReason = error instanceof Error ? error.message : String(error);
  }
  const rejectedAsExpected = actualErrorClass === definition.expectedErrorClass;
  return {
    mutationClass: definition.mutationClass,
    scenarioId: definition.run?.scenarioId || 'unknown',
    branchMode: definition.run?.branchMode || 'unknown',
    proofFamily: definition.family?.proofFamily || 'none',
    memberId: definition.member?.id || 'none',
    theoremId: definition.theorem?.theoremId || 'none',
    artifactPath: definition.artifactPath || 'none',
    expectedErrorClass: definition.expectedErrorClass,
    actualErrorClass,
    rejectedAsExpected,
    passed: rejectedAsExpected,
    failureReason
  };
}

/**
 * @param {any} data
 * @param {{
 *   positiveMatrices: any,
 *   volatilityInventory: any,
 *   version?: string,
 *   generatedAt?: string
 * }} input
 * @returns {any}
 */
export function buildV19NegativeProofMutationMatrix(data, {
  positiveMatrices,
  volatilityInventory,
  version = 'V19',
  generatedAt = data.generatedAt
}) {
  const surface = selectRepresentativeProofSurface(data);
  const digestPaths = new Set((surface.run.artifactDigestEntries || []).map((/** @type {any} */ entry) => String(entry.path || '')));
  const replayStepIds = new Set((surface.family.replaySteps || []).map((/** @type {any} */ step) => String(step.stepId || '')));
  const expectedTheoremId = String(surface.theorem.theoremId || '');
  const expectedMemberId = String(surface.member.id || '');
  const sortedDigestEntries = [...(surface.run.artifactDigestEntries || [])].sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));
  const reversedDigestEntries = [...sortedDigestEntries].reverse();
  const projectionArtifact = cloneJson(surface.artifact || {});
  if (projectionArtifact.classification) {
    projectionArtifact.classification.disclosable = !(projectionArtifact.assetPackEvidence?.potentiallyDisclosable === true);
  }

  const definitions = [
    {
      mutationClass: 'missing-digest',
      expectedErrorClass: 'missing-digest',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: surface.digestPath,
      execute: () => {
        const mutatedDigests = new Set(digestPaths);
        mutatedDigests.delete(surface.digestPath);
        assertMutation(mutatedDigests.has(surface.digestPath), 'missing-digest', `missing digest for ${surface.digestPath}`);
      }
    },
    {
      mutationClass: 'proof-family-catalog-drift',
      expectedErrorClass: 'catalog-drift',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: surface.family.proofArtifactPath,
      execute: () => {
        const mutatedMemberIds = [...surface.family.memberIds, 'drifted-member'];
        assertMutation(mutatedMemberIds.length === surface.family.memberIds.length, 'catalog-drift', 'proof-family catalog accepted a drifted member id');
      }
    },
    {
      mutationClass: 'corrupted-replay-step',
      expectedErrorClass: 'corrupted-replay-step',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: surface.family.proofArtifactPath,
      execute: () => {
        const mutatedReplayStepId = `${surface.theorem.replayStepIds[0] || 'missing'}-drifted`;
        assertMutation(replayStepIds.has(mutatedReplayStepId), 'corrupted-replay-step', `replay step ${mutatedReplayStepId} is not declared`);
      }
    },
    {
      mutationClass: 'dropped-theorem-verdict',
      expectedErrorClass: 'missing-theorem-verdict',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: surface.family.proofArtifactPath,
      execute: () => {
        const theoremIds = new Set((surface.family.theoremVerdicts || []).filter((/** @type {any} */ theorem) => theorem.theoremId !== expectedTheoremId).map((/** @type {any} */ theorem) => theorem.theoremId));
        assertMutation(theoremIds.has(expectedTheoremId), 'missing-theorem-verdict', `missing theorem verdict ${expectedTheoremId}`);
      }
    },
    {
      mutationClass: 'mutated-member-payload',
      expectedErrorClass: 'member-predicate-failed',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: surface.family.proofArtifactPath,
      execute: () => {
        const mutatedMember = { ...surface.member, passed: false };
        assertMutation(mutatedMember.passed === true, 'member-predicate-failed', `member ${expectedMemberId} failed its semantic predicate`);
      }
    },
    {
      mutationClass: 'changed-projection-policy',
      expectedErrorClass: 'projection-policy-mismatch',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: String(surface.artifact?.path || 'none'),
      execute: () => {
        assertMutation(
          projectionArtifact.classification?.disclosable === projectionArtifact.assetPackEvidence?.potentiallyDisclosable,
          'projection-policy-mismatch',
          `projection policy mismatch for ${projectionArtifact.path || 'unknown'}`
        );
      }
    },
    {
      mutationClass: 'missing-witness-path',
      expectedErrorClass: 'missing-witness-path',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: surface.witnessPath,
      execute: () => {
        const proofArtifactPaths = new Set((surface.run.proofArtifacts || []).filter((/** @type {any} */ artifact) => artifact.path !== surface.witnessPath).map((/** @type {any} */ artifact) => artifact.path));
        assertMutation(proofArtifactPaths.has(surface.witnessPath), 'missing-witness-path', `missing witness path ${surface.witnessPath}`);
      }
    },
    {
      mutationClass: 'changed-matrix-axis',
      expectedErrorClass: 'changed-matrix-axis',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: V19_ARTIFACT_PATHS.proofMemberSemanticMatrix,
      execute: () => {
        const cell = { ...(positiveMatrices.proofMemberSemanticMatrix.cells[0] || {}), branchMode: 'drifted-branch-mode' };
        assertMutation((data.branchModes || []).includes(cell.branchMode), 'changed-matrix-axis', `unexpected branch mode ${cell.branchMode}`);
      }
    },
    {
      mutationClass: 'unsorted-artifact-inventory',
      expectedErrorClass: 'unsorted-artifact-inventory',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: '_proven-data',
      execute: () => {
        assertMutation(artifactDigestEntriesSorted(reversedDigestEntries), 'unsorted-artifact-inventory', 'artifact digest entries are not path-sorted');
      }
    },
    {
      mutationClass: 'volatile-timestamp',
      expectedErrorClass: 'volatile-timestamp',
      run: surface.run,
      family: surface.family,
      member: surface.member,
      theorem: surface.theorem,
      artifactPath: V19_ARTIFACT_PATHS.volatilityInventory,
      execute: () => {
        const blocking = (volatilityInventory.blockingFindings || []).filter((/** @type {any} */ finding) => finding.fieldPath.includes('volatileFixture'));
        assertMutation(blocking.length === 0, 'volatile-timestamp', 'volatile timestamp fixture was rejected by volatility inventory');
      }
    }
  ];
  const volatileFixtureInventory = buildV19VolatilityInventory({
    data,
    positiveMatrices,
    version,
    generatedAt,
    extraArtifacts: {
      volatileFixture: {
        volatileFixture: {
          generatedAt: '2026-04-09T12:34:56.789Z',
          randomNonce: 'nonce-123'
        }
      }
    }
  });
  const cells = definitions.map((definition) => definition.mutationClass === 'volatile-timestamp'
    ? executeMutationCell({
        ...definition,
        execute: () => {
          const blocking = (volatileFixtureInventory.blockingFindings || []).filter((/** @type {any} */ finding) => finding.artifactPath === 'volatileFixture');
          assertMutation(blocking.length === 0, 'volatile-timestamp', 'volatile timestamp fixture was rejected by volatility inventory');
        }
      })
    : executeMutationCell(definition));

  const unexpectedPassCells = cells.filter((cell) => cell.actualErrorClass === 'none');
  const unexpectedErrorCells = cells.filter((cell) => cell.actualErrorClass !== 'none' && cell.actualErrorClass !== cell.expectedErrorClass);
  return {
    matrixId: V19_NEGATIVE_MUTATION_MATRIX_ID,
    version,
    generatedAt,
    coverageMode: 'representative-first-gate',
    sourceRunCount: (data.runDetails || []).length,
    mutationClassCount: V19_REQUIRED_MUTATION_CLASSES.length,
    mutationClasses: V19_REQUIRED_MUTATION_CLASSES,
    cellCount: cells.length,
    rejectedCellCount: cells.filter((cell) => cell.rejectedAsExpected).length,
    unexpectedPassCells,
    unexpectedErrorCells,
    acceptedExclusions: [],
    omittedCrossProducts: [
      {
        omittedPermutation: 'every mutation class across every proof family member',
        reason: 'representative fail-closed class coverage is the V19 target',
        reopenCondition: 'a member-payload mutation passes unexpectedly or failure classification varies by member class'
      },
      {
        omittedPermutation: 'every mutation class across every theorem id',
        reason: 'V18 theorem evidence matrix already proves positive theorem coverage',
        reopenCondition: 'a theorem mutation passes unexpectedly or replay-step validation varies by theorem group'
      },
      {
        omittedPermutation: 'every mutation class across every artifact path',
        reason: 'digest, path, and inventory classes are sampled by required artifact category',
        reopenCondition: 'missing-path, missing-digest, or artifact-inventory mutation has path-specific behavior'
      },
      {
        omittedPermutation: 'every mutation class across every scenario and branch mode',
        reason: 'required only where mutation target varies by run',
        reopenCondition: 'a mutation result differs by scenario or branch mode'
      },
      {
        omittedPermutation: 'projection mutation across every principal',
        reason: 'full projection behavior is inherited from V17 browser proof',
        reopenCondition: 'projection policy source changes or visibility changes'
      },
      {
        omittedPermutation: 'mutation under every materialization mode',
        reason: 'V19 accepts committed generated artifacts as the only canonical mode',
        reopenCondition: 'a side-artifact or preview-only materialization mode is introduced'
      }
    ],
    cells
  };
}

/**
 * @param {any} data
 * @param {{
 *   positiveMatrices: any,
 *   negativeMutationMatrix: any,
 *   volatilityInventory: any,
 *   version?: string,
 *   generatedAt?: string
 * }} input
 * @returns {any}
 */
export function buildV19ContractChangeLedger(data, {
  positiveMatrices,
  negativeMutationMatrix,
  volatilityInventory,
  version = 'V19',
  generatedAt = data.generatedAt
}) {
  return {
    ledgerId: V19_CONTRACT_CHANGE_LEDGER_ID,
    fromVersion: 'V18',
    toVersion: version,
    generatedAt,
    proofCatalogDelta: {
      status: 'unchanged-inherited-positive-baseline',
      proofFamilyIds: data.familySummaries.map((/** @type {any} */ family) => family.proofFamily),
      memberCount: data.aggregate.memberCount,
      theoremCount: data.aggregate.theoremCount,
      runCount: data.aggregate.runCount
    },
    matrixDeltas: [
      {
        changeType: 'renamed-materialized-artifact',
        fromMatrixId: 'v18-proof-member-semantic-matrix',
        toMatrixId: V19_PROOF_MEMBER_MATRIX_ID,
        cellCount: positiveMatrices.proofMemberSemanticMatrix.cellCount
      },
      {
        changeType: 'renamed-materialized-artifact',
        fromMatrixId: 'v18-theorem-evidence-matrix',
        toMatrixId: V19_THEOREM_EVIDENCE_MATRIX_ID,
        cellCount: positiveMatrices.theoremEvidenceMatrix.cellCount
      },
      {
        changeType: 'renamed-materialized-artifact',
        fromMatrixId: 'v18-state-machine-matrix',
        toMatrixId: V19_STATE_MACHINE_MATRIX_ID,
        cellCount: positiveMatrices.stateMachineMatrix.cellCount
      },
      {
        changeType: 'added-negative-proof-coverage',
        fromMatrixId: 'none',
        toMatrixId: V19_NEGATIVE_MUTATION_MATRIX_ID,
        cellCount: negativeMutationMatrix.cellCount
      }
    ],
    artifactDeltas: [
      ...Object.values(V19_ARTIFACT_PATHS).map((artifactPath) => ({
        changeType: 'added-generated-artifact',
        artifactPath
      }))
    ],
    promotionContractDeltas: [
      {
        changeType: 'added-canonical-entrypoint',
        command: 'npm run promote:canon -- --version V19 --commit <proof-source-commit>'
      },
      {
        changeType: 'added-deterministic-replay-gate',
        reportId: V19_DETERMINISTIC_REPLAY_REPORT_ID
      },
      {
        changeType: 'added-volatility-gate',
        inventoryId: V19_VOLATILITY_INVENTORY_ID,
        blockingFindingCount: volatilityInventory.blockingFindings.length
      }
    ],
    acceptedBoundaryDeltas: [
      {
        boundary: 'full mutation cross-product deferred',
        reopenCondition: 'representative mutation escapes or has run-specific behavior'
      },
      {
        boundary: 'source-level projection security inherited from V17 browser matrix',
        reopenCondition: 'projection policy source changes or projection bug escapes'
      },
      {
        boundary: 'UX quality deferred beyond V19',
        reopenCondition: 'V19 implementation creates operator-usability regression'
      }
    ],
    passed: volatilityInventory.passed === true
      && positiveMatrices.fullyProven === true
      && negativeMutationMatrix.unexpectedPassCells.length === 0
      && negativeMutationMatrix.unexpectedErrorCells.length === 0
  };
}

/**
 * @param {{
 *   data: any,
 *   positiveMatrices: any,
 *   version?: string,
 *   generatedAt?: string
 * }} input
 * @returns {any}
 */
export function buildV19Reports({
  data,
  positiveMatrices,
  version = 'V19',
  generatedAt = data.generatedAt
}) {
  const volatilityInventory = buildV19VolatilityInventory({ data, positiveMatrices, version, generatedAt });
  const negativeMutationMatrix = buildV19NegativeProofMutationMatrix({
    ...data,
    generatedAt
  }, {
    positiveMatrices,
    volatilityInventory,
    version,
    generatedAt
  });
  const contractChangeLedger = buildV19ContractChangeLedger(data, {
    positiveMatrices,
    negativeMutationMatrix,
    volatilityInventory,
    version,
    generatedAt
  });
  return {
    volatilityInventory,
    negativeMutationMatrix,
    contractChangeLedger
  };
}

/**
 * @param {any} v19
 * @returns {Record<string, string>}
 */
export function buildV19GeneratedArtifactContents(v19) {
  /** @type {Record<string, string>} */
  const artifacts = {
    [V19_ARTIFACT_PATHS.proofMemberSemanticMatrix]: serializeCanonicalJson(v19.positiveMatrices.proofMemberSemanticMatrix),
    [V19_ARTIFACT_PATHS.theoremEvidenceMatrix]: serializeCanonicalJson(v19.positiveMatrices.theoremEvidenceMatrix),
    [V19_ARTIFACT_PATHS.stateMachineMatrix]: serializeCanonicalJson(v19.positiveMatrices.stateMachineMatrix),
    [V19_ARTIFACT_PATHS.negativeProofMutationMatrix]: serializeCanonicalJson(v19.negativeMutationMatrix),
    [V19_ARTIFACT_PATHS.volatilityInventory]: serializeCanonicalJson(v19.volatilityInventory),
    [V19_ARTIFACT_PATHS.contractChangeLedger]: serializeCanonicalJson(v19.contractChangeLedger)
  };
  if (v19.deterministicReplayReport) {
    artifacts[V19_ARTIFACT_PATHS.deterministicReplayReport] = serializeCanonicalJson(v19.deterministicReplayReport);
  }
  return artifacts;
}

/**
 * @param {Record<string, string>} artifacts
 * @returns {Array<{ artifactPath: string, digest: string, byteLength: number }>}
 */
export function summarizeArtifactContents(artifacts) {
  return Object.entries(artifacts)
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
    .map(([artifactPath, content]) => ({
      artifactPath,
      digest: digestContent(content),
      byteLength: Buffer.byteLength(content, 'utf8')
    }));
}

/**
 * @param {{
 *   version: string,
 *   proofSourceCommit: string,
 *   generatorId: string,
 *   generatedAt: string,
 *   firstArtifacts: Record<string, string>,
 *   secondArtifacts: Record<string, string>,
 *   volatileFieldFindings?: any[]
 * }} input
 * @returns {any}
 */
export function buildV19DeterministicReplayReport({
  version,
  proofSourceCommit,
  generatorId,
  generatedAt,
  firstArtifacts,
  secondArtifacts,
  volatileFieldFindings = []
}) {
  const artifactPaths = summarizeStrings([...Object.keys(firstArtifacts), ...Object.keys(secondArtifacts)]).sort();
  const artifactComparisons = artifactPaths.map((artifactPath) => {
    const firstContent = firstArtifacts[artifactPath] || '';
    const secondContent = secondArtifacts[artifactPath] || '';
    return {
      artifactPath,
      firstDigest: digestContent(firstContent),
      secondDigest: digestContent(secondContent),
      byteLength: Buffer.byteLength(firstContent, 'utf8'),
      byteEqual: firstContent === secondContent
    };
  });
  const failedComparisons = artifactComparisons.filter((comparison) => !comparison.byteEqual);
  const blockingVolatileFindings = volatileFieldFindings.filter((finding) => finding.classification === 'blocking-volatile');
  return {
    reportId: V19_DETERMINISTIC_REPLAY_REPORT_ID,
    version,
    proofSourceCommit,
    generatorId,
    generatedAt,
    runCount: 2,
    artifactComparisons,
    volatileFieldFindings,
    passed: failedComparisons.length === 0 && blockingVolatileFindings.length === 0,
    failureReason: failedComparisons[0]?.artifactPath || blockingVolatileFindings[0]?.fieldPath || ''
  };
}

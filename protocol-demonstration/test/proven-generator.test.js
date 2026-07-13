import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInitialState } from '../src/bitcode-demo.js';
import { ACTIVE_CANON_VERSION, DRAFT_TARGET_VERSION } from '../src/canon-posture.js';
import {
  buildCanonicalProvenData,
  collectCanonicalProvenRuns,
  generateCanonicalProvenMarkdown,
  renderCanonicalProvenMarkdown
} from '../src/canonical/proven-generator.js';

/**
 * @param {number} scenarioCount
 * @returns {{ scenarioIds: string[] }}
 */
function selectScenarioIds(scenarioCount) {
  const scenarioIds = buildInitialState().readScenarios.slice(0, scenarioCount).map((/** @type {any} */ scenario) => scenario.scenarioId);
  return { scenarioIds };
}

/**
 * @param {any} collected
 */
function buildTestProvenData(collected) {
  return buildCanonicalProvenData(collected, {
    version: 'V15',
    canonicalCommit: '8b1ccbc2481f80bc63d31a33901a463f3ea7028a',
    canonicalCommitRecordedAt: '2026-04-06T00:00:00.000Z',
    generatedAt: '2026-04-06T00:00:00.000Z'
  });
}

test('canonical proven generator renders a stable appendix from seeded proof runs', () => {
  const collected = collectCanonicalProvenRuns({
    ...selectScenarioIds(2),
    branchModes: ['patch']
  });
  const data = buildTestProvenData(collected);
  const markdown = renderCanonicalProvenMarkdown(data);

  assert.equal(data.aggregate.fullyProven, true);
  assert.equal(data.aggregate.runCount, 2);
  assert.equal(data.familySummaries.length, 9);
  assert.equal(data.runMatrix.every((entry) => entry.fullyProven), true);
  assert.ok(markdown.includes('# Bitcode Spec V15 Proven'));
  assert.ok(markdown.includes('## Proof Family Inventory'));
  assert.ok(markdown.includes('## Scenario and Run Matrix'));
  assert.ok(markdown.includes('## Run Details'));
  assert.ok(markdown.includes('`prompt-completeness`'));
  assert.ok(markdown.includes('_legacy/ENGI_SPEC_V15_PROVEN.md'));
  assert.match(markdown, /\n$/);
  assert.doesNotMatch(markdown, /\n\n$/);
});

test('canonical proven generator fails closed on proof-family catalog drift across runs', () => {
  const collected = collectCanonicalProvenRuns({
    ...selectScenarioIds(2),
    branchModes: ['patch']
  });
  const mutated = JSON.parse(JSON.stringify(collected));
  const driftedRun = mutated.runs[1];
  const driftedCatalogEntry = driftedRun.systemProofBundle.proofFamilies.find((/** @type {any} */ entry) => entry.proofFamily === 'inference-synthesis');
  driftedCatalogEntry.memberIds = [...driftedCatalogEntry.memberIds, 'drifted-member'];
  driftedRun.familyProofsByName['inference-synthesis'].memberVerdicts.push({
    memberId: 'drifted-member',
    passed: true
  });

  assert.throws(
    () => buildTestProvenData(mutated),
    /changed the structural catalog for inference-synthesis/
  );
});

test('canonical proven generator fails closed when a keyed witness digest is missing', () => {
  const collected = collectCanonicalProvenRuns({
    ...selectScenarioIds(1),
    branchModes: ['patch']
  });
  const mutated = JSON.parse(JSON.stringify(collected));
  delete mutated.runs[0].proofWitnessManifest.artifactDigestByPath['.bitcode/prompt-family-registry.json'];

  assert.throws(
    () => buildTestProvenData(mutated),
    /missing witness digest for \.bitcode\/prompt-family-registry\.json/
  );
});

test('V22 proven generator renders a V22 appendix while inheriting V20 and V19 generated closure', () => {
  const generated = generateCanonicalProvenMarkdown({
    version: 'V22',
    canonicalCommit: 'draft-v22',
    canonicalCommitRecordedAt: '2026-04-12T00:00:00.000Z',
    generatedAt: '2026-04-12T00:00:00.000Z'
  });

  assert.equal(generated.data.version, 'V22');
  assert.equal(generated.data.aggregate.fullyProven, false);
  assert.equal(generated.data.v19.deterministicReplayReport.passed, true);
  assert.equal(generated.data.v20.qualitySummary.passed, true);
  assert.equal(generated.data.v22.specFamilyReport.checkedVersion, 'V22');
  assert.equal(generated.data.v22.specFamilyReport.currentTarget, 'V22');
  assert.equal(generated.data.v22.specFamilyReport.pointerVersion, ACTIVE_CANON_VERSION);
  assert.equal(generated.data.v22.specFamilyReport.passed, ACTIVE_CANON_VERSION === 'V22');
  assert.equal(generated.data.v22.canonicalInputReport.checkedTargetVersion, 'V22');
  assert.equal(generated.data.v22.canonicalInputReport.pointerVersion, ACTIVE_CANON_VERSION);
  assert.equal(generated.data.v22.canonicalInputReport.passed, ACTIVE_CANON_VERSION === 'V22');
  assert.equal(generated.data.v22.canonPostureDriftReport.checkedActiveCanonVersion, 'V22');
  assert.equal(generated.data.v22.canonPostureDriftReport.checkedDraftTargetVersion, 'V23');
  assert.equal(generated.data.v22.canonPostureDriftReport.pointerVersion, ACTIVE_CANON_VERSION);
  assert.equal(generated.data.v22.canonPostureDriftReport.passed, ACTIVE_CANON_VERSION === 'V22');
  assert.deepEqual(Object.keys(generated.artifacts).sort(), [
    '.bitcode/v22-canon-posture-drift-report.json',
    '.bitcode/v22-canonical-input-report.json',
    '.bitcode/v22-spec-family-report.json'
  ]);
  assert.ok(generated.markdown.includes('# Bitcode Spec V22 Proven'));
  assert.ok(generated.markdown.includes('## V19 Reproducible Canon Reports'));
  assert.ok(generated.markdown.includes('## V20 Operator Quality Reports'));
  assert.ok(generated.markdown.includes('## V22 Drift-Detection and Specifying Reports'));
  assert.ok(generated.markdown.includes('.bitcode/v22-spec-family-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v22-canonical-input-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v22-canon-posture-drift-report.json'));
  assert.ok(generated.markdown.includes('_legacy/ENGI_SPEC_V22_PROVEN.md'));
});

test('V23 proven generator renders a V23 appendix with bitcoin payment-mode coverage', () => {
  const generated = generateCanonicalProvenMarkdown({
    version: 'V23',
    canonicalCommit: 'draft-v23',
    canonicalCommitRecordedAt: '2026-04-14T00:00:00.000Z',
    generatedAt: '2026-04-14T00:00:00.000Z'
  });

  assert.equal(generated.data.version, 'V23');
  assert.deepEqual(generated.data.paymentModes, [
    'audited-base-layer-purchase',
    'repeated-read-payment',
    'checkpointed-sidechain-bridge'
  ]);
  assert.equal(generated.data.familySummaries.length, 11);
  assert.equal(generated.data.v23.specFamilyReport.passed, ACTIVE_CANON_VERSION === 'V23');
  assert.equal(generated.data.v23.canonicalInputReport.passed, ACTIVE_CANON_VERSION === 'V23');
  assert.equal(
    generated.data.v23.canonPostureDriftReport.passed,
    ACTIVE_CANON_VERSION === 'V23' && DRAFT_TARGET_VERSION === 'V24'
  );
  assert.equal(
    generated.data.aggregate.fullyProven,
    generated.data.v23.specFamilyReport.passed
      && generated.data.v23.canonicalInputReport.passed
      && generated.data.v23.canonPostureDriftReport.passed
  );
  assert.deepEqual(Object.keys(generated.artifacts).sort(), [
    '.bitcode/v23-canon-posture-drift-report.json',
    '.bitcode/v23-canonical-input-report.json',
    '.bitcode/v23-spec-family-report.json'
  ]);
  assert.ok(generated.markdown.includes('# Bitcode Spec V23 Proven'));
  assert.ok(generated.markdown.includes('## V23 Deployment and Canon Reports'));
  assert.ok(generated.markdown.includes('`bitcoin-audit-anchor`'));
  assert.ok(generated.markdown.includes('`bitcoin-settlement-interface`'));
  assert.ok(generated.markdown.includes('`checkpointed-sidechain-bridge`'));
  assert.ok(generated.markdown.includes('.bitcode/v23-spec-family-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v23-canonical-input-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v23-canon-posture-drift-report.json'));
  assert.ok(generated.markdown.includes('_legacy/ENGI_SPEC_V23_PROVEN.md'));
});

test('V24 proven generator renders a V24 appendix with external-realization payment-mode coverage', () => {
  const generated = generateCanonicalProvenMarkdown({
    version: 'V24',
    canonicalCommit: 'draft-v24',
    canonicalCommitRecordedAt: '2026-04-15T00:00:00.000Z',
    generatedAt: '2026-04-15T00:00:00.000Z'
  });

  assert.equal(generated.data.version, 'V24');
  assert.deepEqual(generated.data.paymentModes, [
    'audited-base-layer-purchase',
    'repeated-read-payment',
    'checkpointed-sidechain-bridge'
  ]);
  assert.equal(generated.data.v24.specFamilyReport.passed, ACTIVE_CANON_VERSION === 'V24');
  assert.equal(generated.data.v24.canonicalInputReport.passed, ACTIVE_CANON_VERSION === 'V24');
  assert.equal(generated.data.v24.canonPostureDriftReport.checkedActiveCanonVersion, 'V24');
  assert.equal(generated.data.v24.canonPostureDriftReport.checkedDraftTargetVersion, 'V25');
  assert.equal(
    generated.data.v24.canonPostureDriftReport.passed,
    ACTIVE_CANON_VERSION === 'V24' && DRAFT_TARGET_VERSION === 'V25'
  );
  assert.equal(
    generated.data.aggregate.fullyProven,
    generated.data.v24.specFamilyReport.passed
      && generated.data.v24.canonicalInputReport.passed
      && generated.data.v24.canonPostureDriftReport.passed
  );
  assert.deepEqual(Object.keys(generated.artifacts).sort(), [
    '.bitcode/v24-canon-posture-drift-report.json',
    '.bitcode/v24-canonical-input-report.json',
    '.bitcode/v24-spec-family-report.json'
  ]);
  assert.ok(generated.markdown.includes('# Bitcode Spec V24 Proven'));
  assert.ok(generated.markdown.includes('## V24 External-Realization and Canon Reports'));
  assert.ok(generated.markdown.includes('external-realization-execution'));
  assert.ok(generated.markdown.includes('containerized-reality'));
  assert.ok(generated.markdown.includes('github-live-interface'));
  assert.ok(generated.markdown.includes('repeated-read-payment'));
  assert.ok(generated.markdown.includes('.bitcode/v24-spec-family-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v24-canonical-input-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v24-canon-posture-drift-report.json'));
  assert.ok(generated.markdown.includes('_legacy/ENGI_SPEC_V24_PROVEN.md'));
});

test('V25 proven generator renders a Bitcode-branded appendix with BTD rename closure', () => {
  const generated = generateCanonicalProvenMarkdown({
    version: 'V25',
    canonicalCommit: 'draft-v25',
    canonicalCommitRecordedAt: '2026-04-15T18:00:00.000Z',
    generatedAt: '2026-04-15T18:00:00.000Z'
  });

  assert.equal(generated.data.version, 'V25');
  assert.deepEqual(generated.data.paymentModes, [
    'audited-base-layer-purchase',
    'repeated-read-payment',
    'checkpointed-sidechain-bridge'
  ]);
  assert.equal(generated.data.v25.specFamilyReport.passed, ACTIVE_CANON_VERSION === 'V25');
  assert.equal(generated.data.v25.canonicalInputReport.passed, ACTIVE_CANON_VERSION === 'V25');
  assert.equal(
    generated.data.v25.canonPostureDriftReport.passed,
    ACTIVE_CANON_VERSION === 'V25' && DRAFT_TARGET_VERSION === 'V26'
  );
  assert.equal(
    generated.data.aggregate.fullyProven,
    generated.data.v25.specFamilyReport.passed
      && generated.data.v25.canonicalInputReport.passed
      && generated.data.v25.canonPostureDriftReport.passed
  );
  assert.equal(generated.data.v25.canonPostureDriftReport.checkedActiveCanonVersion, 'V25');
  assert.equal(generated.data.v25.canonPostureDriftReport.checkedDraftTargetVersion, 'V26');
  assert.deepEqual(Object.keys(generated.artifacts).sort(), [
    '.bitcode/v25-canon-posture-drift-report.json',
    '.bitcode/v25-canonical-input-report.json',
    '.bitcode/v25-spec-family-report.json'
  ]);
  assert.ok(generated.markdown.includes('# Bitcode Spec V25 Proven'));
  assert.ok(generated.markdown.includes('## V25 Bitcode Rename and Canon Reports'));
  assert.ok(generated.markdown.includes('`repeated-read-payment`'));
  assert.ok(generated.markdown.includes('.bitcode/v25-spec-family-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v25-canonical-input-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v25-canon-posture-drift-report.json'));
  assert.ok(generated.markdown.includes('_legacy/ENGI_SPEC_V25_PROVEN.md'));
  assert.ok(generated.markdown.includes('BTD'));
});

test('V26 proven generator renders active Bitcode posture without overstating superseded promotion readiness', () => {
  const generated = generateCanonicalProvenMarkdown({
    version: 'V26',
    canonicalCommit: 'draft-v26',
    canonicalCommitRecordedAt: '2026-04-16T00:00:00.000Z',
    generatedAt: '2026-04-16T00:00:00.000Z'
  });

  assert.equal(generated.data.version, 'V26');
  assert.deepEqual(generated.data.paymentModes, [
    'audited-base-layer-purchase',
    'repeated-read-payment',
    'checkpointed-sidechain-bridge'
  ]);
  assert.equal(generated.data.v26.activeCanonicalTarget, ACTIVE_CANON_VERSION);
  assert.equal(generated.data.v26.draftPreview, ACTIVE_CANON_VERSION !== 'V26');

  if (ACTIVE_CANON_VERSION !== 'V26') {
    assert.equal(generated.data.v26.checkpointReady, false);
    assert.equal(generated.data.v26.throughFourthGateReady, false);
    assert.equal(generated.data.v26.fourthGatePromotedClosed, false);
    assert.equal(generated.data.v26.throughFourthGatePromotionReady, false);
    assert.equal(generated.data.v26.promotionReady, false);
    assert.equal(generated.data.v26.specFamilyReport.passed, false);
    assert.equal(generated.data.v26.specFamilyReport.mode, 'draft');
    assert.equal(generated.data.v26.canonicalInputReport.passed, true);
    assert.equal(generated.data.aggregate.fullyProven, false);
    assert.ok(generated.markdown.includes('# Bitcode Spec V26 Proven'));
    assert.ok(generated.markdown.includes('- draftPreview: `true`'));
    assert.ok(generated.markdown.includes('- promotionReady: `false`'));
    return;
  }

  assert.equal(generated.data.v26.checkpointReady, true);
  assert.equal(generated.data.v26.throughFourthGateReady, true);
  assert.equal(generated.data.v26.fourthGatePromotedClosed, true);
  assert.equal(generated.data.v26.throughFourthGatePromotionReady, ACTIVE_CANON_VERSION === 'V26');
  assert.equal(generated.data.v26.promotionReady, true);
  assert.equal(generated.data.v26.fifthGateClosurePassed, true);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningPassed, true);
  assert.equal(generated.data.v26.sixthGateClosurePassed, true);
  assert.equal(generated.data.v26.seventhGateClosurePassed, true);
  assert.equal(generated.data.v26.eighthGateClosurePassed, true);
  assert.equal(generated.data.v26.specFamilyReport.passed, true);
  assert.equal(generated.data.v26.specFamilyReport.mode, 'promoted');
  assert.equal(generated.data.v26.canonicalInputReport.passed, true);
  assert.equal(
    generated.data.v26.canonicalInputReport.requiredGeneratedArtifactPaths.includes(
      '.bitcode/prompt-system-totality-proof.json'
    ),
    true
  );
  assert.equal(
    generated.data.v26.canonicalInputReport.requiredGeneratedArtifactPaths.includes(
      '.bitcode/fourth-gate-reclosure-review-proof.json'
    ),
    true
  );
  assert.equal(
    generated.data.v26.canonicalInputReport.requiredGeneratedArtifactPaths.includes(
      '.bitcode/fifth-gate-closure-deepening-proof.json'
    ),
    true
  );
  assert.equal(
    generated.data.v26.canonicalInputReport.requiredGeneratedArtifactPaths.includes(
      '.bitcode/fifth-gate-closure-proof.json'
    ),
    true
  );
  assert.equal(
    generated.data.v26.canonicalInputReport.requiredGeneratedArtifactPaths.includes(
      '.bitcode/sixth-gate-mvp-closure-proof.json'
    ),
    true
  );
  assert.equal(
    generated.data.v26.canonicalInputReport.requiredGeneratedArtifactPaths.includes(
      '.bitcode/seventh-gate-commercial-testnet-launch-proof.json'
    ),
    true
  );
  assert.equal(generated.data.v26.conversationsContinuityProof.passed, true);
  assert.equal(generated.data.v26.runsPipelinesTotalityProof.passed, true);
  assert.equal(generated.data.v26.persistenceSchemaTotalityProof.passed, true);
  assert.equal(generated.data.v26.promptSystemTotalityProof.passed, true);
  assert.equal(generated.data.v26.inferenceImplementationRecordsProof.passed, true);
  assert.equal(generated.data.v26.fourthGateReclosureReviewProof.passed, true);
  assert.equal(generated.data.v26.fourthGateReclosureReviewProof.reviewMode, 'post-reopening-deviance-review');
  assert.equal(generated.data.v26.fourthGateReclosureReviewProof.criterionCount, 17);
  assert.equal(generated.data.v26.fourthGateReclosureReviewProof.openCriterionCount, 0);
  assert.equal(generated.data.v26.fourthGateReclosureReviewProof.proceduralClosureReady, true);
  assert.equal(generated.data.v26.fourthGateReclosureReviewProof.blockingDevianceDetected, false);
  assert.equal(generated.data.v26.sourceToSharesFifthGateProof.passed, true);
  assert.equal(generated.data.v26.sourceToSharesFifthGateProof.focus, 'source-to-shares');
  assert.equal(generated.data.v26.sourceToSharesFifthGateProof.closureClaim, false);
  assert.equal(generated.data.v26.sourceToSharesFifthGateProof.proceduralGateClosure, false);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningProof.passed, true);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningProof.closureDeepened, true);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningProof.closureClaim, true);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningProof.proceduralGateClosure, true);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningProof.axisCount, 6);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningProof.deepenedAxisCount, 6);
  assert.equal(generated.data.v26.fifthGateClosureDeepeningProof.openAxisCount, 0);
  assert.equal(generated.data.v26.fifthGateClosureProof.passed, true);
  assert.equal(generated.data.v26.fifthGateClosureProof.closureClaim, true);
  assert.equal(generated.data.v26.fifthGateClosureProof.proceduralGateClosure, true);
  assert.equal(generated.data.v26.fifthGateClosureProof.queueRowCount, 6);
  assert.equal(generated.data.v26.fifthGateClosureProof.closedQueueRowCount, 6);
  assert.deepEqual(generated.data.v26.fifthGateClosureProof.openQueueRows, []);
  assert.deepEqual(generated.data.v26.fifthGateClosureProof.notReadyFor, []);
  assert.equal(generated.data.v26.productReadinessAudit.baselinePassed, true);
  assert.equal(generated.data.v26.productReadinessAudit.mvpPassed, true);
  assert.equal(generated.data.v26.productReadinessAudit.launchPassed, true);
  assert.equal(generated.data.v26.productReadinessAudit.closureClaim, true);
  assert.equal(generated.data.v26.productReadinessAudit.sixthGateMvpClaim, true);
  assert.equal(generated.data.v26.productReadinessAudit.seventhGateCommercialTestnetLaunchClaim, true);
  assert.equal(
    generated.data.v26.productReadinessAudit.closureReadyProductCount,
    generated.data.v26.productReadinessAudit.productCount
  );
  assert.equal(
    generated.data.v26.productReadinessAudit.mvpReadyProductCount,
    generated.data.v26.productReadinessAudit.productCount
  );
  assert.equal(
    generated.data.v26.productReadinessAudit.launchReadyProductCount,
    generated.data.v26.productReadinessAudit.productCount
  );
  assert.equal(generated.data.v26.sixthGateMvpClosureProof.passed, true);
  assert.equal(generated.data.v26.sixthGateMvpClosureProof.closureClaim, true);
  assert.equal(generated.data.v26.sixthGateMvpClosureProof.proceduralGateClosure, true);
  assert.equal(generated.data.v26.sixthGateMvpClosureProof.queueRowCount, 8);
  assert.equal(generated.data.v26.sixthGateMvpClosureProof.closedQueueRowCount, 8);
  assert.deepEqual(generated.data.v26.sixthGateMvpClosureProof.openQueueRows, []);
  assert.deepEqual(generated.data.v26.sixthGateMvpClosureProof.notReadyFor, []);
  assert.equal(generated.data.v26.seventhGateCommercialTestnetLaunchProof.passed, true);
  assert.equal(generated.data.v26.seventhGateCommercialTestnetLaunchProof.closureClaim, true);
  assert.equal(generated.data.v26.seventhGateCommercialTestnetLaunchProof.proceduralGateClosure, true);
  assert.equal(generated.data.v26.seventhGateCommercialTestnetLaunchProof.queueRowCount, 8);
  assert.equal(generated.data.v26.seventhGateCommercialTestnetLaunchProof.closedQueueRowCount, 8);
  assert.deepEqual(generated.data.v26.seventhGateCommercialTestnetLaunchProof.openQueueRows, []);
  assert.deepEqual(generated.data.v26.seventhGateCommercialTestnetLaunchProof.notReadyFor, []);
  assert.equal(generated.data.v26.promptSpaceCompletenessProof.passed, true);
  assert.equal(generated.data.v26.promptSpaceCompletenessProof.closureClaim, true);
  assert.equal(generated.data.v26.promptSpaceCompletenessProof.proceduralGateClosure, true);
  assert.equal(generated.data.v26.promptSpaceCompletenessProof.baselinePassed, true);
  assert.equal(generated.data.v26.promptSpaceCompletenessProof.witnessSetCount, 7);
  assert.deepEqual(generated.data.v26.promptSpaceCompletenessProof.openCompletenessDimensions, []);
  assert.equal(generated.data.v26.retainedPackageAdmissibilityProof.passed, true);
  assert.deepEqual(generated.data.v26.retainedPackageAdmissibilityProof.requiredFields, [
    'packageName',
    'primaryRole',
    'rationale',
    'role',
    'writeBoundary',
    'proofObligation',
    'requiredFiles'
  ]);
  assert.equal(generated.data.v26.retainedPackageAdmissibilityProof.roleCounts['commercial-infrastructure'], 5);
  assert.equal(generated.data.v26.retainedPackageAdmissibilityProof.packageCensusCoveragePassed, true);
  assert.equal(generated.data.v26.retainedPackageAdmissibilityProof.unclassifiedPackageCount, 0);
  assert.ok(
    generated.data.v26.retainedPackageAdmissibilityProof.packageCensusCount
      > generated.data.v26.retainedPackageAdmissibilityProof.admittedPackageCount,
  );
  assert.equal(
    generated.data.v26.retainedPackageAdmissibilityProof.packageCensus.some((entry) =>
      entry.packagePath === 'packages/executions-mcp/src/mcp-server/package.json' &&
      entry.primaryRole === 'direct-product'
    ),
    true,
  );
  assert.equal(
    generated.data.v26.retainedPackageAdmissibilityProof.packageCensus.some((entry) =>
      entry.packagePath === 'packages/asset-packs-pipelines/domain/package.json' &&
      entry.primaryRole === 'compatibility'
    ),
    true,
  );
  assert.equal(
    generated.data.v26.retainedPackageAdmissibilityProof.packages.some((entry) =>
      entry.requiredFiles.includes('packages/orm/src/queries/field-intelligence.ts')
    ),
    false
  );
  assert.equal(generated.data.v26.systemReformAdmissibilityProof.passed, true);
  assert.equal(generated.data.v26.wholeRepositoryProductionSatisfactionProof.passed, true);
  assert.equal(generated.data.v26.wholeRepositoryProductionSatisfactionProof.closureClaim, true);
  assert.equal(generated.data.v26.wholeRepositoryProductionSatisfactionProof.proceduralGateClosure, true);
  assert.equal(generated.data.v26.v26TotalClosureProof.passed, true);
  assert.equal(generated.data.v26.v26TotalClosureProof.closureClaim, true);
  assert.equal(generated.data.v26.v26TotalClosureProof.proceduralGateClosure, true);
  assert.equal(generated.data.v26.v26TotalClosureProof.queueRowCount, 6);
  assert.equal(generated.data.v26.v26TotalClosureProof.closedQueueRowCount, 6);
  assert.deepEqual(generated.data.v26.v26TotalClosureProof.openQueueRows, []);
  assert.deepEqual(generated.data.v26.v26TotalClosureProof.notReadyFor, []);
  assert.equal(
    generated.data.v26.gateCheckpointReport.secondGate.checks.some(
      (check) => check.checkId === 'second-gate-documentation-carriers' && check.passed === true,
    ),
    true,
  );
  assert.equal(generated.data.v26.gateCheckpointReport.thirdGate.passed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.passed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.passed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.reopened, false);
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.promotedClosed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.promotionStatus, 'promoted-closed');
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.materialProofsPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.reclosureReviewPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.proceduralClosurePassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fourthGate.acceptanceBlockedByReopenedPromotion, false);
  assert.equal(
    generated.data.v26.gateCheckpointReport.fourthGate.checks.some(
      (check) => check.checkId === 'fourth-gate-reclosure-review' && check.passed === true,
    ),
    true,
  );
  assert.equal(
    generated.data.v26.gateCheckpointReport.fourthGate.checks.some(
      (check) => check.checkId === 'fourth-gate-promotion-honesty' && check.passed === true,
    ),
    true,
  );
  assert.equal(
    generated.data.v26.gateCheckpointReport.fourthGate.checks.some(
      (check) => check.checkId === 'fourth-gate-promoted-closed' && check.passed === true,
    ),
    true,
  );
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.passed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.open, false);
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.sourceToSharesProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.closureDeepeningProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.closureProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.proceduralClosurePassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.promotionStatus, 'promoted-closed');
  assert.equal(generated.data.v26.gateCheckpointReport.fifthGate.closureDeepened, true);
  assert.equal(
    generated.data.v26.gateCheckpointReport.fifthGate.checks.some(
      (check) => check.checkId === 'fifth-gate-closure-proof' && check.passed === true,
    ),
    true,
  );
  assert.equal(generated.data.v26.gateCheckpointReport.thirdGatePreparation.prepared, true);
  assert.equal(generated.data.v26.gateCheckpointReport.sixthGate.prepared, true);
  assert.equal(generated.data.v26.gateCheckpointReport.sixthGate.passed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.sixthGate.open, false);
  assert.equal(generated.data.v26.gateCheckpointReport.sixthGate.closureProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.sixthGate.proceduralClosurePassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.sixthGate.promotionStatus, 'promoted-closed');
  assert.equal(generated.data.v26.gateCheckpointReport.seventhGate.prepared, true);
  assert.equal(generated.data.v26.gateCheckpointReport.seventhGate.passed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.seventhGate.open, false);
  assert.equal(generated.data.v26.gateCheckpointReport.seventhGate.closureProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.seventhGate.proceduralClosurePassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.seventhGate.promotionStatus, 'promoted-closed');
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.prepared, true);
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.passed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.open, false);
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.promptSpaceCompletenessProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.wholeRepositoryProductionSatisfactionProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.closureProofPassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.proceduralClosurePassed, true);
  assert.equal(generated.data.v26.gateCheckpointReport.eighthGate.promotionStatus, 'promoted-closed');
  assert.equal(generated.data.aggregate.fullyProven, true);
  assert.deepEqual(Object.keys(generated.artifacts).sort(), [
    '.bitcode/terminal-composition-proof.json',
    '.bitcode/conversations-continuity-proof.json',
    '.bitcode/environment-mode-coherence-proof.json',
    '.bitcode/fifth-gate-closure-deepening-proof.json',
    '.bitcode/fifth-gate-closure-proof.json',
    '.bitcode/fourth-gate-reclosure-review-proof.json',
    '.bitcode/inference-implementation-records-proof.json',
    '.bitcode/persistence-schema-totality-proof.json',
    '.bitcode/prompt-space-completeness-proof.json',
    '.bitcode/prompt-system-totality-proof.json',
    '.bitcode/retained-package-admissibility-proof.json',
    '.bitcode/runs-pipelines-totality-proof.json',
    '.bitcode/seventh-gate-commercial-testnet-launch-proof.json',
    '.bitcode/sixth-gate-mvp-closure-proof.json',
    '.bitcode/source-to-shares-fifth-gate-proof.json',
    '.bitcode/system-reform-admissibility-proof.json',
    '.bitcode/v26-canonical-input-report.json',
    '.bitcode/v26-gate-checkpoint-report.json',
    '.bitcode/v26-product-readiness-audit.json',
    '.bitcode/v26-spec-family-report.json',
    '.bitcode/v26-total-closure-proof.json',
    '.bitcode/whole-repository-production-satisfaction-proof.json'
  ]);
  assert.ok(generated.markdown.includes('# Bitcode Spec V26 Proven'));
  assert.ok(generated.markdown.includes('## V26 Productionizing Draft and Canon Reports'));
  assert.ok(generated.markdown.includes('### V26 Gate Checkpoint Report'));
  assert.ok(generated.markdown.includes('### V26 Terminal Composition Proof'));
  assert.ok(generated.markdown.includes('### V26 Environment Mode Coherence Proof'));
  assert.ok(generated.markdown.includes('### V26 Conversations Continuity Proof'));
  assert.ok(generated.markdown.includes('### V26 Runs and Pipelines Totality Proof'));
  assert.ok(generated.markdown.includes('### V26 Persistence and Schema Totality Proof'));
  assert.ok(generated.markdown.includes('### V26 Prompt System Totality Proof'));
  assert.ok(generated.markdown.includes('### V26 Inference Implementation Records Proof'));
  assert.ok(generated.markdown.includes('### V26 Fourth-Gate Reclosure Review Proof'));
  assert.ok(generated.markdown.includes('### V26 Source-To-Shares Fifth-Gate Proof'));
  assert.ok(generated.markdown.includes('### V26 Product Readiness Audit'));
  assert.ok(generated.markdown.includes('### V26 Fifth-Gate Closure Deepening Proof'));
  assert.ok(generated.markdown.includes('### V26 Fifth-Gate Closure Proof'));
  assert.ok(generated.markdown.includes('### V26 Sixth-Gate MVP Closure Proof'));
  assert.ok(generated.markdown.includes('### V26 Seventh-Gate Commercial Testnet Launch Proof'));
  assert.ok(generated.markdown.includes('### V26 Prompt Space Completeness Witness'));
  assert.ok(generated.markdown.includes('### V26 Retained Package Admissibility Proof'));
  assert.ok(generated.markdown.includes('### V26 System Reform Admissibility Proof'));
  assert.ok(generated.markdown.includes('### V26 Whole Repository Production Satisfaction Witness'));
  assert.ok(generated.markdown.includes('### V26 Total Closure Witness'));
  assert.ok(generated.markdown.includes('V26 fully proven: ready for canonical promotion'));
  assert.ok(generated.markdown.includes('terminal-native-full-page'));
  assert.ok(generated.markdown.includes('.bitcode/terminal-composition-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/conversations-continuity-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/environment-mode-coherence-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/fourth-gate-reclosure-review-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/fifth-gate-closure-deepening-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/fifth-gate-closure-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/sixth-gate-mvp-closure-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/seventh-gate-commercial-testnet-launch-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/inference-implementation-records-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/source-to-shares-fifth-gate-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/v26-product-readiness-audit.json'));
  assert.ok(generated.markdown.includes('.bitcode/runs-pipelines-totality-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/persistence-schema-totality-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/prompt-space-completeness-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/prompt-system-totality-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/retained-package-admissibility-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/system-reform-admissibility-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/v26-total-closure-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/whole-repository-production-satisfaction-proof.json'));
  assert.ok(generated.markdown.includes('.bitcode/v26-spec-family-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v26-canonical-input-report.json'));
  assert.ok(generated.markdown.includes('.bitcode/v26-gate-checkpoint-report.json'));
  assert.ok(generated.markdown.includes('BITCODE_SPEC_V26_PROVEN.md'));
});

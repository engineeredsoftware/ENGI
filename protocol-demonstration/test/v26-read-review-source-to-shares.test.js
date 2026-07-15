import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

import {
  buildInitialState,
  measureReadFromScenario,
  reviewReadForFitSearch,
  runMakeBitcodeBranch
} from '../src/bitcode-demo.js';
import { createAppContext } from '../server.js';

function parseBranchArtifact(latestRun, path) {
  return JSON.parse(latestRun.branchArtifacts.files[path]);
}

test('V26 read measurement emits a reviewable Read before fit search admission', () => {
  const state = buildInitialState();
  const measurement = measureReadFromScenario(state.readScenarios[0]);
  const reviewableRead = measurement.reviewableRead;

  assert.equal(reviewableRead.protocolFocus, 'source-to-shares');
  assert.equal(reviewableRead.reviewStage, 'post-measurement-pre-fit');
  assert.equal(reviewableRead.status, 'ready-for-review');
  assert.deepEqual(reviewableRead.allowedActions, ['accept', 'reject', 'remeasure-with-feedback']);
  assert.equal(reviewableRead.fitSearchAdmission.admitted, false);
  assert.ok(reviewableRead.measurementRefs.measurementHash.startsWith('sha256:'));

  const rejected = reviewReadForFitSearch(reviewableRead, {
    action: 'reject',
    feedback: ['Measured Read is too broad for source-to-shares fit search.']
  });
  assert.equal(rejected.status, 'rejected');
  assert.equal(rejected.fitSearchAdmission.admitted, false);
  assert.match(rejected.reviewDecision.feedback[0], /too broad/u);

  const remeasure = reviewReadForFitSearch(reviewableRead, {
    action: 'remeasure-with-feedback',
    feedback: ['Narrow touched paths and closure criteria before fitting.']
  });
  assert.equal(remeasure.status, 'remeasure-requested');
  assert.equal(remeasure.fitSearchAdmission.admitted, false);

  const accepted = reviewReadForFitSearch(reviewableRead, { action: 'accept' });
  assert.equal(accepted.status, 'accepted');
  assert.equal(accepted.fitSearchAdmission.admitted, true);
  assert.equal(accepted.reviewDecision.transition.to, 'find-fitting-settlement-admitted');
});

test('V26 branch runs materialize accepted read review before ranking and AssetPack fitting', () => {
  const { latestRun } = runMakeBitcodeBranch(buildInitialState());
  const readReview = parseBranchArtifact(latestRun, '.bitcode/read-review.json');
  const telemetry = parseBranchArtifact(latestRun, '.bitcode/pipeline-telemetry.json');
  const eventStages = telemetry.events.map((event) => event.stage);

  assert.equal(latestRun.readReview.status, 'accepted');
  assert.equal(readReview.status, 'accepted');
  assert.equal(readReview.protocolFocus, 'source-to-shares');
  assert.equal(readReview.reviewStage, 'post-measurement-pre-fit');
  assert.equal(readReview.fitSearchAdmission.admitted, true);
  assert.ok(latestRun.branchArtifacts.files['.bitcode/read-review.json']);
  assert.ok(latestRun.readMeasurement.reviewableRead.reviewableReadHash);
  assert.ok(latestRun.readMeasurement.readReview.proofHash);
  assert.ok(eventStages.indexOf('read-measurement') < eventStages.indexOf('read-review'));
  assert.ok(eventStages.indexOf('read-review') < eventStages.indexOf('recall-and-ranking'));
});

test('V26 app context exposes reviewable Read API and blocks explicit non-accept fit search', () => {
  const app = createAppContext({
    dataPath: `/tmp/bitcode-read-review-${Date.now()}.json`
  });
  app.ensureState();

  const preview = app.getReadReview({});
  assert.equal(preview.protocolFocus, 'source-to-shares');
  assert.equal(preview.reviewableRead.status, 'ready-for-review');
  assert.equal(preview.fitSearchAdmission.admitted, false);
  assert.equal(preview.readFittingReview.artifactKind, 'bitcode-read-fitting-review');
  assert.equal(preview.readFittingReview.requiredBefore, 'find-fitting-settlement');
  assert.equal(preview.readFittingReview.settlementReview.reviewStage, 'present-fit-for-settlement-review');
  assert.equal(
    preview.readFittingReview.settlementReview.quantizedObjectiveContractId,
    'bitcode.source-to-shares.quantized-fit-quality-oc.v26'
  );

  const remeasure = app.reviewRead({
    readReviewAction: 'remeasure-with-feedback',
    readReviewFeedback: ['Narrow the source-to-shares Read before fitting.']
  });
  assert.equal(remeasure.readReview.status, 'remeasure-requested');
  assert.equal(remeasure.fitSearchAdmission.admitted, false);
  assert.equal(remeasure.readFittingReview.status, 'remeasure-requested');
  assert.equal(remeasure.readFittingReview.action, 'remeasure-with-feedback');
  assert.equal(app.readState().latestReadReview.status, 'remeasure-requested');

  assert.throws(
    () => runMakeBitcodeBranch(buildInitialState(), { readReviewAction: 'reject' }),
    /fit search cannot proceed/u
  );
});

test('V26 settlement review and receipts show quantized source-to-shares fit qualities', () => {
  const { latestRun } = runMakeBitcodeBranch(buildInitialState());
  const sourceToShares = latestRun.sourceToSharesArtifact;
  const settlementPreview = latestRun.settlementPreview;
  const settlementProof = parseBranchArtifact(latestRun, '.bitcode/settlement-source-to-shares-proof.json');
  const proofWitnessManifest = parseBranchArtifact(latestRun, '.bitcode/proof-witness-manifest.json');
  const objectiveId = 'bitcode.source-to-shares.quantized-fit-quality-oc.v26';

  assert.equal(sourceToShares.protocolFocus, 'source-to-shares');
  assert.equal(sourceToShares.quantizedObjectiveContractId, objectiveId);
  assert.equal(sourceToShares.quantizedFitQualities.objectiveContractId, objectiveId);
  assert.ok(sourceToShares.quantizedFitQualities.qualities.length >= 5);
  assert.ok(sourceToShares.quantizedFitQualities.fitQualityHash.startsWith('sha256:'));

  assert.equal(settlementPreview.reviewStage, 'present-fit-for-settlement-review');
  assert.equal(settlementPreview.presentFitForSettlementReview.objectiveContractId, objectiveId);
  assert.equal(settlementPreview.presentFitForSettlementReview.fitQualities.fitQualityHash, sourceToShares.quantizedFitQualities.fitQualityHash);
  assert.ok(settlementPreview.presentFitForSettlementReview.receiptRefs.length >= 3);

  assert.ok(settlementPreview.receipts.every((receipt) => receipt.quantizedObjectiveContractId === objectiveId));
  assert.ok(settlementPreview.receipts.every((receipt) => receipt.quantizedFitQualities?.fitQualityHash === sourceToShares.quantizedFitQualities.fitQualityHash));
  assert.ok(settlementPreview.receipts.some((receipt) => receipt.receiptKind === 'settlement-asset-pack-fit-quality'));

  const qualityTheorem = settlementProof.theoremVerdicts.find((entry) => entry.theoremId === 'settlement_source_to_shares.quantized_fit_quality_receipting');
  assert.equal(qualityTheorem?.passed, true);
  assert.ok(settlementProof.witnessArtifactPaths.includes('.bitcode/settlement-preview.json'));
  assert.ok(proofWitnessManifest.artifactDigestByPath['.bitcode/settlement-preview.json'].proofFamilies.includes('settlement-source-to-shares'));
});

test('V26 Read-fitting Exchange and Terminal source stays TypeScript-owned without generated JS mirrors', () => {
  [
    'apps/uapi/app/api/read-review/route.js',
    'apps/uapi/app/api/make-bitcode-branch/route.js',
    'apps/uapi/app/api/state/route.js',
    'apps/uapi/lib/bitcode-app-context.js',
    'apps/uapi/hooks/useExecutionState.js',
    'apps/uapi/tests/api/readReviewRoute.test.js',
    'apps/uapi/tests/api/readReviewProtocolParity.test.js',
    'apps/uapi/tests/api/executionsHistoryWriteReadParity.test.js',
    'apps/uapi/tests/terminalReadScenarios.test.js',
    'apps/uapi/tests/terminalClosureState.test.js'
  ].forEach((sourcePath) => {
    assert.equal(existsSync(sourcePath), false, `${sourcePath} must not be emitted beside TypeScript source`);
  });
});

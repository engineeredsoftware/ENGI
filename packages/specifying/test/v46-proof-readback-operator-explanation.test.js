import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V46_PROOF_READBACK_EVIDENCE_CLASS_IDS,
  V46_PROOF_READBACK_OPERATOR_DECISION_IDS,
  V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH,
  V46_PROOF_READBACK_OPERATOR_EXPLANATION_ROWS,
  V46_PROOF_READBACK_OPERATOR_EXPLANATION_SCHEMA_ID,
  V46_PROOF_READBACK_OPERATOR_EXPLANATION_SOURCE_SAFETY_VERDICT,
  V46_PROOF_READBACK_REQUIRED_OPERATOR_QUESTION_IDS,
  buildV46ProofReadbackOperatorExplanation,
} from '../src/canonical/v46-proof-readback-operator-explanation.js';

test('V46 proof readback operator explanation binds all evidence classes', () => {
  const report = buildV46ProofReadbackOperatorExplanation();

  assert.equal(
    V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH,
    '.bitcode/v46-proof-readback-operator-explanation.json',
  );
  assert.equal(report.artifactId, 'v46-proof-readback-operator-explanation');
  assert.equal(report.schemaId, V46_PROOF_READBACK_OPERATOR_EXPLANATION_SCHEMA_ID);
  assert.equal(report.version, 'V46');
  assert.equal(report.currentTarget, 'V45');
  assert.equal(report.sourceSafetyVerdict, V46_PROOF_READBACK_OPERATOR_EXPLANATION_SOURCE_SAFETY_VERDICT);
  assert.deepEqual(report.evidenceClassIds, [...V46_PROOF_READBACK_EVIDENCE_CLASS_IDS]);
  assert.deepEqual(report.operatorQuestionIds, [...V46_PROOF_READBACK_REQUIRED_OPERATOR_QUESTION_IDS]);
  assert.deepEqual(report.operatorDecisionIds, [...V46_PROOF_READBACK_OPERATOR_DECISION_IDS]);
  assert.equal(report.proofReadbackRows.length, V46_PROOF_READBACK_OPERATOR_EXPLANATION_ROWS.length);
  assert.equal(report.coverage.allEvidenceClassesCovered, true);
  assert.equal(report.coverage.allAuthorityIdsKnown, true);
  assert.equal(report.coverage.allClaimIdsKnown, true);
  assert.equal(report.coverage.allOperatorQuestionsCovered, true);
  assert.equal(report.coverage.sourceFilesPresent, true);
  assert.equal(report.coverage.rowsMissingRequiredCopy.length, 0);
  assert.equal(report.passed, true);
});

test('V46 proof readback operator explanation preserves source-safe authority boundaries', () => {
  const report = buildV46ProofReadbackOperatorExplanation();

  assert.equal(report.coverage.noParallelStateAuthority, true);
  assert.equal(report.coverage.stateAdvanceRequiresProofRoot, true);
  assert.equal(report.coverage.telemetryObservabilityOnly, true);
  assert.equal(report.coverage.databaseProjectionNotLedgerTruth, true);
  assert.equal(report.coverage.paymentObservationNotFinality, true);
  assert.equal(report.coverage.repositoryDeliveryRequiresEntitlement, true);
  assert.equal(report.coverage.repairFailsClosed, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.interpolatedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.valueBearingMainnetAdmitted, false);
  assert.deepEqual(report.coverage.forbiddenPhraseHits, []);
  assert.deepEqual(report.coverage.secretMarkerHits, []);
});

test('V46 proof readback rows keep evidence authority distinct', () => {
  const report = buildV46ProofReadbackOperatorExplanation();
  const rowByClass = new Map(report.proofReadbackRows.map((row) => [row.evidenceClassId, row]));

  assert.equal(rowByClass.get('ledger_journal')?.authorityIds.includes('ledger-readback'), true);
  assert.equal(rowByClass.get('database_projection')?.cannotAuthorize.includes('Cannot override ledger finality'), true);
  assert.equal(rowByClass.get('object_storage_root')?.repairStates.includes('object_storage_root_mismatch'), true);
  assert.equal(rowByClass.get('telemetry_stream')?.authorityIds.includes('telemetry-observability-only'), true);
  assert.equal(rowByClass.get('wallet_provider_receipt')?.cannotAuthorize.includes('final settlement'), true);
  assert.equal(rowByClass.get('repository_delivery_receipt')?.canAuthorize.includes('entitled repository delivery'), true);
  assert.equal(rowByClass.get('repair_reconciliation_receipt')?.conflictBehavior.includes('fails-closed'), true);

  for (const row of report.proofReadbackRows) {
    assert.equal(row.noParallelStateAuthority, true);
    assert.equal(row.stateAdvanceRequiresProofRoot, true);
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.ok(row.rowRoot.startsWith('v46-proof-readback-row:'));
    assert.ok(row.operatorQuestionIds.length >= V46_PROOF_READBACK_REQUIRED_OPERATOR_QUESTION_IDS.length);
  }
});

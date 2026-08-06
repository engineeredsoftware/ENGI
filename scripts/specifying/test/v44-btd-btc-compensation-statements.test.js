import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V44_BTC_SETTLEMENT_ACCOUNTING_STATE_IDS,
  V44_BTD_BTC_ACCOUNTING_STATE_IDS,
  V44_BTD_BTC_COMPENSATION_OBJECT_IDS,
  V44_BTD_BTC_COMPENSATION_ROWS,
  V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH,
  V44_BTD_BTC_COMPENSATION_STATEMENTS_SCHEMA_ID,
  V44_BTD_BTC_COMPENSATION_STATEMENTS_SOURCE_SAFETY_VERDICT,
  V44_BTD_BTC_COMPENSATION_VALUE_LABEL_IDS,
  V44_BTD_RANGE_ACCOUNTING_STATE_IDS,
  V44_CONTRIBUTOR_COMPENSATION_STATE_IDS,
  buildV44BtdBtcCompensationStatements,
} from '../src/canonical/v44-btd-btc-compensation-statements.js';

test('V44 BTD/BTC compensation statements artifact is source-safe and complete', () => {
  const artifact = buildV44BtdBtcCompensationStatements();

  assert.equal(V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH, '.proofs/v44/btd-btc-compensation-statements.json');
  assert.equal(artifact.artifactId, 'v44-btd-btc-compensation-statements');
  assert.equal(artifact.schemaId, V44_BTD_BTC_COMPENSATION_STATEMENTS_SCHEMA_ID);
  assert.equal(artifact.version, 'V44');
  assert.equal(artifact.currentTarget, 'V43');
  assert.equal(artifact.sourceSafetyVerdict, V44_BTD_BTC_COMPENSATION_STATEMENTS_SOURCE_SAFETY_VERDICT);
  assert.equal(artifact.passed, true);
  assert.match(artifact.artifactRoot, /^v44-btd-btc-compensation-statements:/);
  assert.deepEqual(artifact.objectIds, [...V44_BTD_BTC_COMPENSATION_OBJECT_IDS]);
  assert.deepEqual(artifact.accountingStateIds, [...V44_BTD_BTC_ACCOUNTING_STATE_IDS]);
  assert.deepEqual(artifact.btdRangeStateIds, [...V44_BTD_RANGE_ACCOUNTING_STATE_IDS]);
  assert.deepEqual(artifact.btcSettlementStateIds, [...V44_BTC_SETTLEMENT_ACCOUNTING_STATE_IDS]);
  assert.deepEqual(artifact.contributorCompensationStateIds, [...V44_CONTRIBUTOR_COMPENSATION_STATE_IDS]);
  assert.deepEqual(artifact.valueLabelIds, [...V44_BTD_BTC_COMPENSATION_VALUE_LABEL_IDS]);
  assert.equal(artifact.coverage.btdBtcCompensationStatementsImplemented, true);
  assert.equal(artifact.coverage.btdRangeStateImplemented, true);
  assert.equal(artifact.coverage.btcSettlementObservationImplemented, true);
  assert.equal(artifact.coverage.sourceToSharesContributorStatementsImplemented, true);
  assert.equal(artifact.coverage.depositorEarningSummariesImplemented, true);
  assert.equal(artifact.coverage.treasuryRoutesImplemented, true);
  assert.equal(artifact.coverage.reconciliationStatementImplemented, true);
  assert.equal(artifact.coverage.repairStatementImplemented, true);
  assert.equal(artifact.coverage.packsAccountingReadbackImplemented, true);
  assert.equal(artifact.coverage.sourceSafeMetadataOnly, true);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.rawSourceTextVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.rawPromptVisible, false);
  assert.equal(artifact.coverage.rawProviderResponseVisible, false);
  assert.equal(artifact.coverage.walletPrivateMaterialVisible, false);
  assert.equal(artifact.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(artifact.coverage.valueBearingMainnetAdmitted, false);
});

test('V44 BTD/BTC compensation rows bind accounting, UI, and primitive evidence', () => {
  const artifact = buildV44BtdBtcCompensationStatements();
  const rowIds = artifact.rows.map((row) => row.rowId);

  assert.equal(artifact.rows.length, V44_BTD_BTC_COMPENSATION_ROWS.length);
  assert.ok(rowIds.includes('btd-range-accounting'));
  assert.ok(rowIds.includes('btc-settlement-observation'));
  assert.ok(rowIds.includes('source-to-shares-contributor-statements'));
  assert.ok(rowIds.includes('packs-accounting-readback'));

  for (const row of artifact.rows) {
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.ok(row.rowRoot.startsWith('v44-btd-btc-compensation-row:'));
    assert.ok(row.requiredFields.length > 0);
  }
});

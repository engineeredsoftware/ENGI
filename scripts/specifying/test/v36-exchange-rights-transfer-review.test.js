import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES,
  EXCHANGE_RIGHTS_TRANSFER_REQUIRED_FIELD_IDS,
  EXCHANGE_RIGHTS_TRANSFER_REVIEW_ARTIFACT_PATH,
  buildExchangeRightsTransferReview,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V36 ExchangeRightsTransferPreview rows', () => {
  const review = buildExchangeRightsTransferReview({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(review.artifactId, 'v36-exchange-rights-transfer-review');
  assert.equal(review.schemaId, 'bitcode.v36.exchangeRightsTransferReview.v1');
  assert.equal(review.version, 'V36');
  assert.equal(review.currentTarget, 'V35');
  assert.equal(review.passed, true);
  assert.equal(review.sourceSafetyVerdict, 'source-safe-exchange-rights-transfer-review-metadata');
  assert.equal(review.coverage.previewCount, EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES.length);
  assert.deepEqual(review.coverage.missingRequiredPreviewStates, []);
  assert.equal(review.coverage.allRequiredPreviewStatesCovered, true);
  assert.equal(review.coverage.ownerReadRepresented, true);
  assert.equal(review.coverage.licensedReadRepresented, true);
  assert.equal(review.coverage.blockedTransferRepresented, true);
  assert.equal(review.coverage.btdRangeIdentityCovered, true);
  assert.equal(review.coverage.settlementUnlockConditionsCovered, true);
  assert.equal(review.coverage.disclosureLimitsCovered, true);
  assert.equal(review.coverage.assetPackSourceHiddenUntilPaidSettlementAndRightsTransferComplete, true);
  assert.equal(review.coverage.proofRootsCovered, true);
  assert.equal(review.coverage.eventIdsCovered, true);
  assert.equal(review.coverage.ledgerDatabaseProjectionRefsCovered, true);
  assert.equal(review.coverage.credentialsSerialized, false);
  assert.equal(review.coverage.privateWalletMaterialSerialized, false);
  assert.equal(review.coverage.protectedSourceVisible, false);
  assert.equal(review.coverage.unpaidAssetPackSourceVisible, false);
  assert.match(review.artifactRoot, /^exchange-rights-transfer-review:[a-f0-9]{24}$/u);
  assert.deepEqual(review.requiredPreviewStates, EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES);
  assert.deepEqual(review.requiredFieldIds, EXCHANGE_RIGHTS_TRANSFER_REQUIRED_FIELD_IDS);

  for (const previewState of EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES) {
    assert.equal(review.rows.some((row) => row.previewState === previewState), true, `missing ${previewState}`);
  }

  for (const row of review.rows) {
    assert.equal(row.canonicalObject, 'ExchangeRightsTransferPreview');
    assert.match(row.previewRoot, /^exchange-rights-transfer-preview:[a-f0-9]{24}$/u);
    assert.equal(row.btdRangeIdentity.rangeIdentityClass, 'non_fungible_source_share_range');
    assert.equal(row.btdRangeIdentity.sourceShareFungibility, 'not_fungible');
    assert.equal(row.currentOwnerPrincipal.startsWith('principal:'), true);
    assert.equal(row.requestedBuyerPrincipal.startsWith('principal:'), true);
    assert.equal(row.rightsScope.length > 0, true);
    assert.equal(row.settlementUnlockCondition.length > 0, true);
    assert.equal(row.disclosureLimit.length > 0, true);
    assert.equal(
      row.sourceSafetyPosture,
      'assetpack_source_hidden_until_paid_settlement_and_rights_transfer_complete',
    );
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.ledgerDatabaseProjectionRefs.projectionTrust, 'ledger_journal_outranks_database_projection');
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^exchange-proof:[a-f0-9]{24}$/u);
    }
  }

  assert.equal(EXCHANGE_RIGHTS_TRANSFER_REVIEW_ARTIFACT_PATH, '.bitcode/v36-exchange-rights-transfer-review.json');
});

test('distinguishes owner-read licensed-read and blocked transfer preview states', () => {
  const review = buildExchangeRightsTransferReview({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const ownerRead = review.rows.find((row) => row.previewState === 'owner_read');
  const licensedRead = review.rows.find((row) => row.previewState === 'licensed_read');
  const blockedTransfer = review.rows.find((row) => row.previewState === 'blocked_transfer');

  assert.ok(ownerRead);
  assert.equal(ownerRead.transferDecision, 'owner_read_no_transfer_required');
  assert.equal(ownerRead.sourceVisibility.includes('never_discloses_source'), true);

  assert.ok(licensedRead);
  assert.equal(licensedRead.transferDecision, 'licensed_read_requires_settlement_unlock_before_delivery');
  assert.equal(licensedRead.settlementUnlockCondition.includes('paid_btc_read_license'), true);
  assert.equal(licensedRead.sourceVisibility, 'hidden_until_paid_settlement_and_read_license_receipt');

  assert.ok(blockedTransfer);
  assert.equal(blockedTransfer.transferDecision, 'blocked_transfer');
  assert.equal(blockedTransfer.failClosedConditions.includes('policy_denial'), true);
  assert.equal(blockedTransfer.settlementUnlockCondition.includes('blocked_no_payment_or_delivery'), true);
  assert.equal(review.disclosureBoundary.rightsTransferPreviewMustNotExpose.includes('unpaid_assetpack_source'), true);
  assert.equal(review.sourceEvidence.every((entry) => entry.allSourceRootsPresent), true);
});

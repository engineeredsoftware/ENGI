import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  EXCHANGE_ACTIVITY_BOOK_ARTIFACT_PATH,
  EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS,
  EXCHANGE_ACTIVITY_FILTER_IDS,
  EXCHANGE_ACTIVITY_KINDS,
  buildExchangeActivityBook,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V36 ExchangeActivityBook rows', () => {
  const activityBook = buildExchangeActivityBook({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(activityBook.artifactId, 'v36-exchange-activity-book');
  assert.equal(activityBook.schemaId, 'bitcode.v36.exchangeActivityBook.v1');
  assert.equal(activityBook.version, 'V36');
  assert.equal(activityBook.currentTarget, 'V35');
  assert.equal(activityBook.passed, true);
  assert.equal(activityBook.sourceSafetyVerdict, 'source-safe-exchange-activity-book-metadata');
  assert.equal(activityBook.coverage.activityRowCount, EXCHANGE_ACTIVITY_KINDS.length);
  assert.deepEqual(activityBook.coverage.missingRequiredActivityKinds, []);
  assert.deepEqual(activityBook.coverage.missingSourceRoots, []);
  assert.equal(activityBook.coverage.allRequiredActivityKindsCovered, true);
  assert.equal(activityBook.coverage.allDetailSectionsCovered, true);
  assert.equal(activityBook.coverage.proofRootsCovered, true);
  assert.equal(activityBook.coverage.eventIdsCovered, true);
  assert.equal(activityBook.coverage.detailPayloadsCovered, true);
  assert.equal(activityBook.coverage.ledgerDatabaseProjectionRefsCovered, true);
  assert.equal(activityBook.coverage.credentialsSerialized, false);
  assert.equal(activityBook.coverage.protectedSourceVisible, false);
  assert.equal(activityBook.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(activityBook.coverage.legacySourceRoots, false);
  assert.match(activityBook.artifactRoot, /^exchange-activity-book:[a-f0-9]{24}$/u);

  for (const activityKind of EXCHANGE_ACTIVITY_KINDS) {
    assert.equal(activityBook.rows.some((row) => row.activityKind === activityKind), true, `missing ${activityKind}`);
  }

  for (const row of activityBook.rows) {
    assert.match(row.rowRoot, /^exchange-activity-row:[a-f0-9]{24}$/u);
    assert.match(row.detailRoot, /^exchange-activity-detail:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_exchange_market_metadata');
    assert.equal(row.sourceSafetyPosture, 'activity_detail_never_exposes_protected_source_or_unpaid_assetpack_content');
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'), true);
    assert.equal(row.detailPayload.expandedDetailSections.length, EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS.length);
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const filterId of EXCHANGE_ACTIVITY_FILTER_IDS) {
      assert.equal(Object.hasOwn(row.filterValues, filterId), true, `missing ${filterId} on ${row.activityId}`);
    }
    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^exchange-proof:[a-f0-9]{24}$/u);
    }
  }
});

test('keeps market activity detail source-safe across settlement and repair rows', () => {
  const activityBook = buildExchangeActivityBook({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const settlement = activityBook.rows.find((row) => row.activityKind === 'settlement');
  const repair = activityBook.rows.find((row) => row.activityKind === 'repair');
  const revenueRoute = activityBook.rows.find((row) => row.activityKind === 'revenue_route');

  assert.ok(settlement);
  assert.equal(settlement.assetPackRef.sourceVisibility, 'delivered_only_after_paid_rights_transfer');
  assert.equal(settlement.proofRootFields.includes('btcFeeRoot'), true);
  assert.equal(settlement.proofRootFields.includes('btdRightsRoot'), true);
  assert.equal(settlement.eventIds.includes('ledger.finality.observed'), true);
  assert.equal(settlement.ledgerDatabaseProjectionRefs.projectionTrust, 'ledger_outranks_database_projection');

  assert.ok(repair);
  assert.equal(repair.filterValues.repair_state, 'open');
  assert.equal(repair.proofRootFields.includes('repairCommandRoot'), true);
  assert.equal(repair.eventIds.includes('repair.job.queued'), true);

  assert.ok(revenueRoute);
  assert.equal(revenueRoute.proofRootFields.includes('revenueRouteRoot'), true);
  assert.equal(revenueRoute.proofRootFields.includes('conservationRoot'), true);
  assert.equal(revenueRoute.detailPayload.expandedDetailSections.some((section) => section.sectionId === 'repair_and_revenue_posture'), true);
  assert.equal(activityBook.disclosureBoundary.marketRowsMustNotExpose.includes('unpaid_assetpack_source'), true);
  assert.equal(activityBook.sourceEvidence.every((entry) => entry.allSourceRootsPresent), true);
  assert.equal(activityBook.requiredFilterIds.includes('activity_kind'), true);
  assert.equal(activityBook.requiredDetailSectionIds.includes('proof_roots'), true);
  assert.equal(EXCHANGE_ACTIVITY_BOOK_ARTIFACT_PATH, '.bitcode/v36-exchange-activity-book.json');
});

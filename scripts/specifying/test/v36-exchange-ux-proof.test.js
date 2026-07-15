import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  EXCHANGE_UX_CAPABILITY_IDS,
  EXCHANGE_UX_PROOF_ARTIFACT_PATH,
  EXCHANGE_UX_PROOF_SOURCE_SAFETY_VERDICT,
  EXCHANGE_UX_ROUTE_IDS,
  EXCHANGE_UX_SOURCE_SAFE_DETAIL_IDS,
  buildExchangeUxProof,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds the source-safe V36 Exchange UX proof', () => {
  const report = buildExchangeUxProof({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v36-exchange-ux-proof');
  assert.equal(report.schemaId, 'bitcode.v36.exchangeUxProof.v1');
  assert.equal(report.version, 'V36');
  assert.equal(report.currentTarget, 'V35');
  assert.equal(report.sourceSafetyVerdict, EXCHANGE_UX_PROOF_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.equal(report.coverage.capabilityCount, EXCHANGE_UX_CAPABILITY_IDS.length);
  assert.deepEqual(report.requiredCapabilityIds, EXCHANGE_UX_CAPABILITY_IDS);
  assert.deepEqual(report.requiredRouteIds, EXCHANGE_UX_ROUTE_IDS);
  assert.deepEqual(report.requiredSourceSafeDetailIds, EXCHANGE_UX_SOURCE_SAFE_DETAIL_IDS);
  assert.deepEqual(report.coverage.missingCapabilityIds, []);
  assert.equal(report.coverage.allRequiredCapabilitiesCovered, true);
  assert.equal(report.coverage.masterDetailCovered, true);
  assert.equal(report.coverage.filtersCovered, true);
  assert.equal(report.coverage.orderHistoryCovered, true);
  assert.equal(report.coverage.rightsTransferReviewCovered, true);
  assert.equal(report.coverage.pricingQuoteCovered, true);
  assert.equal(report.coverage.settlementStateCovered, true);
  assert.equal(report.coverage.repairStateCovered, true);
  assert.equal(report.coverage.terminalHandoffCovered, true);
  assert.equal(report.coverage.collapsedStatusExpandedDetailCovered, true);
  assert.equal(report.coverage.telemetryDashboardBindingCovered, true);
  assert.equal(report.coverage.routeContextPreserved, true);
  assert.equal(report.coverage.collapsedUiReadable, true);
  assert.equal(report.coverage.expandedDetailSourceSafe, true);
  assert.equal(report.coverage.proofRootsCovered, true);
  assert.equal(report.coverage.eventIdsCovered, true);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.privateWalletMaterialSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.equal(report.coverage.allSourceRootsPresent, true);
  assert.equal(EXCHANGE_UX_PROOF_ARTIFACT_PATH, '.proofs/v36/exchange-ux-proof.json');
  assert.match(report.artifactRoot, /^exchange-ux-proof:[a-f0-9]{24}$/u);
});

test('names each Exchange UX capability without exposing source-bearing payloads', () => {
  const report = buildExchangeUxProof({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  for (const capabilityId of EXCHANGE_UX_CAPABILITY_IDS) {
    assert.equal(report.rows.some((row) => row.capabilityId === capabilityId), true, `missing ${capabilityId}`);
  }

  for (const row of report.rows) {
    assert.equal(row.canonicalObject, 'ExchangeUxProofCapability');
    assert.match(row.capabilityRoot, /^exchange-ux-capability:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafe, true);
    assert.equal(row.collapsedView.exposesProtectedSource, false);
    assert.equal(row.collapsedView.exposesUnpaidAssetPackSource, false);
    assert.equal(row.collapsedView.exposesPrivateWalletMaterial, false);
    assert.equal(row.expandedView.exposesProtectedSource, false);
    assert.equal(row.expandedView.exposesUnpaidAssetPackSource, false);
    assert.equal(row.expandedView.exposesPrivateWalletMaterial, false);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'), true);
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^exchange-proof-[a-z-]+:[a-f0-9]{24}$/u);
    }
  }

  assert.equal(report.rows.find((row) => row.capabilityId === 'terminal_context_handoff').routePreservesTransactionContext, true);
  assert.equal(
    report.operationalBoundary.exchangeUxCovers,
    'market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state',
  );
  assert.equal(report.operationalBoundary.terminalHandoff, 'product can hand off to Exchange without losing transaction context');
  assert.equal(report.operationalBoundary.disclosureBoundary, 'collapsed UI gives readable status and expanded UI exposes source-safe detail');
});
